import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ConvexClerkProvider from "../providers/ConvexClerkProvider";
import AudioProvider from "@/providers/AudioProvider";
import { Toaster } from "@/components/ui/toaster";
import IsFetchingProvider  from "@/providers/IsFetchingProvider";

const kanit = Kanit({ 
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Tourism Brief Talk",
  description: "Tourism Brief Talk",
  icons: {
    icon: '/icons/logo.png'
  }
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
              <Toaster />
            {children}
          </body>
          {/* <Script async src="https://js.stripe.com/v3/pricing-table.js"></Script> */}
          </AudioProvider>
        </IsFetchingProvider>
      </html>
    </ConvexClerkProvider>
  );
}
