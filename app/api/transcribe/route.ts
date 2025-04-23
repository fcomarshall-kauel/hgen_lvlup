import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('audio') as File;

  if (!file) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
  }

  console.log('[DEBUG] Recibido archivo:', file.name, file.type, file.size);

  const arrayBuffer = await file.arrayBuffer();

  // ✅ Crear un nuevo File que sea compatible con lo que espera OpenAI
  const uploadableFile = new File([arrayBuffer], 'audio.mp3', { type: file.type });

  const transcription = await openai.audio.transcriptions.create({
    file: uploadableFile,
    model: 'whisper-1', // o 'gpt-4o-transcribe'
  });

  return NextResponse.json({ text: transcription.text });
}
