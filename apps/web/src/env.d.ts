/// <reference lib="dom" />

interface ImportMetaEnv {
  readonly PROD?: boolean;
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_AGORA_APP_ID?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
