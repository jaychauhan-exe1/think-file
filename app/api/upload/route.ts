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

    // Verify ownership or admin
    const filebook = await prisma.filebook.findFirst({
        where: { id: filebookId },
    });

    if (!filebook) {
        return NextResponse.json({ error: "Filebook not found" }, { status: 404 });
    }

    if (filebook.userId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized: Only the owner can upload documents" }, { status: 403 });
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 2MB limit" }, { status: 400 });
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

    // Split text into chunks (~4000 chars with some overlap for context)
    const chunkSize = 4000;
    const chunkOverlap = 400;
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

    // Generate embeddings in batches for better performance
    const records: { 
      id: string; 
      values: number[]; 
      metadata: Record<string, any> 
    }[] = [];
    let successfulChunks = 0;
    let failedChunks = 0;
    const batchSize = 100; // Batch up to 100 chunks at a time
    
    // Process multiple batches concurrently to save time
    const batchPromises = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const currentIdx = i;
      const batchChunks = chunks.slice(currentIdx, currentIdx + batchSize);
      
      batchPromises.push((async () => {
        try {
          const batchResult = await embeddingModel.batchEmbedContents({
            requests: batchChunks.map(chunk => ({
              content: { role: "user", parts: [{ text: chunk }] },
              taskType: TaskType.RETRIEVAL_DOCUMENT,
              outputDimensionality: 1024,
            })),
          });

          if (batchResult.embeddings) {
            batchResult.embeddings.forEach((emb, indexInBatch) => {
              const chunkIndex = currentIdx + indexInBatch;
              records.push({
                id: uuidv4(),
                values: emb.values,
                metadata: {
                  text: chunks[chunkIndex],
                  documentId: document.id,
                  documentName: file.name,
                  filebookId: filebookId,
                  userId: session.user.id,
                  chunkIndex: chunkIndex,
                  totalChunks: chunks.length,
                },
              });
            });
            return { success: batchChunks.length };
          }
          return { success: 0 };
        } catch (err) {
          console.error(`Batch embedding error for index starting at ${currentIdx}:`, err);
          return { error: batchChunks.length };
        }
      })());
    }

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(res => {
      if ('success' in res && typeof res.success === 'number') successfulChunks += res.success;
      if ('error' in res && typeof res.error === 'number') failedChunks += res.error;
    });

    console.log(`Generated embeddings: ${successfulChunks} successful, ${failedChunks} failed`);

    // Upload to Pinecone in parallel batches
    if (records.length > 0) {
      try {
        const pineconeBatchSize = 100;
        const upsertPromises = [];
        for (let i = 0; i < records.length; i += pineconeBatchSize) {
          const pineconeBatch = records.slice(i, i + pineconeBatchSize);
          // @ts-ignore
          upsertPromises.push(index.upsert({ records: pineconeBatch }));
        }
        await Promise.all(upsertPromises);
        console.log(`Successfully uploaded ${records.length} vectors to Pinecone`);
      } catch (pineconeErr) {
        console.error("Pinecone upload error:", pineconeErr);
        await prisma.document.delete({ where: { id: document.id } });
        return NextResponse.json({ 
          error: "Failed to store document embeddings. Please try again." 
        }, { status: 500 });
      }
    } else {
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
