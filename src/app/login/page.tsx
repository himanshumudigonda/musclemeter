"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers";

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, user, isLoading: authLoading } = useAuth();

  const role = (searchParams.get("role") as "athlete" | "owner") || "athlete";
  const redirectTo = searchParams.get("redirect") || null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user && !authLoading) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (role === "owner") {
        router.push("/dashboard/owner/create");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [user, authLoading, role, redirectTo, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle(role);
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // Redirect happens via OAuth callback
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const isAthlete = role === "athlete";

  return (
    <div className="min-h-screen bg-luxury-black relative overflow-hidden">
      {/* Background Video/Image */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: isAthlete
              ? "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')"
              : "url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-void/95 via-void/85 to-gold/10" />
      </motion.div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Back Button */}
      <motion.div
        className="absolute top-8 left-8 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-pearl-muted hover:text-gold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wide">Back</span>
        </Link>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/">
              <h1 className="text-4xl font-serif mb-2">
                <span className="text-pearl">Muscle</span>
                <span className="text-gold italic">Meter</span>
              </h1>
            </Link>
          </motion.div>

          {/* Glassmorphism Card */}
          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* Role Badge */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.2em] uppercase font-medium text-gold/80 border border-gold/30 rounded-full">
                <Sparkles className="w-3 h-3" />
                {isAthlete ? "Athlete Access" : "Creator Access"}
              </span>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-3xl font-serif text-pearl mb-2">
                Welcome,{" "}
                <span className="text-gold italic">
                  {isAthlete ? "Athlete" : "Creator"}
                </span>
              </h2>
              <p className="text-pearl-muted text-sm">
                {isAthlete
                  ? "Discover premium gyms near you"
                  : "Launch your fitness empire"}
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg text-status-danger text-sm text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign In Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isLoading || authLoading}
              className="w-full relative group overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-gold/10 group-hover:from-gold/30 group-hover:to-gold/20 transition-all duration-300" />
              <div className="absolute inset-[1px] bg-luxury-black rounded-xl" />

              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-3 py-4 px-6">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="text-pearl font-medium tracking-wide">
                      Continue with Google
                    </span>
                  </>
                )}
              </div>

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-pearl-dim tracking-wider">
                SECURE LOGIN
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Switch Role */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-pearl-muted text-sm">
                {isAthlete ? "Own a gym?" : "Looking for a gym?"}{" "}
                <Link
                  href={`/login?role=${isAthlete ? "owner" : "athlete"}`}
                  className="text-gold hover:underline transition-colors"
                >
                  {isAthlete ? "List your space" : "Explore gyms"}
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            className="text-center text-pearl-dim text-xs mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-gold/70 hover:text-gold">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gold/70 hover:text-gold">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Corner Accents */}
      <motion.div
        className="absolute left-8 top-24 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="w-16 h-[1px] bg-gold/30" />
        <div className="w-[1px] h-16 bg-gold/30" />
      </motion.div>

      <motion.div
        className="absolute right-8 bottom-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
      >
        <div className="w-[1px] h-16 bg-gold/30" />
        <div className="w-16 h-[1px] bg-gold/30 -mt-[1px]" />
      </motion.div>
    </div>
  );
}

// Loading fallback
function LoginLoading() {
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-serif mb-4">
          <span className="text-pearl">Muscle</span>
          <span className="text-gold italic">Meter</span>
        </h1>
        <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
