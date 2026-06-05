// Route-aware navigation helpers so every secondary page can offer a sensible
// "back to dashboard" target without relying on router.back() (which breaks
// when a user lands on a page directly from a shared link).

export interface NavTarget {
  href: string;
  label: string;
}

export interface NavLabels {
  dashboard?: string;
  employerHome?: string;
  employerDashboard?: string;
  home?: string;
}

export interface DashboardReturnOptions {
  /** Whether the visitor is signed in (affects public pages). */
  loggedIn?: boolean;
  /** Force employer framing on a public page. */
  employerContext?: boolean;
  /** Translated labels for the return button. */
  labels?: NavLabels;
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
  const l = opts.labels;

  if (p.startsWith("/dashboard")) {
    return { href: "/dashboard", label: l?.dashboard ?? "Dashboard" };
  }

  if (p.startsWith("/employers")) {
    if (p.startsWith("/employers/dashboard")) {
      return { href: "/employers", label: l?.employerHome ?? "Employer Home" };
    }
    return { href: "/employers/dashboard", label: l?.employerDashboard ?? "Employer Dashboard" };
  }

  // Public discovery / profile pages.
  if (opts.employerContext) return { href: "/employers", label: l?.employerHome ?? "Employer Home" };
  if (opts.loggedIn) return { href: "/dashboard", label: l?.dashboard ?? "Dashboard" };
  return { href: "/", label: l?.home ?? "Home" };
}

export const BRAND_NAME = "Tenun";
