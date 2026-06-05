import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

/** Branded spinner for loading screens. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-12 h-12 mb-4">
        <span className="absolute inset-0 rounded-full border-2 border-gold-500/25" />
        <Loader2 className="absolute inset-0 m-auto w-6 h-6 animate-spin text-navy-700" />
      </div>
      <p className="text-sm font-medium text-navy-600">{label}</p>
    </div>
  );
}

interface StateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

function ActionButton({ action, primary }: { action: StateAction; primary?: boolean }) {
  const cls = primary
    ? "inline-flex items-center gap-1.5 rounded-lg bg-navy-900 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-800 transition-colors"
    : "inline-flex items-center gap-1.5 rounded-lg border border-beige-300 bg-white text-navy-700 px-4 py-2 text-sm font-medium hover:border-navy-300 transition-colors";
  if (action.href) {
    return <Link href={action.href} className={cls}>{action.label}</Link>;
  }
  return <button type="button" onClick={action.onClick} className={cls}>{action.label}</button>;
}

/** Branded error card with clear next steps. */
export function ErrorState({
  title = "Something went wrong",
  message,
  actions = [],
}: {
  title?: string;
  message?: string;
  actions?: StateAction[];
}) {
  return (
    <div className="max-w-md mx-auto rounded-2xl border border-beige-300/70 bg-white p-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-base font-bold text-navy-900 mb-1.5">{title}</h2>
      {message && <p className="text-sm text-navy-500 mb-5">{message}</p>}
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actions.map((a, i) => (
            <ActionButton key={a.label} action={a} primary={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Branded empty-state card with a clear next step. */
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: StateAction;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white border border-beige-300/70 flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-6 h-6 text-navy-300" />}
      </div>
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      {message && <p className="text-xs text-navy-500 mt-1 mb-5 max-w-sm">{message}</p>}
      {action && <ActionButton action={action} primary />}
    </div>
  );
}
