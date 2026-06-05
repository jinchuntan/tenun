import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const SIZE_PX: Record<SpinnerSize, number> = { sm: 14, md: 20, lg: 28 };

interface LoadingSpinnerProps {
  /** Visual size of the spinner. */
  size?: SpinnerSize;
  /** Optional visible label shown next to the spinner. */
  label?: string;
  /** Extra classes for the wrapper. */
  className?: string;
  /** Extra classes for the label text. */
  labelClassName?: string;
}

/**
 * Tenun loading spinner. Uses `animate-spin` (kept rotating even under
 * prefers-reduced-motion via a globals.css exemption, so it never looks
 * frozen) and is accessible via role="status" + an sr-only label.
 */
export function LoadingSpinner({
  size = "md",
  label,
  className,
  labelClassName,
}: LoadingSpinnerProps) {
  const px = SIZE_PX[size];
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-2", className)}>
      <Loader2
        className="animate-spin text-gold-600 shrink-0"
        style={{ width: px, height: px }}
        aria-hidden="true"
      />
      {label ? <span className={cn("text-navy-600", labelClassName)}>{label}</span> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </span>
  );
}
