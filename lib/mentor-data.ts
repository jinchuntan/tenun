import { Mentor } from "./types";

export const mentors: Mentor[] = [
  {
    id: "mentor-1",
    name: "Sarah Chen",
    title: "Senior Product Manager",
    organization: "Stripe",
    expertise: ["Product Management", "Data Analytics", "Career Pivots", "PM Interviews"],
    background: "Transitioned from data analytics to product management at Grab before moving to Stripe. Has helped 30+ analysts make the same pivot.",
    matchReason: "Direct experience in the analytics-to-PM transition you may be considering. Can give you a realistic view of what the switch involves and how to position your skills.",
    location: "Singapore",
    responseTime: "Usually replies within 2–3 days",
    linkedinUrl: "https://linkedin.com",
    email: "sarah.chen@mentors.tenun.co",
  },
  {
    id: "mentor-2",
    name: "Amir Hassan",
    title: "Head of Data Science",
    organization: "Axiata Digital",
    expertise: ["Data Science", "Machine Learning", "Leadership", "Southeast Asia Tech"],
    background: "Built and scaled data science teams from 3 to 40 people at two Malaysian unicorns. Passionate about democratising ML education in Southeast Asia.",
    matchReason: "Deep expertise in the Malaysian and SEA tech ecosystem. Ideal if you want to build a data career in the region or are navigating the jump from individual contributor to team lead.",
    location: "Kuala Lumpur, Malaysia",
    responseTime: "Usually replies within 1–2 days",
    linkedinUrl: "https://linkedin.com",
    email: "amir.hassan@mentors.tenun.co",
  },
  {
    id: "mentor-3",
    name: "Priya Nair",
    title: "Climate Tech Founder & Advisor",
    organization: "GreenStack Ventures",
    expertise: ["Climate Tech", "Startups", "Impact Investing", "Social Enterprise"],
    background: "Founded two climate-tech startups, one acquired in 2022. Now advises early-stage founders on product-market fit and impact measurement in the climate space.",
    matchReason: "If sustainability or climate is in your interests, Priya offers a rare blend of technical depth and mission-driven entrepreneurship. She can speak to both the 'how' and the 'why' of building in climate tech.",
    location: "Kuala Lumpur / Remote",
    responseTime: "Usually replies within 3–5 days",
    linkedinUrl: "https://linkedin.com",
    email: "priya.nair@mentors.tenun.co",
  },
  {
    id: "mentor-4",
    name: "Marcus Okafor",
    title: "Engineering Manager",
    organization: "Shopee",
    expertise: ["Software Engineering", "Team Leadership", "Technical Career Growth", "System Design"],
    background: "10 years in software engineering across fintech and e-commerce. Leads a team of 15 engineers and coaches junior engineers on the path to senior and staff roles.",
    matchReason: "A go-to mentor if you're on a technical track and want to understand what 'senior engineer' actually looks like in a fast-growing tech company — and how to get there faster.",
    location: "Kuala Lumpur, Malaysia",
    responseTime: "Usually replies within 2–4 days",
    linkedinUrl: "https://linkedin.com",
    email: "marcus.okafor@mentors.tenun.co",
  },
  {
    id: "mentor-5",
    name: "Wei Lin Tan",
    title: "UX Research Lead",
    organization: "Grab",
    expertise: ["UX Research", "Design Thinking", "Product Design", "User Interviews"],
    background: "UX researcher turned research lead at Grab. Has conducted hundreds of user studies across Southeast Asia and trained cross-functional teams in research methods.",
    matchReason: "Perfect for anyone interested in the user research or design side of product. Wei Lin can help you understand how UX research fits into the product development cycle and what a research career looks like in practice.",
    location: "Singapore",
    responseTime: "Usually replies within 2–3 days",
    linkedinUrl: "https://linkedin.com",
    email: "weilin.tan@mentors.tenun.co",
  },
  {
    id: "mentor-6",
    name: "James Rivera",
    title: "Startup Advisor & Angel Investor",
    organization: "Iterative (YC-backed)",
    expertise: ["Startups", "Fundraising", "Product Strategy", "Go-to-market"],
    background: "Former founder (two exits), now a partner at Iterative and angel investor with a portfolio of 20+ early-stage companies across Southeast Asia and the US.",
    matchReason: "The right mentor if you're seriously considering starting something. James brings hard-won startup experience and can help you stress-test ideas, find co-founders, and navigate early fundraising.",
    location: "Singapore / San Francisco",
    responseTime: "Usually replies within 4–7 days",
    linkedinUrl: "https://linkedin.com",
    email: "james.rivera@mentors.tenun.co",
  },
];

export function getMatchingMentors(interests: string[], preferredIndustries: string[], riskAppetite: string): Mentor[] {
  const interestLower = [...interests, ...preferredIndustries].map(s => s.toLowerCase());

  const scores = mentors.map(m => {
    let score = 0;
    const combined = [...m.expertise, m.title, m.organization, m.background].join(" ").toLowerCase();

    if (interestLower.some(i => i.includes("climate") || i.includes("sustainability")) && combined.includes("climate")) score += 3;
    if (interestLower.some(i => i.includes("product")) && combined.includes("product")) score += 2;
    if (interestLower.some(i => i.includes("data") || i.includes("analytics")) && combined.includes("data")) score += 2;
    if (interestLower.some(i => i.includes("startup") || i.includes("entrepreneur")) && combined.includes("startup")) score += 2;
    if (riskAppetite === "high" && combined.includes("startup")) score += 1;
    if (interestLower.some(i => i.includes("design") || i.includes("ux")) && combined.includes("ux")) score += 2;
    if (interestLower.some(i => i.includes("engineer") || i.includes("software")) && combined.includes("engineer")) score += 2;
    score += Math.random() * 0.5;
    return { mentor: m, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .map(s => s.mentor);
}
