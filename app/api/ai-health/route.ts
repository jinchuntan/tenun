import { NextResponse } from "next/server";
import { getAIConfig, pingOpenRouter, pingGroq, type ProviderPing } from "@/lib/llm";

// Always run fresh — never cache provider configuration status.
export const dynamic = "force-dynamic";

/**
 * Safe AI diagnostics. Returns ONLY non-secret configuration (booleans, model
 * ids, node env). It never returns API keys.
 *
 *   GET /api/ai-health            → configuration snapshot
 *   GET /api/ai-health?test=true  → also makes a tiny OpenRouter (+ Groq) call
 *                                    to confirm the provider actually responds
 */
export async function GET(request: Request) {
  const test = new URL(request.url).searchParams.get("test") === "true";
  const cfg = getAIConfig();

  const base = {
    openrouterConfigured: cfg.openrouterConfigured,
    groqConfigured: cfg.groqConfigured,
    openrouterModelDefaults: cfg.openrouterModelDefaults,
    groqModel: cfg.groqModel,
    dataCollection: cfg.dataCollection,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    timestamp: new Date().toISOString(),
  };

  if (!test) {
    return NextResponse.json(base);
  }

  const skipped = (provider: "openrouter" | "groq") =>
    ({ ok: false, provider, model: "—", error: "not configured" } as ProviderPing);

  const [openrouter, groq] = await Promise.all([
    cfg.openrouterConfigured ? pingOpenRouter() : Promise.resolve(skipped("openrouter")),
    cfg.groqConfigured ? pingGroq() : Promise.resolve(skipped("groq")),
  ]);

  console.log(
    `[ai-health] test: openrouter.ok=${openrouter.ok}${openrouter.status ? ` [${openrouter.status}]` : ""} groq.ok=${groq.ok}`
  );

  return NextResponse.json({ ...base, test: { openrouter, groq } });
}
