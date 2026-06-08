import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanString, isValidEmail, maskEmail, LIMITS } from "@/lib/api-validation";

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
    const company = cleanString(body?.company, LIMITS.COMPANY);
    const role = cleanString(body?.role, LIMITS.ROLE);
    const email = cleanString(body?.email, LIMITS.EMAIL);

    if (!company || !email || !role) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // MVP: record the intake server-side. Swap this for a DB/CRM/email later.
    // Email is masked so raw addresses never land in server logs.
    console.info("[employer-intake]", {
      company,
      role,
      email: maskEmail(email),
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
