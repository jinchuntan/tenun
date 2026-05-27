import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tenun — Discover the Right Career for You",
  description:
    "Not sure what job to look for? Describe what you want to do in plain words. Tenun translates your ideas into real job titles, shows salary ranges, and builds a personalised career pathway from your resume.",
  keywords: [
    "career discovery",
    "job title finder",
    "career for fresh graduates",
    "internship search",
    "career pathways",
    "skill gap analysis",
    "what job should I get",
    "career for students",
  ],
  openGraph: {
    title: "Tenun — Discover the Right Career for You",
    description:
      "Describe what you want to do. Tenun finds the real job titles, explains each role, and builds your personalised career plan.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenun — Career Discovery for Students",
    description:
      "Not sure what job title to search for? Type what you enjoy and Tenun maps it to real roles, salary ranges, and career pathways.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tenun",
  url: "https://tenun.career",
  description:
    "Career discovery platform for students and fresh graduates. Describe what you want to do, discover matching job titles, and get a personalised career pathway.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Job title discovery from natural language queries",
    "AI career space overview and role explanations",
    "Resume parsing and skill extraction",
    "Personalised career pathway generation",
    "Skill gap analysis with course recommendations",
    "Mentor matching and outreach tools",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
