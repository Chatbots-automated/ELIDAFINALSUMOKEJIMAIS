/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAKECOMMERCE_STORE_ID: string
  readonly VITE_MAKECOMMERCE_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}