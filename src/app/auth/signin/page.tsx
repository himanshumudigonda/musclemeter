"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    // Demo mode - just redirect to explore
    if (!isSupabaseConfigured) {
      router.push("/explore");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pearl-muted hover:text-pearl transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-serif text-pearl mb-3">
              Welcome <span className="text-gold italic">back</span>
            </h1>
            <p className="text-pearl-muted">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Demo Mode Banner */}
          {!isSupabaseConfigured && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl"
            >
              <p className="text-sm text-gold">
                🎭 <strong>Demo Mode</strong> - Click the button to explore the app!
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-status-danger/10 border border-status-danger/30 rounded-xl text-status-danger text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-pearl animate-spin" />
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-pearl font-medium text-lg">
                  Continue with Google
                </span>
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-pearl-dim text-sm">New to MuscleMeter?</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/auth/signup"
            className="block w-full p-4 rounded-2xl border border-gold/30 text-gold text-center hover:bg-gold/10 transition-all font-medium"
          >
            Create an Account
          </Link>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-void to-void" />
        <div className="absolute inset-0 noise-overlay opacity-30" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Quote */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-center">
            <p className="text-3xl font-serif text-pearl italic mb-4">
              &ldquo;The only bad workout is the one that didn&apos;t happen.&rdquo;
            </p>
            <p className="text-gold">— Every Athlete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
