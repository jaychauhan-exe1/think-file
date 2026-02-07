import { NextResponse } from "next/server";
import { embeddingModel, chatModel } from "@/lib/gemini";
import { index } from "@/lib/pinecone";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { question, filebookId } = await req.json();

    // Embed question
    const questionEmbedding = await embeddingModel.embedContent(question);

    // Query Pinecone with filters
    const queryResponse = await index.query({
      vector: questionEmbedding.embedding.values,
      topK: 5,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
        filebookId: { $eq: filebookId },
      },
    });

    const context = queryResponse.matches
      ?.map((match) => match.metadata?.text)
      .join("\n\n");

    if (!context) {
      return NextResponse.json({
        answer: "No relevant content found in this document.",
      });
    }

    const prompt = `
You are a document assistant.
Answer ONLY from the context below.
If the answer is not in the context, say it is not in the document.

Context:
${context}

Question:
${question}
`;

    const result = await chatModel.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json({ answer: response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
