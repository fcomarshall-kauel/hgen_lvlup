# LiveAvatar Migration Guide (for other avatar pages)

This repo now supports HeyGen **LiveAvatar** (new system) alongside the legacy **Streaming Avatar** SDK.

Use this guide to migrate additional pages (e.g. `/avatar_ia/scotiabank`) using the same working pattern as the Novandina page.

---

## What “migration” means here

- **Frontend**: Create/adjust a Next.js page that defines a **persona config** (avatar UUID, voice UUID, language, context UUID) and renders the LiveAvatar component.
- **Backend**: Reuse the existing Next.js API routes that:
  - create a **session token** (`/api/liveavatar/session-token`)
  - optionally import an **ElevenLabs voice** into LiveAvatar (`/api/liveavatar/voices/ensure-third-party`)
  - optionally generate a fallback reply (`/api/liveavatar/reply`)

No other parts of the app need to change.

---

## Prerequisites

### Environment variables

Set these in `.env.local` (and also in Vercel project env vars):

- **`LIVEAVATAR_API_KEY`**: LiveAvatar API key from LiveAvatar settings.
- **`ELEVENLABS_API_KEY`**: only if using Custom TTS (ElevenLabs voices).
- **`OPENAI_API_KEY`**: only if using the fallback reply route.

### Dependencies

The app uses:

- `@heygen/liveavatar-web-sdk`

Already present in `package.json`.

---

## 1) Get the required IDs (critical)

LiveAvatar FULL mode requires **UUIDs** for `avatar_id` and `voice_id`.

### Avatar ID (UUID)

- Must be a LiveAvatar avatar UUID (not a legacy “public name” like `Silas_CustomerSupport_public`).
- If you send a non-UUID, the token endpoint fails with `422` (invalid UUID).

### Voice ID (UUID)

If you use LiveAvatar native voices, use the LiveAvatar voice UUID.

If you use **ElevenLabs**, you **cannot** put the raw ElevenLabs voice id in FULL mode. You must:

1) store the ElevenLabs API key as a LiveAvatar `secret_id`
2) import the ElevenLabs voice into LiveAvatar
3) use the returned LiveAvatar `voice_id` (UUID) in the persona

This repo already implements that import flow via:

- `POST /api/liveavatar/voices/ensure-third-party`

Example payload:

```json
{
  "providerVoiceId": "wkZNEcNpgGY6d3WIgF50",
  "importedVoiceName": "Scotiabank ElevenLabs Voice",
  "secretName": "Scotiabank-elevenlabs"
}
```

The response contains the LiveAvatar UUID:

```json
{ "voice_id": "<LIVEAVATAR_VOICE_UUID>", "provider_voice_id": "<ELEVENLABS_ID>" }
```

Use that `voice_id` in the page persona.

---

## 2) Create (or copy) the page: `/app/ia_<brand>/page.tsx`

Follow the Novandina pattern:

- Keep the **persona in the page file**
- Render `InteractiveAvatarLiveAvatarQuickstart`

Recommended persona shape:

```ts
const PERSONA = {
  avatarId: "<LIVEAVATAR_AVATAR_UUID>",
  voiceId: "<LIVEAVATAR_VOICE_UUID>",
  language: "es",
  contextId: "<CONTEXT_UUID>",
} as const;
```

Then:

```tsx
<InteractiveAvatarLiveAvatarQuickstart
  avatarId={PERSONA.avatarId}
  voiceId={PERSONA.voiceId}
  language={PERSONA.language}
  contextId={PERSONA.contextId}
  welcomeMessage="..."
/>;
```

### Branding

Branding is page-owned (header/logo/colors), so migrating a new avatar page typically only requires:

- a new logo in `public/`
- updated Tailwind/inline styles in the page component

---

## 3) Backend routes used by the page (already implemented)

### Session token route

Frontend calls:

- `POST /api/liveavatar/session-token`

This route calls the LiveAvatar API:

- `POST https://api.liveavatar.com/v1/sessions/token`

Payload is FULL mode and includes:

- `avatar_id`
- `avatar_persona.voice_id`
- `avatar_persona.context_id`
- `avatar_persona.language`

### ElevenLabs voice import route (optional)

Use only if the voice is from ElevenLabs:

- `POST /api/liveavatar/voices/ensure-third-party`

It is designed to be **idempotent**:

- If the secret already exists, it reuses it instead of failing.

### Fallback reply route (optional)

If LiveAvatar agent reply is slow or absent, the frontend component can call:

- `POST /api/liveavatar/reply`

and then speak via `session.repeat(reply)`.

---

## 4) Frontend component behavior: `InteractiveAvatar_LiveAvatarQuickstart.tsx`

This component does the minimal working “Quickstart style” flow:

- fetch session token from backend
- create `LiveAvatarSession(sessionToken, { voiceChat: true })`
- `session.start()`
- `session.attach(videoEl)`
- `session.startListening()`

Conversation loop:

- Collect `USER_TRANSCRIPTION`
- On `USER_SPEAK_ENDED`, **debounce** and then `session.message(transcript)`
- If avatar doesn’t respond quickly, call fallback route and `session.repeat(reply)`

Important UX fixes already included:

- Debounced `USER_SPEAK_ENDED` to avoid mid-sentence pauses resending old text
- Clears transcript after sending to prevent “jumping back” to a previous question
- Wraps long transcripts so they don’t widen layout (`break-words`, `whitespace-pre-wrap`, `min-w-0`)

---

## 5) Example: migrating `/avatar_ia/scotiabank`

1) Create a new page file:

- `app/avatar_ia/scotiabank/page.tsx`

2) Choose IDs:

- `avatarId`: LiveAvatar avatar UUID
- `contextId`: context UUID
- `voiceId`: LiveAvatar voice UUID
  - if you only have an ElevenLabs raw voice id → import it first using `/api/liveavatar/voices/ensure-third-party`

3) Add branding:

- Copy a logo into `public/Logo_Scotiabank.png`
- Style the header/background similarly to Novandina, but with Scotiabank colors

4) Deploy:

- Ensure Vercel env vars include `LIVEAVATAR_API_KEY` (and `ELEVENLABS_API_KEY` / `OPENAI_API_KEY` if used).

---

## Troubleshooting checklist

- **`422 invalid UUID`**: You’re passing a non-UUID as `avatar_id` or `voice_id`.
- **`voice_id: Voice not found`**: The voice UUID is not a LiveAvatar voice. If using ElevenLabs, import the voice and use the returned UUID.
- **Session connects but no audio**: confirm browser mic permissions; confirm `voiceChat: true` and `session.startListening()` are called once.
- **Long questions cause weird repeats**: ensure you’re using the debounced transcript logic in `InteractiveAvatar_LiveAvatarQuickstart.tsx`.

