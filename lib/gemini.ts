import { GoogleGenerativeAI } from '@google/generative-ai';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not configured.');
}

const modelId = process.env.GEMINI_MODEL_ID ?? 'gemini-2.0-flash-lite';

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateChatResponse(
  history: ChatMessage[],
  prompt: string
) {
  const model = genAI.getGenerativeModel({ model: modelId });

  const chatSession = model.startChat({
    history: history.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
  });

  const result = await chatSession.sendMessage(prompt);
  const responseText = result.response.text().trim();

  if (!responseText) {
    throw new Error('Empty response received from Gemini.');
  }

  return responseText;
}
