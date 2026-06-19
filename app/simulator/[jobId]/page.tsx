import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { SimulatorPlayer } from "@/components/simulator/SimulatorPlayer";
import { GAMES, getGame } from "@/lib/simulator/games";
import { isBespoke } from "@/lib/simulator/bespoke";

export function generateStaticParams() {
  return GAMES.map((g) => ({ jobId: g.id }));
}

export function generateMetadata({ params }: { params: { jobId: string } }): Metadata {
  const game = getGame(params.jobId);
  if (!game) return { title: "Job Simulator — Tenun" };
  return {
    title: `${game.role} Simulator — Tenun`,
    description: game.tagline,
  };
}

export default function SimulatorPlayPage({ params }: { params: { jobId: string } }) {
  const game = getGame(params.jobId);
  if (!game) notFound();

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <AppTopBar
        breadcrumbs={[
          { label: "Job Simulators", href: "/simulator" },
          { label: game.role },
        ]}
        returnTo={{ href: "/simulator", label: "All simulators" }}
      />
      <div
        className={`mx-auto px-4 py-8 sm:py-10 ${
          isBespoke(game.id) ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <SimulatorPlayer game={game} />
      </div>
    </div>
  );
}
