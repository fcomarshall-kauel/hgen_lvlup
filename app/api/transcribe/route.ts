import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const startTotal = Date.now();

  try {
    console.log('[DEBUG] Empezando /api/transcribe');

    const formStart = Date.now();
    const formData = await req.formData();
    const formEnd = Date.now();
    console.log(`[DEBUG] Tiempo leyendo formData: ${formEnd - formStart}ms`);

    const file = formData.get('audio') as File;

    if (!file) {
      console.warn('[DEBUG] No se recibió archivo de audio');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('[DEBUG] Archivo recibido:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const whisperStart = Date.now();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'gpt-4o-transcribe',
    });
    const whisperEnd = Date.now();

    console.log(`[DEBUG] Tiempo Whisper: ${whisperEnd - whisperStart}ms`);
    console.log(`[DEBUG] Texto transcrito: "${transcription.text}"`);

    const totalEnd = Date.now();
    console.log(`[DEBUG] Tiempo total en /api/transcribe: ${totalEnd - startTotal}ms`);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('[ERROR] Fallo en transcripción:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
