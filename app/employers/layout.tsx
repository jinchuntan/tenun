import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenun for Employers — Meet candidates who know why they fit",
  description:
    "Stop screening cold CVs. Tenun helps employers discover students and fresh graduates who have explored the role, built a profile, and understand what it takes before they apply.",
  openGraph: {
    title: "Tenun for Employers — Hire role-ready early talent",
    description:
      "Post a role and review a warmer shortlist of early-career candidates with skill, interest, and role-fit context — not cold CVs.",
    type: "website",
  },
};

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
