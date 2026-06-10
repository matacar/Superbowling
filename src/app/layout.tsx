import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import FloatingReserve from "@/components/FloatingReserve";
import SiteChrome from "@/components/SiteChrome";
import { site } from "@/lib/site";

// Tipografías — inyectan las variables CSS que consume el sistema de tokens.
// Display = Cinzel: mayúsculas romanas de serifa alta, fieles al logo de marca.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const display = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display-src",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    "bolos Medellín",
    "boliche Envigado",
    "Super Bowling",
    "reservar pista de bolos",
    "restaurante bar Envigado",
    "eventos Medellín",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  // Borrador privado: NO indexar en buscadores hasta que el cliente lo apruebe.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-ink text-cream antialiased">
        <SiteChrome footer={<Footer />} floating={<FloatingReserve />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
