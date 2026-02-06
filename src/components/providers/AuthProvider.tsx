"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";
import { Profile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isDemo: boolean;
  signInWithGoogle: (role?: "athlete" | "owner") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUserRole: (role: "athlete" | "owner") => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create supabase client once
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Demo mode - no Supabase configured
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
  }

  async function signInWithGoogle(role?: "athlete" | "owner") {
    if (!isSupabaseConfigured) {
      return { error: new Error("Demo mode: Supabase not configured") };
    }
    
    // Store role in cookie (accessible by server) and localStorage (backup)
    if (role) {
      document.cookie = `pendingRole=${role}; path=/; max-age=300; SameSite=Lax`;
      localStorage.setItem("pendingRole", role);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    return { error: error as Error | null };
  }

  async function updateUserRole(role: "athlete" | "owner") {
    if (!user) return { error: new Error("No user logged in") };
    
    const { error } = await supabase
      .from("profiles")
      .update({ role } as never)
      .eq("id", user.id);

    if (!error && profile) {
      setProfile({ ...profile, role });
    }

    return { error: error as Error | null };
  }

  async function signOut() {
    localStorage.removeItem("pendingRole");
    await supabase.auth.signOut();
    setProfile(null);
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isDemo: !isSupabaseConfigured,
    signInWithGoogle,
    signOut,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
