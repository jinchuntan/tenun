import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { PageBreadcrumbs, type Crumb } from "./PageBreadcrumbs";
import { BRAND_NAME, type NavTarget } from "@/lib/navigation";

interface AppTopBarProps {
  /** Breadcrumb trail shown after the brand (desktop only). */
  breadcrumbs?: Crumb[];
  /** Primary return button on the right (e.g. "Dashboard"). */
  returnTo?: NavTarget;
  /** Extra contextual actions rendered before the return button. */
  actions?: ReactNode;
  /** Where the brand wordmark links to. Defaults to the landing page. */
  brandHref?: string;
  className?: string;
}

/**
 * Slim, Tenun-branded top bar for secondary pages that don't use the marketing
 * Navbar (e.g. the CV flow). Keeps the user oriented: brand on the left,
 * breadcrumbs, contextual actions, and a clear route-aware return on the right.
 */
export function AppTopBar({
  breadcrumbs, returnTo, actions, brandHref = "/", className = "",
}: AppTopBarProps) {
  return (
    <header
      className={[
        "sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-beige-300/60",
        className,
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link
          href={brandHref}
          aria-label={`${BRAND_NAME} home`}
          className="shrink-0 text-xl font-black tracking-tight text-navy-900 hover:opacity-80 transition-opacity"
        >
          {BRAND_NAME}
        </Link>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <span className="hidden sm:block h-4 w-px bg-beige-300 shrink-0" aria-hidden="true" />
            <PageBreadcrumbs items={breadcrumbs} className="hidden sm:block min-w-0" />
          </>
        )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {actions}
          {returnTo && (
            <Link
              href={returnTo.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-navy-800 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{returnTo.label}</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
