export type LiveAvatarPersona = {
  avatarId: string;
  voiceId: string;
  language: string;
  contextId?: string;
  welcomeMessage?: string;
};

// LiveAvatar FULL mode requires UUIDs for avatarId + voiceId (+ optional contextId).
// Keep ALL persona configuration here (no env vars for IDs).

export const NOVANDINA_PERSONA: LiveAvatarPersona = {
  avatarId: "dc2935cf-5863-4f08-943b-c7478aea59fb",
  voiceId: "73163832-b7aa-4fdc-852a-e9145e3987d4",
  language: "es",
  contextId: "590554fd-5e83-4e16-bc47-e01501b47e90",
  welcomeMessage:
    "Hola, soy Andrés, y te quiero dar la bienvenida a NovaAndino Litio. Puedo contarte sobre nuestra empresa, nuestra operación en el Salar de Atacama y el proyecto Salar Futuro. ¿Por dónde te gustaría comenzar?",
};

export const SCOTIABANK_PERSONA: LiveAvatarPersona = {
  avatarId: "dc2935cf-5863-4f08-943b-c7478aea59fb",
  voiceId: "73163832-b7aa-4fdc-852a-e9145e3987d4",
  language: "es",
  contextId: "55bc870b-e7b2-437e-bd0c-296190940a59",
  // contextId: "<optional UUID>",
  welcomeMessage:
    "¡Hola! Soy Fabián , tu asistente virtual de Scotiabank. Estoy aquí para ayudarte con tus preguntas financieras.",
};

export const BANCOCHILE_PERSONA: LiveAvatarPersona = {
  avatarId: "dc2935cf-5863-4f08-943b-c7478aea59fb",
  voiceId: "73163832-b7aa-4fdc-852a-e9145e3987d4",
  language: "es",
  contextId: "022fe257-b1ad-439d-bf11-f484935d694e",
  // contextId: "<optional UUID>",
  welcomeMessage:
    "¡Hola! Soy Fabián , tu asistente virtual del Banco de Chile. Estoy aquí para ayudarte con tus preguntas financieras.",
};

export const BANCORIPLEY_PERSONA: LiveAvatarPersona = {
  avatarId: "dc2935cf-5863-4f08-943b-c7478aea59fb",
  voiceId: "73163832-b7aa-4fdc-852a-e9145e3987d4",
  language: "es",
  contextId: "1ec43088-d3be-465b-90a9-1ad9f7f6a6a4",
  welcomeMessage:
    "¡Hola! Soy Fabián , tu asistente virtual del Banco Ripley. Estoy aquí para ayudarte con tus preguntas financieras.",
  // contextId: "<optional UUID>",
};
export const SANTANDER_PERSONA: LiveAvatarPersona = {
  avatarId: "dc2935cf-5863-4f08-943b-c7478aea59fb",
  voiceId: "73163832-b7aa-4fdc-852a-e9145e3987d4",
  language: "es",
  contextId: "61d471bb-9bff-46d0-9315-e294494a2adf",
  welcomeMessage:
    "¡Hola! Soy Fabián , tu asistente virtual del Santander. Estoy aquí para ayudarte con tus preguntas financieras.",
  // contextId: "<optional UUID>",
};