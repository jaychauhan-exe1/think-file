import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
export { TaskType };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

export const chatModel2 = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
});

export const chatModel3 = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview", // Updated to official Gemini 3 preview model
});
