import Link from "next/link";
import type { Metadata } from "next";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { GAMES } from "@/lib/simulator/games";

export const metadata: Metadata = {
  title: "Job Simulators — Tenun",
  description:
    "Try the actual work before you commit to the career. Play a short, true-to-life simulation of a real job and see if it's for you.",
};

// Roadmap placeholders render as disabled cards so the gallery signals what's
// coming next. Empty now that the first three jobs are live.
const COMING_SOON: { icon: string; role: string; tagline: string }[] = [];

export default function SimulatorGalleryPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <AppTopBar
        breadcrumbs={[{ label: "Job Simulators" }]}
        returnTo={{ href: "/dashboard", label: "Dashboard" }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-600">
            Try the work, not just the title
          </p>
          <h1 className="font-display text-3xl text-navy-900 sm:text-4xl">
            Job Simulators
          </h1>
          <p className="mt-3 leading-relaxed text-navy-600">
            Pick a job and actually do a slice of it — review a pull request, answer a
            client, run an onboarding. Each takes a few minutes and ends with one honest
            question: would you want to do this every day?
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/simulator/${game.id}`}
              className="group flex flex-col rounded-2xl border-2 border-beige-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-navy-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-2xl">
                  {game.icon}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Playable
                </span>
              </div>
              <h2 className="text-lg font-semibold text-navy-900">{game.role}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-navy-600">
                {game.tagline}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-navy-400">~{game.minutes} min</span>
                <span className="font-semibold text-navy-700 transition-transform group-hover:translate-x-0.5">
                  Start →
                </span>
              </div>
            </Link>
          ))}

          {COMING_SOON.map((game) => (
            <div
              key={game.role}
              className="flex flex-col rounded-2xl border-2 border-dashed border-beige-300 bg-white/50 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-beige-100 text-2xl opacity-70">
                  {game.icon}
                </span>
                <span className="rounded-full bg-beige-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy-400">
                  Coming soon
                </span>
              </div>
              <h2 className="text-lg font-semibold text-navy-500">{game.role}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-navy-400">
                {game.tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
