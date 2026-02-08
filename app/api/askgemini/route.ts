import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { index } from "@/lib/pinecone";
import { embeddingModel, chatModel, TaskType } from "@/lib/gemini";
import { checkMessageLimit } from "@/lib/actions/usage";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, filebookId, documentId } = await req.json();

    if (!question || !filebookId) {
      return NextResponse.json({ error: "Missing question or filebookId" }, { status: 400 });
    }

    // Check message limit
    const modelName = "gemini-2.5-flash"; // Should match chatModel.model in lib/gemini.ts
    const { allowed, error } = await checkMessageLimit(modelName);
    if (!allowed) {
      return NextResponse.json({ error }, { status: 403 });
    }

    // Embed question
    const questionEmbedding = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: question }] },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: 1024,
    } as any);
    const vector = questionEmbedding.embedding.values;

    // Build filter - optionally filter by specific document
    const filter: Record<string, any> = {
      filebookId: { $eq: filebookId },
      userId: { $eq: session.user.id },
    };
    
    // If a specific document is mentioned, filter by it
    if (documentId) {
      filter.documentId = { $eq: documentId };
    }

    // Search Pinecone
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

    const prompt = `
You are ThinkFile, an intelligent document-based assistant.

Your task is to answer the user’s question strictly using the provided document context.

Guidelines:

Base your answer only on the information explicitly present in the provided context.

Do not use prior knowledge or make assumptions beyond the document.

If the answer is not found in the context, clearly state:
“The requested information is not available in the provided document.”

If the user provides additional relevant information or clarification, use it along with the document context to answer accurately.

Keep responses clear, concise, and professional.

If the context is ambiguous or incomplete, explain what is missing instead of guessing.

Your goal is to provide accurate, document-grounded responses.

Context:
${context}

Question:
${question}

Answer:`;

    const result = await chatModel.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json({ answer: response.text() });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
