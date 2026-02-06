"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";

// Magnetic Button Component
function MagneticButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// Kinetic Text Component with stagger animation
function KineticText({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
    },
  };

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Hover Reveal Text
function HoverRevealText({ 
  text, 
  hoverText,
  className = "" 
}: { 
  text: string; 
  hoverText: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="block"
        animate={{ y: isHovered ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-gold"
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? "0%" : "100%" }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {hoverText}
      </motion.span>
    </div>
  );
}

// Split Panel Component
function SplitPanel({
  side,
  title,
  subtitle,
  videoSrc,
  isHovered,
  otherHovered,
  onClick,
  onHover,
  onLeave,
}: {
  side: "left" | "right";
  title: string;
  subtitle: string;
  videoSrc: string;
  isHovered: boolean;
  otherHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left - rect.width / 2);
    cursorY.set(e.clientY - rect.top - rect.height / 2);
  };

  const rotateX = useTransform(cursorY, [-300, 300], [5, -5]);
  const rotateY = useTransform(cursorX, [-400, 400], [-5, 5]);

  return (
    <motion.div
      className="relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      animate={{
        flex: isHovered ? 1.5 : otherHovered ? 0.5 : 1,
      }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Video Background */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster={side === "left" 
            ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" 
            : "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80"
          }
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background:
            side === "left"
              ? "linear-gradient(135deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.6) 50%, rgba(201,169,98,0.1) 100%)"
              : "linear-gradient(225deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.6) 50%, rgba(201,169,98,0.1) 100%)",
        }}
        animate={{ opacity: isHovered ? 0.6 : 0.85 }}
        transition={{ duration: 0.5 }}
      />

      {/* Divider Line */}
      {side === "left" && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/10 z-20"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      )}

      {/* Content */}
      <motion.div
        className="relative z-20 text-center px-8 max-w-lg"
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
      >
        {/* Eyebrow */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="inline-block px-4 py-2 text-xs tracking-[0.3em] uppercase font-medium text-gold/80 border border-gold/30 rounded-full backdrop-blur-sm">
            {side === "left" ? "Athletes" : "Gym Owners"}
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h2
          className="text-display-md md:text-display-lg font-serif text-pearl mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="block">{title.split(" ")[0]}</span>
          <span className="text-gold italic">{title.split(" ").slice(1).join(" ")}</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-pearl-muted text-lg mb-8 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <MagneticButton className="btn-magnetic group">
            <span className="relative z-10 flex items-center gap-2">
              {side === "left" ? "Explore Gyms" : "List Your Space"}
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </span>
          </MagneticButton>
        </motion.div>

        {/* Hover Indicator */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute -bottom-20 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs tracking-[0.2em] uppercase text-pearl-muted">
                Click to enter
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Corner Accents */}
      <motion.div
        className={`absolute ${side === "left" ? "left-8 top-8" : "right-8 top-8"} z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="w-16 h-[1px] bg-gold/50" />
        <div className="w-[1px] h-16 bg-gold/50" />
      </motion.div>

      <motion.div
        className={`absolute ${side === "left" ? "left-8 bottom-8" : "right-8 bottom-8"} z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="w-[1px] h-16 bg-gold/50" />
        <div className="w-16 h-[1px] bg-gold/50 -mt-[1px]" />
      </motion.div>
    </motion.div>
  );
}

// Loading Screen
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-void flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-serif">
          <span className="text-pearl">Muscle</span>
          <span className="text-gold italic">Meter</span>
        </h1>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-[2px] bg-white/10 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-gradient-gold"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Progress Text */}
      <motion.p
        className="mt-4 text-sm text-pearl-muted tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading Experience
      </motion.p>
    </motion.div>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<"athlete" | "owner" | null>(null);

  const handlePanelClick = (target: "athlete" | "owner") => {
    setIsTransitioning(true);
    setTransitionTarget(target);
    
    // Navigate to correct dashboard
    if (target === "athlete") {
      router.push("/dashboard/user");
    } else {
      router.push("/dashboard/owner/create");
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && (
          <motion.div
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.header
              className="fixed top-0 left-0 right-0 z-30 px-8 py-6 flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Logo */}
              <Link href="/" className="group">
                <h1 className="text-2xl font-serif transition-colors duration-300 group-hover:text-gold">
                  <span className="text-pearl">Muscle</span>
                  <span className="text-gold italic">Meter</span>
                </h1>
              </Link>

              {/* Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <HoverRevealText 
                  text="About" 
                  hoverText="Our Story"
                  className="text-sm tracking-wide text-pearl-muted"
                />
                <HoverRevealText 
                  text="Features" 
                  hoverText="Zero Fees"
                  className="text-sm tracking-wide text-pearl-muted"
                />
                <HoverRevealText 
                  text="Contact" 
                  hoverText="Let's Talk"
                  className="text-sm tracking-wide text-pearl-muted"
                />
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link href={profile?.role === "owner" ? "/dashboard" : "/explore"}>
                      <motion.span 
                        className="text-sm text-pearl-muted hover:text-pearl transition-colors cursor-pointer"
                        whileHover={{ x: 2 }}
                      >
                        {profile?.role === "owner" ? "Dashboard" : "Explore"}
                      </motion.span>
                    </Link>
                    <div className="flex items-center gap-3">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name || "User"} 
                          className="w-8 h-8 rounded-full border border-gold/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-medium">
                          {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <motion.button
                        onClick={() => signOut()}
                        className="text-sm text-pearl-muted hover:text-pearl transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        Sign Out
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <motion.span 
                        className="text-sm text-pearl-muted hover:text-pearl transition-colors cursor-pointer"
                        whileHover={{ x: 2 }}
                      >
                        Sign In
                      </motion.span>
                    </Link>
                    <Link href="/auth/signup">
                      <motion.button
                        className="px-5 py-2 text-sm font-medium bg-gold text-void rounded-lg hover:bg-gold-400 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Get Started
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>
            </motion.header>

            {/* Split Screen Container */}
            <div className="flex h-screen">
              <SplitPanel
                side="left"
                title="I Am Athlete"
                subtitle="Discover premium gyms near you. Book instantly. Train anywhere."
                videoSrc="/videos/athlete.mp4"
                isHovered={hoveredSide === "left"}
                otherHovered={hoveredSide === "right"}
                onClick={() => handlePanelClick("athlete")}
                onHover={() => setHoveredSide("left")}
                onLeave={() => setHoveredSide(null)}
              />
              <SplitPanel
                side="right"
                title="I Am Creator"
                subtitle="List your space. Grow your community. Zero platform fees."
                videoSrc="/videos/owner.mp4"
                isHovered={hoveredSide === "right"}
                otherHovered={hoveredSide === "left"}
                onClick={() => handlePanelClick("owner")}
                onHover={() => setHoveredSide("right")}
                onLeave={() => setHoveredSide(null)}
              />
            </div>

            {/* Bottom Info Bar */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-30 px-8 py-4 flex items-center justify-between border-t border-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <p className="text-xs text-pearl-dim tracking-wide">
                © 2026 MuscleMeter. The future of fitness.
              </p>

              <div className="flex items-center gap-6">
                <motion.div 
                  className="flex items-center gap-2 text-xs text-pearl-dim"
                  whileHover={{ color: "#C9A962" }}
                >
                  <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                  <span>Live: 2,847 Athletes Training</span>
                </motion.div>

                <div className="h-4 w-[1px] bg-white/10" />

                <motion.span 
                  className="text-xs text-pearl-dim cursor-pointer"
                  whileHover={{ color: "#C9A962" }}
                >
                  Zero Platform Fees
                </motion.span>
              </div>
            </motion.div>

            {/* Transition Overlay */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  className="fixed inset-0 z-50 bg-void"
                  initial={{ 
                    clipPath: transitionTarget === "athlete" 
                      ? "circle(0% at 25% 50%)" 
                      : "circle(0% at 75% 50%)" 
                  }}
                  animate={{ clipPath: "circle(150% at 50% 50%)" }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-display-sm font-serif text-pearl">
                        {transitionTarget === "athlete" ? (
                          <>Discovering <span className="text-gold italic">Gyms</span></>
                        ) : (
                          <>Your <span className="text-gold italic">Dashboard</span></>
                        )}
                      </h2>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
