import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function real(): SupabaseClient {
  return (client ??= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  ));
}

export const db: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = Reflect.get(real(), prop);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real()) : value;
  },
});
