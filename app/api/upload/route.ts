import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { index } from "@/lib/pinecone";
import { embeddingModel, TaskType } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "@/lib/fileParser";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filebookId = formData.get("filebookId") as string;

    if (!file || !filebookId) {
      return NextResponse.json({ error: "Missing file or filebookId" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse file using the comprehensive file parser
    console.log(`Parsing file: ${file.name} (${file.type})`);
    const parseResult = await parseFile(buffer, file.name, file.type);

    // Check for parsing errors
    if (parseResult.error) {
      console.error("File parsing error:", parseResult.error);
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const text = parseResult.text;

    if (!text || text.trim() === "") {
      return NextResponse.json({ 
        error: "No text content found in file. The file may be empty or contain only images." 
      }, { status: 400 });
    }

    console.log(`Successfully extracted ${text.length} characters from ${file.name}`);

    // Split text into chunks (~1000 chars with some overlap for context)
    const chunkSize = 1000;
    const chunkOverlap = 100;
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        filebookId: filebookId,
      },
    });

    // Generate embeddings and prepare records for Pinecone
    const records = [];
    let successfulChunks = 0;
    let failedChunks = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embeddingResult = await embeddingModel.embedContent({
          content: { role: "user", parts: [{ text: chunk }] },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          outputDimensionality: 1024,
        } as any);
        const embedding = embeddingResult.embedding.values;

        records.push({
          id: uuidv4(),
          values: embedding,
          metadata: {
            text: chunk,
            documentId: document.id,
            documentName: file.name,
            filebookId: filebookId,
            userId: session.user.id,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        });
        successfulChunks++;
      } catch (embErr) {
        console.error(`Embedding error for chunk ${i}:`, embErr);
        failedChunks++;
      }
    }

    console.log(`Generated embeddings: ${successfulChunks} successful, ${failedChunks} failed`);

    // Upload to Pinecone
    if (records.length > 0) {
      try {
        // Pinecone v7 expects an object with 'records'
        // @ts-ignore
        await index.upsert({ records });
        console.log(`Successfully uploaded ${records.length} vectors to Pinecone`);
      } catch (pineconeErr) {
        console.error("Pinecone upload error:", pineconeErr);
        // Delete the document if Pinecone upload fails
        await prisma.document.delete({ where: { id: document.id } });
        return NextResponse.json({ 
          error: "Failed to store document embeddings. Please try again." 
        }, { status: 500 });
      }
    } else {
      // No successful embeddings, delete the document
      await prisma.document.delete({ where: { id: document.id } });
      return NextResponse.json({ 
        error: "Failed to generate embeddings for the document" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      documentId: document.id,
      chunksProcessed: successfulChunks,
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
