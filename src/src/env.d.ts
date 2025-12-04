/// <reference types="vite/client" />

/**
 * TypeScript definitions for environment variables
 * This ensures type safety when accessing import.meta.env
 */
interface ImportMetaEnv {
  // Admin Authentication
  readonly VITE_ADMIN_CODE?: string;

  // Supabase Configuration
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;

  // WhatsApp Configuration
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_WHATSAPP_BUSINESS_ID?: string;

  // Application
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}