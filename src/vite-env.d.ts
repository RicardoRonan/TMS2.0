/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_CHAT_WEBHOOK_URL?: string
  readonly VITE_IMGBB_API_KEY?: string
  readonly VITE_BRANDFETCH_CLIENT_ID?: string
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

