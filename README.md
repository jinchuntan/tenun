# Tenun — The Career Weaving OS

**Weave your skills, experience, goals, and opportunities into realistic career pathways.**

Tenun is a career decision-support platform that helps students, graduates, and early-career professionals navigate realistic career pathways. It does not predict your future — it helps you compare paths, understand trade-offs, identify skill gaps, and match with opportunities.

## Hackathon Fit

Career OS | Career Marketplace | AI Career Coach | Pathway Simulator | Living Portfolio | Opportunity Matching

## Features

- **Career Thread Map** — Your profile broken into 8 career threads (Skills, Experience, Education, Interests, Market Demand, Salary, Lifestyle, Employer Fit), each scored 1-100 with explanations and improvement suggestions
- **Pathway Simulator** — Five realistic career pathways (Stable Growth, High Salary, Skill Pivot, Startup/Builder, Leadership), each with timelines, roles, trade-offs, risks, and concrete next actions
- **Visual Comparisons** — Radar charts, bar graphs, and dimension comparisons using Recharts
- **Skill Gap Analysis** — Prioritized skill gaps with current vs. required levels and learning resources
- **Opportunity Marketplace** — Matching jobs, internships, courses, projects, mentors, and portfolio challenges ranked by fit
- **AI Career Reasoning Engine** — Deterministic mock engine that works without any API keys; optional AI enhancement via environment variable
- **Demo Mode** — One-click demo with a sample user profile showing attractive results
- **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

- [Next.js 14](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) component patterns
- [Radix UI](https://www.radix-ui.com/) primitives
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tenun.git
cd tenun

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

The app works fully without any environment variables. To enable optional AI enhancement:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your API key
ANTHROPIC_API_KEY=your-api-key-here
NEXT_PUBLIC_AI_ENABLED=true
```

## Project Structure

```
tenun/
├── app/
│   ├── api/analyze/route.ts       # API route for optional AI integration
│   ├── dashboard/page.tsx         # Main dashboard with all visualizations
│   ├── profile/page.tsx           # Profile input form
│   ├── globals.css                # Global styles and custom utilities
│   ├── layout.tsx                 # Root layout with metadata
│   └── page.tsx                   # Landing page
├── components/
│   ├── dashboard/
│   │   ├── thread-map.tsx         # Career Thread Map with SVG visualization
│   │   ├── pathway-cards.tsx      # Expandable pathway comparison cards
│   │   ├── pathway-chart.tsx      # Radar, bar, and comparison charts
│   │   ├── skill-gaps.tsx         # Skill gap analysis cards
│   │   └── opportunity-marketplace.tsx  # Filterable opportunity grid
│   ├── ui/
│   │   ├── badge.tsx              # Badge component
│   │   ├── button.tsx             # Button with variants
│   │   ├── card.tsx               # Card components
│   │   ├── progress.tsx           # Progress bar
│   │   ├── tabs.tsx               # Tab navigation
│   │   └── tooltip.tsx            # Tooltip component
│   ├── footer.tsx                 # Footer with copyright
│   ├── navbar.tsx                 # Responsive navigation bar
│   └── thread-visual.tsx          # Abstract thread SVG animations
├── lib/
│   ├── career-engine.ts           # Mock AI career reasoning engine
│   ├── demo-data.ts               # Demo user profile (Aisha Lim)
│   ├── mock-opportunities.ts      # 12 mock opportunities
│   ├── types.ts                   # TypeScript type definitions
│   └── utils.ts                   # Utility functions (cn)
├── .env.example                   # Environment variable template
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## Architecture

### Career Engine

The core engine (`lib/career-engine.ts`) takes a user profile and produces:

1. **Thread Extraction** — Analyzes skills, experience, education, interests, and preferences to score 8 career dimensions
2. **Pathway Generation** — Creates 5 distinct career paths with scores, timelines, roles, trade-offs, risks, and actions
3. **Skill Gap Identification** — Cross-references required skills across all pathways against user skills
4. **Opportunity Matching** — Ranks opportunities by relevance to user profile and generated pathways

The engine uses careful, non-deterministic language ("appears suitable", "based on your current profile") and avoids prediction language ("you will become", "guaranteed").

### Data Flow

```
User Profile → Career Engine → {
  threads: CareerThread[8],
  pathways: PathwayCard[5],
  skillGaps: SkillGap[],
  opportunities: Opportunity[12],
  summary: string
}
```

## Demo

Click "View Demo" on the landing page to see results for **Aisha Lim**, a final-year computer science student interested in product management, data analytics, and climate technology.

## Suggested Future Improvements

- Real AI integration with streaming responses for deeper analysis
- User authentication and profile persistence
- Real-time job data from APIs (LinkedIn, Indeed, etc.)
- Collaborative features (share your weave, get peer feedback)
- Progress tracking over time (re-analyze periodically)
- Export results as PDF
- Industry-specific pathway templates
- Mentor matching with real mentorship platforms
- Integration with learning platforms for direct course enrollment
- Community features (forums, peer comparisons, success stories)

## License

Built for the Career OS Hackathon 2025.

Copyright 2025 Tenun. All rights reserved.
