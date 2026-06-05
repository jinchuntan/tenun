import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageBreadcrumbs, type Crumb } from "./PageBreadcrumbs";
import type { NavTarget } from "@/lib/navigation";

/**
 * Lightweight breadcrumb + return row for pages that already render the
 * marketing <Navbar /> (profile, jobs, companies, employer dashboard). It adds
 * orientation and a clear route-aware return without a second brand bar.
 */
export function SubNavBar({
  breadcrumbs, returnTo, className = "",
}: {
  breadcrumbs?: Crumb[];
  returnTo: NavTarget;
  className?: string;
}) {
  return (
    <div className={["flex items-center justify-between gap-3", className].join(" ")}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <PageBreadcrumbs items={breadcrumbs} className="min-w-0" />
      ) : (
        <span aria-hidden="true" />
      )}
      <Link
        href={returnTo.href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors shrink-0"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {returnTo.label}
      </Link>
    </div>
  );
}
