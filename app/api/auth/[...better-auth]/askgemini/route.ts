import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { documentText, question } = await req.json();

    const prompt = `
You are a document assistant.
Answer ONLY using the information provided in the document.
If the answer is not in the document, say: "The document does not contain that information."

Document:
${documentText}

Question:
${question}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
