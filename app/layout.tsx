import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tenun — The Career Weaving OS",
  description:
    "Weave your skills, experience, goals, and opportunities into realistic career pathways. Tenun helps you compare paths, identify skill gaps, and match with opportunities.",
  keywords: [
    "career",
    "career planning",
    "career pathways",
    "skill gaps",
    "opportunity matching",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
