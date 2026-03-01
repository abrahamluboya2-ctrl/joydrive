import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[Supabase] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getSupabaseUser(userId: string) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("[Supabase] Failed to get user:", error);
    return null;
  }
}

export async function createSupabaseUser(email: string, password?: string) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || "ChangeMe123!",
      email_confirm: true,
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("[Supabase] Failed to create user:", error);
    return null;
  }
}

export async function updateSupabaseUser(userId: string, attributes: any) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, attributes);
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("[Supabase] Failed to update user:", error);
    return null;
  }
}
