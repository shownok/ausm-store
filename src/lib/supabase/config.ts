export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * When Supabase isn't configured the store runs in "demo mode" with the
 * placeholder catalog in src/lib/demo-data.ts. Orders are not saved and the
 * admin panel is read-only. Add the env vars to switch to the real database.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const PRODUCT_IMAGE_BUCKET = "product-images";
