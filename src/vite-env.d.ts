/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_JUDGE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
