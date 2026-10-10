import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as lovableSupabase } from "@/integrations/supabase/client";

/**
 * Supabase client for *customer* identity (sign-up, sign-in, sessions).
 *
 * Customer sessions must be issued by the same Supabase project that MIRAVIKA Nexus uses
 * to verify bearer tokens, otherwise every signed-in cart, checkout, wishlist and account
 * request is rejected with 401. Nexus runs on its own project, so this client is configured
 * with VITE_NEXUS_SUPABASE_URL / VITE_NEXUS_SUPABASE_PUBLISHABLE_KEY (public values).
 *
 * The Lovable-managed client in integrations/supabase stays in use for the storefront's
 * own server features (e.g. the email queue).
 */
const NEXUS_SUPABASE_URL = import.meta.env.VITE_NEXUS_SUPABASE_URL as string | undefined;
const NEXUS_SUPABASE_KEY = import.meta.env.VITE_NEXUS_SUPABASE_PUBLISHABLE_KEY as
  string | undefined;

function createCustomerClient(): SupabaseClient {
  if (!NEXUS_SUPABASE_URL || !NEXUS_SUPABASE_KEY) {
    console.warn(
      "[customer-auth] VITE_NEXUS_SUPABASE_URL / VITE_NEXUS_SUPABASE_PUBLISHABLE_KEY are not set; " +
        "falling back to the storefront Supabase project. Nexus will reject these sessions.",
    );
    return lovableSupabase as unknown as SupabaseClient;
  }
  const key = NEXUS_SUPABASE_KEY;
  return createClient(NEXUS_SUPABASE_URL, key, {
    global: {
      // Publishable keys are opaque API keys, not bearer JWTs.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let client: SupabaseClient | undefined;

export function customerSupabase(): SupabaseClient {
  if (!client) client = createCustomerClient();
  return client;
}
