import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
});

export const metadata: Metadata = {
  title: "NOSTALGIA-TV // Retro Anime Archive",
  description:
    "A 2005-era anime shrine on a CRT screen — Clannad, Evangelion, Sailor Moon, DBZ and more. Fan guestbook, falling sakura petals, and VHS grain included.",
  keywords: ["retro anime", "nostalgia", "Clannad", "90s anime", "2000s anime", "CRT", "VHS"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} antialiased bg-background text-foreground retro-scroll`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
