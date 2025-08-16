import type { Metadata } from "next";
import { Inter } from "next/font/google";

// SubscriptionAlert disabled - subscription features removed

import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Canvas",
  description: "Build Something Great!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <Modals />
        {/* SubscriptionAlert disabled - subscription features removed */}
        {children}
      </body>
    </html>
  );
}
