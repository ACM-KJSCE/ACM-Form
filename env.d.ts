/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FIREBASE_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 