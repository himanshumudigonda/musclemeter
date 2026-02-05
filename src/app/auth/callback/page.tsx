"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured) {
        router.push("/explore");
        return;
      }

      try {
        // Handle the OAuth code exchange - this is critical!
        const code = searchParams.get("code");
        
        if (code) {
          // Exchange the code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            setStatus("error");
            setMessage(exchangeError.message);
            return;
          }
        }

        // Now get the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (session?.user) {
          // Check for pending role from signup flow
          const pendingRole = localStorage.getItem("pendingRole");
          
          if (pendingRole) {
            // Update the user's role
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ role: pendingRole } as never)
              .eq("id", session.user.id);

            if (updateError) {
              console.error("Error updating role:", updateError);
            }

            localStorage.removeItem("pendingRole");

            setStatus("success");
            setMessage("Account created successfully!");

            // Redirect based on role
            setTimeout(() => {
              if (pendingRole === "owner") {
                router.push("/dashboard/setup");
              } else {
                router.push("/explore");
              }
            }, 1500);
          } else {
            // Existing user signing in - check their role
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single() as { data: { role: string } | null };

            setStatus("success");
            setMessage("Welcome back!");

            setTimeout(() => {
              if (profile?.role === "owner") {
                router.push("/dashboard");
              } else {
                router.push("/explore");
              }
            }, 1500);
          }
        } else {
          // No session, redirect to signin
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
            <p className="text-pearl text-lg">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CheckCircle className="w-16 h-16 text-status-success mx-auto mb-4" />
            </motion.div>
            <p className="text-pearl text-lg">{message}</p>
            <p className="text-pearl-muted text-sm mt-2">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-status-danger/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-pearl text-lg mb-2">Authentication Error</p>
            <p className="text-pearl-muted text-sm mb-6">{message}</p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="btn-primary"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
