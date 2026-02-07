import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
export { TaskType };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

export const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
