import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { index } from "@/lib/pinecone";
import { embeddingModel, chatModel, TaskType } from "@/lib/gemini";
import { checkMessageLimit } from "@/lib/actions/usage";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // --- 1. Authenticate user ---
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, filebookId, documentId } = await req.json();
    if (!question || !filebookId) {
      return NextResponse.json({ error: "Missing question or filebookId" }, { status: 400 });
    }

    // --- 2. Check message limit ---
    const modelName = "gemini-2.5-flash";
    const { allowed, error: limitError } = await checkMessageLimit(modelName);
    if (!allowed) return NextResponse.json({ error: limitError }, { status: 403 });

    // --- 3. Embed question & query Pinecone ---
    const questionEmbedding = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: question }] },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: 1024,
    } as any);

    const vector = questionEmbedding.embedding.values;

    const filter: Record<string, any> = {
      filebookId: { $eq: filebookId },
      userId: { $eq: session.user.id },
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

    // --- 4. Fetch previous chat messages ---
    const chatHistory = await prisma.chatMessage.findMany({
      where: { filebookId },
      orderBy: { createdAt: "asc" },
    });

    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // --- 5. Build messages for Gemini ---
    // NOTE: First message must have role 'user'
    const messages = [
      {
        role: "user",
        parts: [{
          text: `
You are ThinkFile, an intelligent document-based assistant.

Your task is to answer the user’s question strictly using the provided document context.

Guidelines:
- Base your answer only on the information explicitly present in the context.
- Do not use prior knowledge or make assumptions beyond the document.
- If the answer is not found in the context, clearly state:
  “The requested information is not available in the provided document.”
- Keep responses clear, concise, and professional.
- If the context is ambiguous or incomplete, explain what is missing instead of guessing.

Document Context:
${context}

Question:
${question}
          `
        }]
      },
      ...formattedHistory, // previous messages (memory)
    ];

    // --- 6. Send message to Gemini ---
    const chat = chatModel.startChat({ history: messages });
    const result = await chat.sendMessage(question);
    const answer = result.response.text();

    // --- 7. Save user + assistant messages ---
    await prisma.chatMessage.createMany({
      data: [
        {
          filebookId,
          role: "user",
          content: question,
        },
        {
          filebookId,
          role: "assistant",
          content: answer,
          model: modelName,
        },
      ],
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

