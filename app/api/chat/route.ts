import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
  });

  // Aquí adaptamos el stream para que sea compatible con OpenAIStream
  const stream = OpenAIStream(response as any); // casteamos temporalmente

  return new StreamingTextResponse(stream);
}
