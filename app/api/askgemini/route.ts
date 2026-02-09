import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { index } from "@/lib/pinecone";
import { embeddingModel, chatModel2, chatModel3, TaskType } from "@/lib/gemini";
import { checkMessageLimit } from "@/lib/actions/usage";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // --- 1. Authenticate user ---
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, filebookId, documentId, model = "gemini-2.5-flash" } = await req.json();
    if (!question || !filebookId) {
      return NextResponse.json({ error: "Missing question or filebookId" }, { status: 400 });
    }

    // Verify access
    const filebook = await prisma.filebook.findFirst({
        where: { id: filebookId },
    });

    if (!filebook) {
        return NextResponse.json({ error: "Filebook not found" }, { status: 404 });
    }

    const isOwner = filebook.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin && !filebook.isFeatured) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // --- 2. Check message limit ---
    const modelName = model;
    const { allowed, error: limitError } = await checkMessageLimit(modelName);
    if (!allowed) return NextResponse.json({ error: limitError }, { status: 403 });

    // Select actual model instance
    const activeModel = modelName.includes("2.5") ? chatModel2 : chatModel3;

    // --- 3. Embed question & query Pinecone (Parallelize embedding and history fetch) ---
    const [questionEmbedding, chatHistory] = await Promise.all([
      embeddingModel.embedContent({
        content: { role: "user", parts: [{ text: question }] },
        taskType: TaskType.RETRIEVAL_QUERY,
        outputDimensionality: 1024,
      } as any),
      prisma.chatMessage.findMany({
        where: { filebookId },
        orderBy: { createdAt: "asc" },
        take: 10, // Limit history to last 10 messages for speed
      })
    ]);

    const vector = questionEmbedding.embedding.values;

    const filter: Record<string, any> = {
      filebookId: { $eq: filebookId },
    };
    if (documentId) filter.documentId = { $eq: documentId };

    const queryResponse = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
      filter,
    });

    const context = queryResponse.matches
      ?.map((match) => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    if (!context) {
      return NextResponse.json({
        answer: documentId
          ? "I couldn't find any relevant information in the mentioned document to answer your question."
          : "I couldn't find any relevant information in the document to answer your question.",
      });
    }

    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // --- 5. Build messages for Gemini ---
    const messages = [
      {
        role: "user",
        parts: [{
          text: `
You are ThinkFile. Try Answer using the provided context.
Use reasoning to answer context-related questions even if details are incomplete.
If a question is unrelated to the context, say you cannot answer it.

Context:
${context}
          `
        }]
      },
      ...formattedHistory,
    ];

    // --- 6. Streaming response ---
    const chat = activeModel.startChat({ history: messages });
    const result = await chat.sendMessageStream(question);

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        
        // --- 7. Save messages after stream ends ---
        try {
          await prisma.chatMessage.createMany({
            data: [
              { filebookId, role: "user", content: question },
              { filebookId, role: "assistant", content: fullText, model: modelName },
            ],
          });
        } catch (dbErr) {
          console.error("Error saving streamed chat history:", dbErr);
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

