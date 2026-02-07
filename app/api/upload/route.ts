import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { index } from "@/lib/pinecone";
import { embeddingModel, TaskType } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";
import { extractText } from "unpdf";

// Polyfill browser APIs for PDF parsing in Node.js
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === "undefined") {
    // @ts-ignore
    global.ImageData = class ImageData {};
}
if (typeof global.Path2D === "undefined") {
    // @ts-ignore
    global.Path2D = class Path2D {};
}

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";
    if (file.type === "application/pdf") {
      try {
        const result = await extractText(new Uint8Array(buffer));
        // unpdf result.text can sometimes be an array or string depending on version/config
        text = Array.isArray(result.text) ? result.text.join("\n") : (result.text || "");
      } catch (err) {
        console.error("PDF parsing error:", err);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 });
      }
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "No text content found in file" }, { status: 400 });
    }

    // Split text into chunks (~1000 chars)
    const chunks = [];
    for (let i = 0; i < text.length; i += 1000) {
      chunks.push(text.slice(i, i + 1000));
    }

    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        filebookId: filebookId,
      },
    });

    const records = [];
    for (const chunk of chunks) {
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
            filebookId: filebookId,
            userId: session.user.id,
          },
        });
      } catch (embErr) {
        console.error("Embedding error for chunk:", embErr);
      }
    }

    if (records.length > 0) {
        // Pinecone v7 expects an object with 'records'
        // @ts-ignore
        await index.upsert({ records }); 
    }

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
