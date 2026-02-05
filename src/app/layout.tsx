import type { Metadata } from "next";
import "./globals.css";
import { LenisProvider, AuthProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "MuscleMeter — Luxury Fitness Marketplace",
  description:
    "The hyper-luxury marketplace connecting elite athletes with premium gyms. Zero fees, real-time availability, instant access.",
  keywords: [
    "gym",
    "fitness",
    "marketplace",
    "premium",
    "luxury",
    "workout",
    "athlete",
  ],
  authors: [{ name: "MuscleMeter" }],
  openGraph: {
    title: "MuscleMeter — Luxury Fitness Marketplace",
    description:
      "The hyper-luxury marketplace connecting elite athletes with premium gyms.",
    type: "website",
    locale: "en_IN",
    siteName: "MuscleMeter",
  },
  twitter: {
    card: "summary_large_image",
    title: "MuscleMeter — Luxury Fitness Marketplace",
    description:
      "The hyper-luxury marketplace connecting elite athletes with premium gyms.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-void text-pearl antialiased">
        <AuthProvider>
          <LenisProvider>
            {/* Noise Texture Overlay */}
            <div className="noise-overlay" aria-hidden="true" />

            {/* Ambient Orbs */}
            <div
              className="orb fixed top-1/4 -left-32 w-96 h-96 opacity-30"
              aria-hidden="true"
            />
            <div
              className="orb fixed bottom-1/4 -right-32 w-80 h-80 opacity-20"
              aria-hidden="true"
            />

            {/* Main Content */}
            <main className="relative min-h-screen">{children}</main>
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
