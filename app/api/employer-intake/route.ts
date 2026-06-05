import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Employer role-intake endpoint (MVP).
 *
 * Captures an employer's hiring interest. There is intentionally no datastore
 * yet — this validates the payload, logs it server-side, and returns success so
 * the landing page never blocks. A real persistence layer can be added later
 * without changing the client contract.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("default", ip);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const body = await request.json();
    const { company, email, role } = body as { company?: string; email?: string; role?: string };

    if (!company?.trim() || !email?.trim() || !role?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // MVP: record the intake server-side. Swap this for a DB/CRM/email later.
    console.info("[employer-intake]", {
      company,
      role,
      email,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
