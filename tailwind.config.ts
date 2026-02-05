import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Dark Palette
        void: {
          DEFAULT: "#050505",
          50: "#0a0a0a",
          100: "#0f0f0f",
          200: "#141414",
          300: "#1a1a1a",
          400: "#1f1f1f",
        },
        // Luxury Gold Accents
        gold: {
          DEFAULT: "#C9A962",
          50: "#FCF9F0",
          100: "#F7F0DB",
          200: "#EEDDB3",
          300: "#E4C98A",
          400: "#D9B472",
          500: "#C9A962",
          600: "#B08D3F",
          700: "#8A6E31",
          800: "#645023",
          900: "#3E3216",
        },
        // Pure contrast whites
        pearl: {
          DEFAULT: "#FAFAFA",
          muted: "#A0A0A0",
          dim: "#666666",
        },
        // Status colors
        status: {
          success: "#4ADE80",
          warning: "#FBBF24",
          danger: "#F87171",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Satoshi", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["8rem", { lineHeight: "0.85", letterSpacing: "-0.04em" }],
        "display-lg": ["6rem", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "display-md": ["4rem", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-sm": ["2.5rem", { lineHeight: "1", letterSpacing: "-0.01em" }],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.6s ease-out forwards",
        "slide-left": "slideLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "slide-right": "slideRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "magnetic": "magnetic 0.3s ease-out forwards",
        "noise": "noise 0.5s steps(10) infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        magnetic: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(var(--x), var(--y))" },
        },
        noise: {
          "0%, 100%": { backgroundPosition: "0 0" },
          "10%": { backgroundPosition: "-5% -10%" },
          "20%": { backgroundPosition: "-15% 5%" },
          "30%": { backgroundPosition: "7% -25%" },
          "40%": { backgroundPosition: "-5% 25%" },
          "50%": { backgroundPosition: "-15% 10%" },
          "60%": { backgroundPosition: "15% 0%" },
          "70%": { backgroundPosition: "0% 15%" },
          "80%": { backgroundPosition: "3% 35%" },
          "90%": { backgroundPosition: "-10% 10%" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 169, 98, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(201, 169, 98, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-luxury": "linear-gradient(135deg, #050505 0%, #1a1a1a 50%, #050505 100%)",
        "gradient-gold": "linear-gradient(135deg, #C9A962 0%, #E4C98A 50%, #C9A962 100%)",
        "shimmer-gold": "linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.3), transparent)",
      },
      boxShadow: {
        "luxury": "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        "luxury-lg": "0 35px 60px -15px rgba(0, 0, 0, 0.9)",
        "gold-glow": "0 0 40px rgba(201, 169, 98, 0.3)",
        "inner-luxury": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
