"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  User,
  Dumbbell,
  Building2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";

type UserRole = "athlete" | "owner";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoInfo, setShowDemoInfo] = useState(!isSupabaseConfigured);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error } = await signUp(email, password, fullName, role);
      if (error) {
        setError(error.message);
      } else {
        // Redirect based on role
        if (role === "owner") {
          router.push("/dashboard/setup");
        } else {
          router.push("/explore");
        }
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
          <button
            onClick={() => (step === 1 ? router.push("/") : setStep(1))}
            className="inline-flex items-center gap-2 text-pearl-muted hover:text-pearl transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? "Back to home" : "Change role"}</span>
          </button>

          <AnimatePresence mode="wait">
            {/* Demo Mode Banner */}
            {showDemoInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl"
              >
                <p className="text-sm text-gold">
                  🎭 <strong>Demo Mode</strong> - Supabase not configured. You can still explore the UI!
                </p>
              </motion.div>
            )}

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
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
                    onClick={() => handleRoleSelect("athlete")}
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
                    onClick={() => handleRoleSelect("owner")}
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

            {/* Step 2: Details Form */}
            {step === 2 && (
              <motion.div
                key="step2"
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
                    Enter your details to get started
                  </p>
                </div>

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

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm text-pearl-muted mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-dim" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="input-luxury pl-12"
                        required
                      />
                    </div>
                  </div>

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
                        minLength={8}
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
                    <p className="mt-2 text-xs text-pearl-dim">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Benefits List */}
                  <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl">
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
                      "Create Account"
                    )}
                  </motion.button>

                  {/* Terms */}
                  <p className="text-xs text-pearl-dim text-center">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-gold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-gold hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={
            role === "owner"
              ? "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80"
              : "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
          }
          alt="Gym"
          className="w-full h-full object-cover opacity-50 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/50 to-transparent" />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-serif text-pearl mb-4">
                {role === "owner" ? (
                  <>
                    Grow your
                    <br />
                    <span className="text-gold italic">community</span>
                  </>
                ) : (
                  <>
                    Train
                    <br />
                    <span className="text-gold italic">anywhere</span>
                  </>
                )}
              </h2>
              <p className="text-pearl-muted text-lg max-w-md mx-auto">
                {role === "owner"
                  ? "List your gym and reach thousands of fitness enthusiasts. Zero platform fees forever."
                  : "Access premium gyms across the city. Pay only for what you use, when you use it."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 right-8 w-32 h-32 border border-gold/20 rounded-full" />
        <div className="absolute bottom-16 right-16 w-24 h-24 border border-gold/30 rounded-full" />
      </div>
    </div>
  );
}
