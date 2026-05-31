import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow redirects to internal paths — never to external domains
function sanitizeNext(next: string | null, origin: string): string {
  if (!next) return "/dashboard";
  try {
    // If it parses as an absolute URL pointing elsewhere, reject it
    const url = new URL(next, origin);
    if (url.origin !== origin) return "/dashboard";
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"), origin);

  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(
      `${origin}/login?auth_error=${encodeURIComponent(providerError)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?auth_error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?auth_error=missing_code`);
}
