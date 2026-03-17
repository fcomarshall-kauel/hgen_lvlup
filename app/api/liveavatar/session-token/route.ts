import { NextResponse } from "next/server";

const LIVEAVATAR_API_KEY =
  process.env.LIVEAVATAR_API_KEY ?? process.env.HEYGEN_API_KEY;

type SessionTokenRequest = {
  avatarId?: string;
  voiceId?: string;
  language?: string;
  contextId?: string;
};

export async function POST(request: Request) {
  try {
    if (!LIVEAVATAR_API_KEY) {
      return NextResponse.json(
        { error: "Missing API key. Set LIVEAVATAR_API_KEY or HEYGEN_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as SessionTokenRequest;
    const avatarId = body.avatarId?.trim();
    const voiceId = body.voiceId?.trim();
    const language = body.language?.trim() || "es";
    const contextId = body.contextId?.trim();

    if (!avatarId || !voiceId) {
      return NextResponse.json(
        { error: "avatarId and voiceId are required." },
        { status: 400 },
      );
    }

    const payload = {
      mode: "FULL",
      avatar_id: avatarId,
      avatar_persona: {
        voice_id: voiceId,
        language,
        ...(contextId ? { context_id: contextId } : {}),
      },
    };

    const liveAvatarResponse = await fetch(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        method: "POST",
        headers: {
          "X-API-KEY": LIVEAVATAR_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const responseData = await liveAvatarResponse.json();

    if (!liveAvatarResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to create LiveAvatar session token.",
          details: responseData,
        },
        { status: liveAvatarResponse.status },
      );
    }

    const sessionId =
      responseData?.session_id ?? responseData?.data?.session_id;
    const sessionToken =
      responseData?.session_token ?? responseData?.data?.session_token;

    if (!sessionId || !sessionToken) {
      return NextResponse.json(
        {
          error:
            "LiveAvatar response did not include session_id/session_token.",
          details: responseData,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        session_id: sessionId,
        session_token: sessionToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LiveAvatar session-token route error:", error);

    return NextResponse.json(
      { error: "Unexpected error creating LiveAvatar session token." },
      { status: 500 },
    );
  }
}
