import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import TenunGuideVisibilityGate from "@/components/site-guide/TenunGuideVisibilityGate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Heavy display face for big playful headlines (free, loaded via next/font)
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Tenun: Don't Know Your Job Title? We Got You.",
  description:
    "Don't know what job to look for? Tell Tenun what you enjoy doing and we'll find 6 real career paths that match, with salary ranges, required skills, and a step-by-step plan.",
  keywords: [
    "career discovery Malaysia",
    "what job should I get",
    "job title finder",
    "career for fresh graduates Malaysia",
    "TalentBank careers",
    "career pathways for students",
    "skill gap analysis",
    "find your career path",
    "jobs in Malaysia for fresh graduates",
    "career OS",
  ],
  openGraph: {
    title: "Tenun: Don't Know Your Job Title? We Got You.",
    description:
      "Tell us what you enjoy doing. Tenun finds the real career paths that match and connects you to jobs at Malaysia's top companies.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenun: Career Discovery for Students and Fresh Grads",
    description:
      "Don't know your job title? Type what you enjoy and Tenun maps it to 6 real careers.",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tenun",
  url: "https://tenun.career",
  description:
    "Career discovery platform for students and fresh graduates in Malaysia. Describe what you enjoy doing, get 6 real job title matches, and connect to jobs at top Malaysian companies through TalentBank.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "MYR" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Tenun?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tenun is a career discovery platform that helps students and fresh graduates in Malaysia find the right job title — even when they don't know what they're looking for. Powered by TalentBank, you describe what you enjoy and Tenun maps it to real job titles with salary ranges, required skills, and a step-by-step path.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know my job title to use Tenun?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tenun starts from what you enjoy doing and works backwards to find the right career path for you. Type something like 'I like working with data' and Tenun will find the matching job titles.",
      },
    },
    {
      "@type": "Question",
      name: "What companies are hiring through Tenun?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tenun partners with Unilever, Maybank, Petronas, Shell, Lazada, EY, American Express, and Top Glove in Malaysia through TalentBank's employer network.",
      },
    },
    {
      "@type": "Question",
      name: "Is Tenun free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Exploring jobs and career paths is free. Creating an account lets you save results, upload your CV, and get matched to live job openings at partner companies.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${archivoBlack.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </head>
      <body className="min-h-screen antialiased font-sans">
          <ReduxProvider>
            <AuthProvider>
              <LanguageProvider>
                {children}
                {/* Floating mascot guide — temporarily restricted to landing pages
                    ("/" and "/employers") while secondary-page UX is being polished.
                    The gate controls WHERE it appears; the widget itself is unchanged. */}
                <TenunGuideVisibilityGate />
              </LanguageProvider>
            </AuthProvider>
          </ReduxProvider>
        </body>
    </html>
  );
}
