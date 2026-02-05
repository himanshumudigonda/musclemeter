"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Dumbbell,
  Building2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { isSupabaseConfigured } from "@/lib/supabase";

type UserRole = "athlete" | "owner";

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignUp = async () => {
    if (!role) return;

    // Demo mode - just redirect
    if (!isSupabaseConfigured) {
      if (role === "owner") {
        router.push("/dashboard/setup");
      } else {
        router.push("/explore");
      }
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle(role);
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
          <button
            onClick={() => (role === null ? router.push("/") : setRole(null))}
            className="inline-flex items-center gap-2 text-pearl-muted hover:text-pearl transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{role === null ? "Back to home" : "Change role"}</span>
          </button>

          <AnimatePresence mode="wait">
            {/* Demo Mode Banner */}
            {!isSupabaseConfigured && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl"
              >
                <p className="text-sm text-gold">
                  🎭 <strong>Demo Mode</strong> - Select a role and click Continue to explore!
                </p>
              </motion.div>
            )}

            {/* Role Selection */}
            {role === null && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Header */}
                <div className="mb-10">
                  <h1 className="text-4xl font-serif text-pearl mb-3">
                    Join <span className="text-gold italic">MuscleMeter</span>
                  </h1>
                  <p className="text-pearl-muted">
                    Choose how you want to use the platform
                  </p>
                </div>

                {/* Role Options */}
                <div className="space-y-4">
                  {/* Athlete Option */}
                  <motion.button
                    onClick={() => setRole("athlete")}
                    className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-void transition-colors">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-pearl mb-1">
                          I&apos;m an Athlete
                        </h3>
                        <p className="text-pearl-muted text-sm">
                          Discover and book premium gyms near you. Pay only for what you use.
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Owner Option */}
                  <motion.button
                    onClick={() => setRole("owner")}
                    className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-void transition-colors">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-pearl mb-1">
                          I&apos;m a Gym Owner
                        </h3>
                        <p className="text-pearl-muted text-sm">
                          List your space, manage bookings, and grow your community. Zero platform fees.
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Already have account */}
                <p className="mt-8 text-center text-pearl-muted">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-gold hover:text-gold-400 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Google Sign Up */}
            {role !== null && (
              <motion.div
                key="google-signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header */}
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm mb-4">
                    {role === "athlete" ? (
                      <Dumbbell className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    <span>
                      {role === "athlete" ? "Athlete Account" : "Owner Account"}
                    </span>
                  </div>
                  <h1 className="text-4xl font-serif text-pearl mb-3">
                    Create your <span className="text-gold italic">account</span>
                  </h1>
                  <p className="text-pearl-muted">
                    Sign up with Google to get started
                  </p>
                </div>

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

                {/* Benefits List */}
                <div className="mb-8 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                  <p className="text-sm text-gold font-medium mb-3">
                    {role === "athlete"
                      ? "As an athlete, you'll get:"
                      : "As a gym owner, you'll get:"}
                  </p>
                  <ul className="space-y-2">
                    {(role === "athlete"
                      ? [
                          "Access to premium gyms citywide",
                          "Real-time crowd levels",
                          "Flexible day/week/month passes",
                          "Zero platform fees",
                        ]
                      : [
                          "List your gym for free",
                          "Manage bookings in real-time",
                          "Direct payments to your UPI",
                          "Live crowd management",
                        ]
                    ).map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-pearl-muted"
                      >
                        <Check className="w-4 h-4 text-gold" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Google Sign Up Button */}
                <motion.button
                  onClick={handleGoogleSignUp}
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

                {/* Terms */}
                <p className="mt-6 text-xs text-pearl-dim text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-gold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-gold hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-void to-void" />
        <div className="absolute inset-0 noise-overlay opacity-30" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gold/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={role || "default"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-5xl font-serif text-pearl mb-4">
                {role === "owner" ? (
                  <>
                    Grow your
                    <br />
                    <span className="text-gold italic">community</span>
                  </>
                ) : role === "athlete" ? (
                  <>
                    Train
                    <br />
                    <span className="text-gold italic">anywhere</span>
                  </>
                ) : (
                  <>
                    Your fitness
                    <br />
                    <span className="text-gold italic">journey starts</span>
                  </>
                )}
              </h2>
              <p className="text-pearl-muted text-lg max-w-md mx-auto">
                {role === "owner"
                  ? "List your gym and reach thousands of fitness enthusiasts."
                  : role === "athlete"
                  ? "Access premium gyms across the city. Pay only for what you use."
                  : "Join the luxury fitness marketplace with zero platform fees."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative Circles */}
        <div className="absolute bottom-12 right-12 w-40 h-40 border border-gold/20 rounded-full" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-gold/30 rounded-full" />
      </div>
    </div>
  );
}
