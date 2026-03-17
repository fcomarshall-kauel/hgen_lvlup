import { NextResponse } from "next/server";

const LIVEAVATAR_API_KEY =
  process.env.LIVEAVATAR_API_KEY ?? process.env.HEYGEN_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

type EnsureThirdPartyVoiceRequest = {
  providerVoiceId?: string;
  importedVoiceName?: string;
  secretName?: string;
};

type LiveAvatarApiResponse = {
  code?: number;
  message?: string | null;
  data?: any;
  [key: string]: unknown;
};

function normalizeMessage(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  // Some LiveAvatar error payloads include stringified JSON in `message`.
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as { message?: string };
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function getSecretIdFromPayload(payload: LiveAvatarApiResponse): string | undefined {
  return (
    payload?.secret_id ??
    payload?.data?.secret_id ??
    payload?.data?.id ??
    payload?.data?.secret?.id
  );
}

export async function POST(request: Request) {
  try {
    if (!LIVEAVATAR_API_KEY) {
      return NextResponse.json(
        { error: "Missing LIVEAVATAR_API_KEY (or HEYGEN_API_KEY)." },
        { status: 500 },
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY in environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as EnsureThirdPartyVoiceRequest;
    const providerVoiceId = body.providerVoiceId?.trim();
    const importedVoiceName =
      body.importedVoiceName?.trim() || "Novandina ElevenLabs Voice";
    const secretName =
      body.secretName?.trim() || `elevenlabs-${providerVoiceId || "default"}`;

    if (!providerVoiceId) {
      return NextResponse.json(
        { error: "providerVoiceId is required." },
        { status: 400 },
      );
    }

    // Step 1: register ElevenLabs API key in LiveAvatar
    const secretResponse = await fetch("https://api.liveavatar.com/v1/secrets", {
      method: "POST",
      headers: {
        "X-API-KEY": LIVEAVATAR_API_KEY,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        secret_type: "ELEVENLABS_API_KEY",
        secret_value: ELEVENLABS_API_KEY,
        secret_name: secretName,
      }),
    });

    const secretData = (await secretResponse.json()) as LiveAvatarApiResponse;
    let secretId = getSecretIdFromPayload(secretData);

    if (!secretResponse.ok) {
      const normalizedMessage = normalizeMessage(secretData?.message);
      const apiKeyAlreadyExists = normalizedMessage
        .toLowerCase()
        .includes("api key already exists");

      if (!apiKeyAlreadyExists) {
        return NextResponse.json(
          {
            error: "Failed to register ElevenLabs secret in LiveAvatar.",
            details: secretData,
          },
          { status: secretResponse.status },
        );
      }

      // Secret already exists: recover it by listing secrets and matching by name/type.
      const listSecretsResponse = await fetch("https://api.liveavatar.com/v1/secrets", {
        method: "GET",
        headers: {
          "X-API-KEY": LIVEAVATAR_API_KEY,
          accept: "application/json",
        },
      });
      const listSecretsData = (await listSecretsResponse.json()) as LiveAvatarApiResponse;

      if (!listSecretsResponse.ok || !Array.isArray(listSecretsData?.data)) {
        return NextResponse.json(
          {
            error: "Failed to recover existing ElevenLabs secret.",
            details: listSecretsData,
          },
          { status: listSecretsResponse.status || 502 },
        );
      }

      const matchByName = listSecretsData.data.find(
        (secret: { id?: string; secret_name?: string; secret_type?: string }) =>
          secret?.secret_type === "ELEVENLABS_API_KEY" &&
          (secret?.secret_name || "").toLowerCase() === secretName.toLowerCase(),
      );

      const fallbackFirstElevenLabs = listSecretsData.data.find(
        (secret: { id?: string; secret_type?: string }) =>
          secret?.secret_type === "ELEVENLABS_API_KEY",
      );

      secretId = matchByName?.id ?? fallbackFirstElevenLabs?.id;
    }

    if (!secretId) {
      return NextResponse.json(
        {
          error: "LiveAvatar did not return a usable secret_id.",
          details: secretData,
        },
        { status: 502 },
      );
    }

    // Step 2: import the ElevenLabs voice into LiveAvatar
    const importVoiceResponse = await fetch(
      "https://api.liveavatar.com/v1/voices/third_party",
      {
        method: "POST",
        headers: {
          "X-API-KEY": LIVEAVATAR_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          provider_voice_id: providerVoiceId,
          secret_id: secretId,
          name: importedVoiceName,
        }),
      },
    );

    const importVoiceData = await importVoiceResponse.json();
    if (!importVoiceResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to import ElevenLabs voice into LiveAvatar.",
          details: importVoiceData,
        },
        { status: importVoiceResponse.status },
      );
    }

    const voiceId =
      importVoiceData?.voice_id ??
      importVoiceData?.id ??
      importVoiceData?.data?.voice_id ??
      importVoiceData?.data?.id;

    if (!voiceId) {
      return NextResponse.json(
        {
          error: "LiveAvatar did not return imported voice id.",
          details: importVoiceData,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        voice_id: voiceId,
        provider_voice_id: providerVoiceId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LiveAvatar ensure-third-party voice route error:", error);
    return NextResponse.json(
      { error: "Unexpected error ensuring third-party voice." },
      { status: 500 },
    );
  }
}
