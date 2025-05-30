// === src/typings/global.d.ts ===
// Ensure TypeScript recognizes react-countdown
declare module 'react-countdown';

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}