import type { ReactNode } from "react";
import { AppTopBar } from "./AppTopBar";
import type { Crumb } from "./PageBreadcrumbs";
import type { NavTarget } from "@/lib/navigation";

interface AppPageShellProps {
  breadcrumbs?: Crumb[];
  returnTo?: NavTarget;
  topActions?: ReactNode;
  children: ReactNode;
  /** Tailwind max-width class for the content column. */
  maxWidth?: string;
  className?: string;
}

/**
 * Page shell for secondary pages without the marketing Navbar: a Tenun-branded
 * top bar over the warm cream background. Use directly for list/content pages;
 * for bespoke layouts (wizard, print preview) compose <AppTopBar /> instead.
 */
export function AppPageShell({
  breadcrumbs, returnTo, topActions, children, maxWidth = "max-w-5xl", className = "",
}: AppPageShellProps) {
  return (
    <div className={["min-h-screen bg-[#f5f0e8]", className].join(" ")}>
      <AppTopBar breadcrumbs={breadcrumbs} returnTo={returnTo} actions={topActions} />
      <main className={[maxWidth, "mx-auto px-4 sm:px-6 py-8"].join(" ")}>{children}</main>
    </div>
  );
}
