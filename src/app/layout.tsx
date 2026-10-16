import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer, Header, Hydrate, MobileNav, SearchOverlay } from "@/components/chrome";
import { Toaster } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "FADE — Independent creators, booked directly", template: "%s · FADE" },
  description: "A curated marketplace for independent designers, engineers, editors and strategists. Fixed-scope packages, escrowed payments, no bidding wars.",
  openGraph: { siteName: "FADE", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <Hydrate />
        <Header />
        <main id="main" className="min-h-svh pb-[var(--nav-h)] pt-[var(--header-h)] md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <SearchOverlay />
        <Toaster />
      </body>
    </html>
  );
}
