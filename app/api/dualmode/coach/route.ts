import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, model, systemPrompt, messages } = body as {
      provider?: string;
      model?: string;
      systemPrompt?: string;
      messages?: ChatMessage[];
    };

    if (provider !== "openai") {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 },
      );
    }

    if (!model || !systemPrompt || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const guidance = completion.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ guidance });
  } catch (error) {
    console.error("Coach route error:", error);

    return NextResponse.json(
      { error: "Failed to generate coach guidance" },
      { status: 500 },
    );
  }
}
