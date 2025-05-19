/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DB_HOST: string
  readonly DB_USER: string
  readonly DB_PASS: string
  readonly DB_NAME: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 