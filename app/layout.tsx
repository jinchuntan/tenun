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
  title: "Tenun: See Where Your Skills Can Take You.",
  description:
    "Upload your CV and Tenun maps your existing skills to real roles you could grow into — salary ranges, honest skill gaps, and the next concrete step to close them. Built with TalentBank.",
  keywords: [
    "career projection Malaysia",
    "what jobs match my skills",
    "career for fresh graduates Malaysia",
    "TalentBank careers",
    "skill gap analysis Malaysia",
    "career pathways for students",
    "CV skills mapping",
    "jobs in Malaysia for fresh graduates",
    "career OS",
    "next career move Malaysia",
  ],
  openGraph: {
    title: "Tenun: See Where Your Skills Can Take You.",
    description:
      "Tenun maps your CV to real roles you could grow into, and shows the exact next move for each one. A course, a project, or a mentor worth talking to.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenun: Career Projection for Students and Fresh Grads",
    description:
      "Upload your CV and see where your skills can take you. Tenun maps your trajectory to real roles and shows the next move for each one.",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tenun",
  url: "https://tenun.career",
  description:
    "Career projection engine for students and fresh graduates in Malaysia. Upload your CV and we map your existing skills to real roles you could grow into, with salary ranges, an honest skills gap, and the next concrete step to close it. Built with TalentBank.",
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
        text: "Tenun is a career projection engine. You show us what you've already built — your CV, your skills, your projects — and we map it to real roles you could realistically grow into. For each one, you get the gap and the next move to close it: a course, a project to ship, or a mentor worth a coffee. Powered by TalentBank, Malaysia's leading talent placement platform.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know my job title to use Tenun?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tenun starts from what you've already built and maps it to the roles your current skills can grow into. Upload your CV or describe your experience, and Tenun shows you the directions your trajectory points toward.",
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
