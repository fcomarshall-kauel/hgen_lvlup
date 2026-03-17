import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ReplyRequest = {
  message?: string;
  institutionName?: string;
  language?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReplyRequest;
    const message = body.message?.trim();
    const institutionName = body.institutionName?.trim() || "la institucion";
    const language = body.language?.trim() || "es";

    if (!message) {
      return NextResponse.json(
        { error: "message is required." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment." },
        { status: 500 },
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente virtual de ${institutionName}. Responde de forma clara, breve y util en idioma ${language}.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.5,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "LLM returned empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("LiveAvatar reply route error:", error);
    return NextResponse.json(
      { error: "Failed to generate fallback assistant reply." },
      { status: 500 },
    );
  }
}
