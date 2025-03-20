import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Toaster } from "sonner";
import "./globals.css";
import type React from "react";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
            <div className="container flex h-14 items-center">
              <Navigation />
            </div>
          </header>
          <main className="flex-grow">{children}</main>
          <Toaster />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
