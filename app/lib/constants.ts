export const AVATARS = [
  {
    avatar_id: "Marianne_Chair_Sitting_public",
    name: "Mujer Oficina",
  },
  {
    avatar_id: "73c84e2b886940099c5793b085150f2f",
    name: "Mujer Patio",
  },
  {
    avatar_id: "eb0a8cc8046f476da551a5559fbb5c82",
    name: "Hombre Oficina",
  },
  {
    avatar_id: "2c57ba04ef4d4a5ca30a953d0791e7e3",
    name: "Hombre Patio",
  },
  {
    avatar_id: "Susan_public_2_20240328",
    name: "Susan in Black Shirt",
  },
  {
    avatar_id: "Wayne_20240711",
    name: "CEO Startup ",
  },


];


export const VOICES = [
  {
    name: "Pablo (Chile)",
    voice_id: "05e192129b6b466493886273f8c23f78", // Pablo's voice ID
    preview_url: "/pablo.mp3"
  },
  {
    name: "Fernanda (Chile)",
    voice_id: "55c3fee66bdf441eba6c065f64f64306", // Fernanda's voice ID
    preview_url: "/fernanda.mp3"
  },
  {
    name: "Jessica (Neutral)",
    voice_id: "c8e176c17f814004885fd590e03ff99f", 
    preview_url: ""
  },
  // Add more avatars as needed
];

export const SIMULATIONS = [
  {
    situacion: "Simulación de Despido",
    knowledgeId: "6368e34cc3f648eeb38bcb231b902e48",
  },
  {
    situacion: "Onboarding",
    knowledgeId: "another_knowledge_id_here",
  },
  // Add more situations as needed
];






export const STT_LANGUAGE_LIST = [
  { label: 'Bulgarian', value: 'bg', key: 'bg' },
  { label: 'Chinese', value: 'zh', key: 'zh' },
  { label: 'Czech', value: 'cs', key: 'cs' },
  { label: 'Danish', value: 'da', key: 'da' },
  { label: 'Dutch', value: 'nl', key: 'nl' },
  { label: 'English', value: 'en', key: 'en' },
  { label: 'Finnish', value: 'fi', key: 'fi' },
  { label: 'French', value: 'fr', key: 'fr' },
  { label: 'German', value: 'de', key: 'de' },
  { label: 'Greek', value: 'el', key: 'el' },
  { label: 'Hindi', value: 'hi', key: 'hi' },
  { label: 'Hungarian', value: 'hu', key: 'hu' },
  { label: 'Indonesian', value: 'id', key: 'id' },
  { label: 'Italian', value: 'it', key: 'it' },
  { label: 'Japanese', value: 'ja', key: 'ja' },
  { label: 'Korean', value: 'ko', key: 'ko' },
  { label: 'Malay', value: 'ms', key: 'ms' },
  { label: 'Norwegian', value: 'no', key: 'no' },
  { label: 'Polish', value: 'pl', key: 'pl' },
  { label: 'Portuguese', value: 'pt', key: 'pt' },
  { label: 'Romanian', value: 'ro', key: 'ro' },
  { label: 'Russian', value: 'ru', key: 'ru' },
  { label: 'Slovak', value: 'sk', key: 'sk' },
  { label: 'Spanish', value: 'es', key: 'es' },
  { label: 'Swedish', value: 'sv', key: 'sv' },
  { label: 'Turkish', value: 'tr', key: 'tr' },
  { label: 'Ukrainian', value: 'uk', key: 'uk' },
  { label: 'Vietnamese', value: 'vi', key: 'vi' },
];

export const AVATAR_VOICE_COMBINATIONS = [
  {
    id: "mujer-oficina-chile",
    avatar_id: "Marianne_Chair_Sitting_public", // Mujer Oficina
    voice_id: "55c3fee66bdf441eba6c065f64f64306",  // Fernanda
    name: "Mujer Oficina con Acento de Chile"
  },
  {
    id: "mujer-oficina-neutro",
    avatar_id: "Marianne_Chair_Sitting_public", // Hombre Oficina
    voice_id: "781b14e4b01949438c844cffa6371a1c",  // Neutro
    name: "Mujer Oficina con acento neutro"
  },
  {
    id: "mujer-oficina-colombia",
    avatar_id: "Marianne_Chair_Sitting_public", // Hombre Oficina
    voice_id: "1efd6e0e3fdf4e979a79d74219abdbe6",  // Colombiano
    name: "Mujer Oficina con acento de Colombia"
  },
  {
    id: "mujer-oficina-argentina",
    avatar_id: "Marianne_Chair_Sitting_public", // Hombre Oficina
    voice_id: "bb8e997c011c4e46a214594ffc900ecb",  // Argentino
    name: "Mujer Oficina con acento de Argentina"
  },

  // Add more combinations as needed
];
