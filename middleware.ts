import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dashboardPathFor } from "@/lib/account";

// Candidate workspace. Employers get bounced to their own dashboard.
const CANDIDATE_PREFIXES = ["/dashboard"];
// Employer workspace (the marketing /employers landing stays public).
const EMPLOYER_PREFIXES = ["/employers/dashboard"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always call getUser to refresh the session token
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isEmployerRoute = EMPLOYER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isCandidateRoute = CANDIDATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Unauthenticated users hitting any protected route → login (remember where).
  if ((isEmployerRoute || isCandidateRoute) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but on the wrong side → send them to their own dashboard.
  if (user) {
    // Prefer the session metadata (no DB hit); fall back to the profile row
    // when it's missing (e.g. just after OAuth sign-up, before metadata syncs).
    let accountType = user.user_metadata?.account_type as string | undefined;
    if (accountType !== "employer" && accountType !== "candidate") {
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();
      accountType = data?.account_type ?? accountType;
    }
    const wrongSide =
      (isEmployerRoute && accountType !== "employer") ||
      (isCandidateRoute && accountType === "employer");
    if (wrongSide) {
      const home = request.nextUrl.clone();
      home.pathname = dashboardPathFor(accountType);
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
