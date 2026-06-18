import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { destinationFor, isAccountType } from "@/lib/account";

// Only allow redirects to internal paths — never to external domains.
// Returns null when there is no usable `next`, so the caller can fall back
// to the account-type home dashboard.
function sanitizeNext(next: string | null, origin: string): string | null {
  if (!next) return null;
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"), origin);
  const roleParam = searchParams.get("role");

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
      const { data: { user } } = await supabase.auth.getUser();
      let role = user?.user_metadata?.account_type as string | undefined;

      // On OAuth sign-up the role can't ride in the sign-up metadata, so it's
      // passed as a query param. Persist it once (to the session + profile)
      // when it differs from what's stored.
      if (user && isAccountType(roleParam) && role !== roleParam) {
        await supabase.auth.updateUser({ data: { account_type: roleParam } });
        await supabase.from("profiles").update({ account_type: roleParam }).eq("id", user.id);
        role = roleParam;
      }

      return NextResponse.redirect(`${origin}${destinationFor(role, next)}`);
    }
    return NextResponse.redirect(
      `${origin}/login?auth_error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?auth_error=missing_code`);
}
