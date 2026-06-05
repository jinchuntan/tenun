import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail using real links. The last item is the current page and is
 * never a link. Items stay on one line and truncate rather than wrap, so the
 * trail never overflows its container.
 */
export function PageBreadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-xs min-w-0">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-navy-500 hover:text-navy-900 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={[
                    "whitespace-nowrap",
                    last ? "text-navy-900 font-semibold truncate max-w-[40vw] sm:max-w-none" : "text-navy-500",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="w-3 h-3 text-navy-300 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
