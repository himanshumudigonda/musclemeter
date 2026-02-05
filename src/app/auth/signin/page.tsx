"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo mode - just redirect to explore
    if (!isSupabaseConfigured) {
      router.push("/explore");
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
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
                🎭 <strong>Demo Mode</strong> - Click Sign In to explore the app without auth!
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-xl text-status-danger text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-pearl-muted mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-luxury pl-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-pearl-muted mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-dim" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-luxury pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-pearl-dim hover:text-pearl transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gold hover:text-gold-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-gradient-gold text-void font-semibold rounded-xl",
                "hover:opacity-90 transition-opacity disabled:opacity-50"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-void text-pearl-dim">
                  New to MuscleMeter?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link href="/auth/signup">
              <motion.button
                type="button"
                className="w-full py-4 border border-white/20 text-pearl rounded-xl hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Create an account
              </motion.button>
            </Link>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="Gym"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/50 to-transparent" />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-serif text-pearl mb-4">
                Your fitness
                <br />
                <span className="text-gold italic">journey awaits</span>
              </h2>
              <p className="text-pearl-muted text-lg max-w-md mx-auto">
                Access premium gyms across the city with zero platform fees.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-8 right-8 w-24 h-24 border border-gold/20 rounded-full" />
        <div className="absolute top-16 right-16 w-16 h-16 border border-gold/30 rounded-full" />
      </div>
    </div>
  );
}
