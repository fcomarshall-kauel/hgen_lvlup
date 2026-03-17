import { actorSystemPrompt } from "./prompts/actor";
import { coachSystemPrompt } from "./prompts/coach";

export const ROLE_CONFIG = {
  actor: {
    provider: "openai",
    model: "gpt-5.2-chat-latest",
    systemPrompt: actorSystemPrompt,
  },
  coach: {
    //provider: "gemini",
    //model: "gemini-3-flash-preview",
    provider: "openai",
    model: "gpt-5.2-chat-latest",
    systemPrompt: coachSystemPrompt,
  },
};
