import { Opportunity } from "./types";

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Associate Product Manager",
    type: "job",
    organization: "Canva",
    matchPercentage: 94,
    whyMatch:
      "Strong alignment with your product management interest, data analytics skills, and preference for creative tech environments. Your consulting and hackathon experience demonstrates product thinking.",
    skillsDeveloped: [
      "Product Strategy",
      "A/B Testing",
      "Stakeholder Management",
      "Roadmap Planning",
    ],
    description:
      "Join Canva's APM program to lead feature development for their design platform. Work cross-functionally with engineering, design, and marketing teams.",
    location: "Sydney, Australia",
    duration: "Full-time",
    salary: "AUD $90,000 – $110,000 / yr",
    level: "entry",
    externalLink: "https://www.jobstreet.com.au/en/job/associate-product-manager-canva",
  },
  {
    id: "opp-2",
    title: "Data Analyst — Climate Insights",
    type: "job",
    organization: "Climateworks Centre",
    matchPercentage: 91,
    whyMatch:
      "Directly combines your data analytics skills with your climate technology passion. Your ESG reporting experience at Deloitte is highly relevant.",
    skillsDeveloped: [
      "Climate Data Modelling",
      "Policy Analysis",
      "Advanced SQL",
      "Impact Measurement",
    ],
    description:
      "Analyse climate policy data and build models to support Australia's transition to net-zero emissions. Collaborate with researchers and government stakeholders.",
    location: "Melbourne, Australia",
    duration: "Full-time",
    salary: "AUD $75,000 – $90,000 / yr",
    level: "entry",
    externalLink: "https://www.seek.com.au/job/data-analyst-climateworks",
  },
  {
    id: "opp-3",
    title: "Product Analytics Intern",
    type: "internship",
    organization: "Atlassian",
    matchPercentage: 89,
    whyMatch:
      "Bridges your analytics background with product management aspirations. Atlassian's data-driven culture aligns with your skills in Python and Tableau.",
    skillsDeveloped: [
      "Product Metrics",
      "Experimentation",
      "SQL Optimisation",
      "Data Storytelling",
    ],
    description:
      "Support product teams with data analysis, build dashboards, and contribute to feature experimentation at one of Australia's largest tech companies.",
    location: "Sydney, Australia",
    duration: "12 weeks",
    salary: "AUD $35 / hr",
    level: "entry",
    externalLink: "https://www.atlassian.com/company/careers/internships",
  },
  {
    id: "opp-4",
    title: "Sustainability Tech Accelerator Program",
    type: "internship",
    organization: "EnergyLab",
    matchPercentage: 87,
    whyMatch:
      "Perfect intersection of your climate passion and tech skills. Your hackathon experience and volunteer coordination show startup-ready initiative.",
    skillsDeveloped: [
      "Startup Operations",
      "Clean Energy Tech",
      "Pitch Development",
      "Rapid Prototyping",
    ],
    description:
      "Work with early-stage climate-tech startups in Australia's leading clean energy accelerator. Support portfolio companies with data analysis and product development.",
    location: "Melbourne / Sydney",
    duration: "6 months",
    salary: "AUD $28 / hr",
    level: "entry",
    externalLink: "https://www.energylab.org.au/programs",
  },
  {
    id: "opp-5",
    title: "Google Data Analytics Professional Certificate",
    type: "course",
    organization: "Google via Coursera",
    matchPercentage: 85,
    whyMatch:
      "Fills skill gaps in advanced analytics techniques and adds a recognised credential to strengthen your data career path.",
    skillsDeveloped: [
      "Advanced Spreadsheets",
      "R Programming",
      "Data Cleaning",
      "Statistical Analysis",
    ],
    description:
      "Industry-recognised certificate covering the entire data analytics lifecycle. Includes hands-on projects and portfolio pieces.",
    duration: "6 months (self-paced)",
    externalLink: "https://www.coursera.org/professional-certificates/google-data-analytics",
  },
  {
    id: "opp-6",
    title: "Product Management Fundamentals",
    type: "course",
    organization: "Reforge",
    matchPercentage: 83,
    whyMatch:
      "Directly supports your product management career aspiration. Covers frameworks used by top PMs at leading tech companies.",
    skillsDeveloped: [
      "Product Strategy",
      "User Research",
      "Prioritisation Frameworks",
      "Growth Models",
    ],
    description:
      "Intensive program teaching core PM skills: strategy, execution, analytics, and leadership. Includes real-world case studies from Airbnb, Spotify, and Stripe.",
    duration: "8 weeks",
    externalLink: "https://www.reforge.com/product-management-fundamentals",
  },
  {
    id: "opp-7",
    title: "Climate Data Dashboard",
    type: "project",
    organization: "Open Source / Portfolio",
    matchPercentage: 92,
    whyMatch:
      "Combines your strongest skills (Python, data visualisation, Figma) with your deepest interest (climate tech). Creates a standout portfolio piece.",
    skillsDeveloped: [
      "Full-Stack Development",
      "API Integration",
      "Data Pipeline Design",
      "Open Source Contribution",
    ],
    description:
      "Build an open-source dashboard visualising real-time climate data from public APIs. Design the UI in Figma, implement with Python/React, and deploy on Vercel.",
    duration: "4-6 weeks",
  },
  {
    id: "opp-8",
    title: "PM Case Study Portfolio",
    type: "project",
    organization: "Self-directed",
    matchPercentage: 80,
    whyMatch:
      "Strengthens your PM application with documented product thinking. Your consulting experience gives you a head start on structured analysis.",
    skillsDeveloped: [
      "Product Thinking",
      "Competitive Analysis",
      "Wireframing",
      "Business Case Writing",
    ],
    description:
      "Create three detailed product case studies analysing real products. Include market analysis, user research findings, feature proposals, and mockups.",
    duration: "3-4 weeks",
  },
  {
    id: "opp-9",
    title: "Sarah Chen — Senior PM at Stripe",
    type: "mentor",
    organization: "ADPList",
    matchPercentage: 88,
    whyMatch:
      "Transitioned from data analytics to product management — directly mirrors your desired career path. Can provide actionable advice on the PM transition.",
    skillsDeveloped: [
      "Career Navigation",
      "PM Interview Prep",
      "Network Building",
      "Industry Insights",
    ],
    description:
      "Book 1:1 mentoring sessions with a senior PM who made the analytics-to-PM transition. Get advice on portfolio, interviews, and career strategy.",
  },
  {
    id: "opp-10",
    title: "James Okafor — Climate Tech Founder",
    type: "mentor",
    organization: "Climate Salad",
    matchPercentage: 84,
    whyMatch:
      "Founder in the climate-tech space who values data-driven approaches. Can guide you on the intersection of technology and sustainability careers.",
    skillsDeveloped: [
      "Entrepreneurial Thinking",
      "Climate Industry Knowledge",
      "Networking",
      "Impact Measurement",
    ],
    description:
      "Connect with a climate-tech founder building carbon accounting tools. Learn about the industry, career paths, and how to make impact through technology.",
  },
  {
    id: "opp-11",
    title: "Sustainability Metrics Challenge",
    type: "challenge",
    organization: "Devpost",
    matchPercentage: 90,
    whyMatch:
      "Perfectly matches your hackathon track record and climate interests. A win or strong submission becomes a powerful portfolio piece.",
    skillsDeveloped: [
      "Rapid Prototyping",
      "Pitch Presentation",
      "Full-Stack Development",
      "Impact Storytelling",
    ],
    description:
      "Build a tool that helps organisations measure and report their sustainability metrics. Top submissions win prizes and mentorship from industry leaders.",
    duration: "48 hours",
    externalLink: "https://devpost.com/hackathons",
  },
  {
    id: "opp-12",
    title: "AI for Social Good Challenge",
    type: "challenge",
    organization: "Google Developer Groups",
    matchPercentage: 82,
    whyMatch:
      "Builds on your Python and data skills while creating social impact. Your experience with the carbon tracker hackathon is directly transferable.",
    skillsDeveloped: [
      "Machine Learning Basics",
      "Ethical AI",
      "Team Collaboration",
      "Demo Presentation",
    ],
    description:
      "Develop an AI-powered solution addressing a social or environmental challenge. Work in teams of 3-5 with mentorship from Google engineers.",
    duration: "2 weeks",
    externalLink: "https://developers.google.com/community/gdsc",
  },
  {
    id: "opp-13",
    title: "Junior Data Engineer",
    type: "job",
    organization: "Shopee",
    matchPercentage: 86,
    whyMatch:
      "Strong match with your Python and SQL skills. Shopee's scale gives you exposure to massive datasets and modern data infrastructure.",
    skillsDeveloped: [
      "Data Pipeline Design",
      "Apache Spark",
      "Cloud Infrastructure",
      "ETL Processes",
    ],
    description:
      "Design and maintain data pipelines for Shopee's e-commerce platform. Work with billions of daily events across Southeast Asia.",
    location: "Singapore",
    duration: "Full-time",
    salary: "SGD $4,500 – $6,500 / mo",
    level: "entry",
    externalLink: "https://careers.shopee.sg/jobs/",
  },
  {
    id: "opp-14",
    title: "Product Manager — Consumer Growth",
    type: "job",
    organization: "Grab",
    matchPercentage: 85,
    whyMatch:
      "Grab's analytics-heavy product culture rewards the data + product combination you're building toward. Strong growth opportunities in SEA's super-app.",
    skillsDeveloped: [
      "Growth Strategy",
      "A/B Testing at Scale",
      "Southeast Asia Market Knowledge",
      "Cross-functional Leadership",
    ],
    description:
      "Drive consumer acquisition and retention through data-driven product initiatives on Grab's ride-hailing and food delivery platforms.",
    location: "Kuala Lumpur, Malaysia",
    duration: "Full-time",
    salary: "MYR 8,000 – 12,000 / mo",
    level: "mid",
    externalLink: "https://grab.careers/jobs/",
  },
  {
    id: "opp-15",
    title: "Business Intelligence Analyst",
    type: "job",
    organization: "Axiata Digital",
    matchPercentage: 83,
    whyMatch:
      "Excellent entry point into Malaysia's digital economy. Strong SQL + analytics culture with clear progression into senior data roles.",
    skillsDeveloped: [
      "Business Intelligence",
      "Power BI / Tableau",
      "Financial Analysis",
      "Telco Data",
    ],
    description:
      "Build dashboards and analytical models to support decision-making across Axiata's digital financial services business.",
    location: "Kuala Lumpur, Malaysia",
    duration: "Full-time",
    salary: "MYR 5,000 – 7,500 / mo",
    level: "entry",
    externalLink: "https://www.jobstreet.com.my/en/job/business-intelligence-analyst-axiata",
  },
];
