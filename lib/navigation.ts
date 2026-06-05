// Route-aware navigation helpers so every secondary page can offer a sensible
// "back to dashboard" target without relying on router.back() (which breaks
// when a user lands on a page directly from a shared link).

export interface NavTarget {
  href: string;
  label: string;
}

export interface DashboardReturnOptions {
  /** Whether the visitor is signed in (affects public pages). */
  loggedIn?: boolean;
  /** Force employer framing on a public page. */
  employerContext?: boolean;
}

/**
 * Decide where the primary "return" button should point for a given route.
 *
 * Rules:
 * - `/dashboard*`           → the user dashboard.
 * - `/employers/dashboard*` → employer home (avoids a circular self-link).
 * - other `/employers*`     → the employer dashboard.
 * - public pages (jobs / companies / profile): employer home, the user
 *   dashboard, or the landing page depending on context.
 */
export function getDashboardReturn(
  pathname: string | null | undefined,
  opts: DashboardReturnOptions = {}
): NavTarget {
  const p = pathname ?? "";

  if (p.startsWith("/dashboard")) {
    return { href: "/dashboard", label: "Dashboard" };
  }

  if (p.startsWith("/employers")) {
    if (p.startsWith("/employers/dashboard")) {
      return { href: "/employers", label: "Employer Home" };
    }
    return { href: "/employers/dashboard", label: "Employer Dashboard" };
  }

  // Public discovery / profile pages.
  if (opts.employerContext) return { href: "/employers", label: "Employer Home" };
  if (opts.loggedIn) return { href: "/dashboard", label: "Dashboard" };
  return { href: "/", label: "Home" };
}

export const BRAND_NAME = "Tenun";
