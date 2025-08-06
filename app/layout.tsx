import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ConvexClerkProvider from "../providers/ConvexClerkProvider";
import AudioProvider from "@/providers/AudioProvider";
import { Toaster } from "@/components/ui/toaster";
import IsFetchingProvider  from "@/providers/IsFetchingProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import PWAInitializer from "@/components/PWAInitializer";

const kanit = Kanit({ 
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Tourism Brief Talk",
  description: "Listen to Tourism Brief Talk podcasts anywhere, anytime. Share your voice with the world through our Thai podcast platform.",
  keywords: ["podcast", "tourism", "thailand", "tat", "audio", "thai"],
  authors: [{ name: "Tourism Authority of Thailand" }],
  creator: "Tourism Authority of Thailand",
  publisher: "Tourism Authority of Thailand",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Tourism Brief Talk",
    description: "Listen to Tourism Brief Talk podcasts anywhere, anytime. Share your voice with the world through our Thai podcast platform.",
    url: "/",
    siteName: "Tourism Brief Talk",
    images: [
      {
        url: "/icons/logo.png",
        width: 1200,
        height: 630,
        alt: "Tourism Brief Talk Logo",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tourism Brief Talk",
    description: "Listen to Tourism Brief Talk podcasts anywhere, anytime.",
    images: ["/icons/logo.png"],
  },
  icons: {
    icon: '/icons/logo.png',
    shortcut: '/icons/logo.png',
    apple: '/icons/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TAT Podcast",
  },
};

export const viewport: Viewport = {
  themeColor: "#00BCD4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <IsFetchingProvider>
        <AudioProvider>
          <body className={`${kanit.className}`}>
              <PWAInitializer />
              <Toaster />
              <PWAInstallPrompt />
              <OfflineIndicator />
            {children}
          </body>
          {/* <Script async src="https://js.stripe.com/v3/pricing-table.js"></Script> */}
          </AudioProvider>
        </IsFetchingProvider>
      </html>
    </ConvexClerkProvider>
  );
}
