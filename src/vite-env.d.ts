/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: 'http' | 'mock';
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

declare module "@fontsource/*";
