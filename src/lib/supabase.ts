import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client only if configured, otherwise create with dummy URL that passes validation
const DEMO_URL = "https://demo.supabase.co";
const DEMO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const supabase: SupabaseClient<Database> = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : DEMO_URL,
  isSupabaseConfigured ? supabaseAnonKey : DEMO_KEY
);

// Helper function to get the current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return user;
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

// Real-time subscription helper for bookings
export function subscribeToBookings(
  gymId: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`bookings:gym_id=eq.${gymId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `gym_id=eq.${gymId}`,
      },
      callback
    )
    .subscribe();
}

// Real-time subscription for crowd count
export function subscribeToCrowdCount(
  gymId: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`gyms:id=eq.${gymId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "gyms",
        filter: `id=eq.${gymId}`,
      },
      callback
    )
    .subscribe();
}
