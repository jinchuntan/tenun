import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/** Consistent page title block: optional eyebrow, title, description, actions. */
export function PageHeader({ title, description, eyebrow, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={["flex flex-wrap items-end justify-between gap-4", className].join(" ")}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-1.5">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl sm:text-3xl text-navy-900 leading-tight">{title}</h1>
        {description && <p className="text-sm text-navy-500 mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
