"use client";

import { usePathname } from "next/navigation";
import TenunGuideWidget from "./TenunGuideWidget";

/**
 * Routes where the Tenun Guide / chatbot widget is allowed to appear.
 *
 * Temporarily restricted to landing pages while secondary-page UX is being
 * polished. To re-enable the chatbot elsewhere, add the route here (exact match)
 * — or revert to mounting <TenunGuideWidget /> directly in app/layout.tsx.
 */
export const CHATBOT_ALLOWED_ROUTES = ["/", "/employers"];

/**
 * Client-side gate around the floating chatbot. Because `usePathname()` is a
 * client hook, this wrapper keeps the root layout a server component. On
 * disallowed routes it renders nothing at all — the widget is never mounted, so
 * there are no chatbot API calls and no layout shift (the widget is a floating
 * fixed element, so its absence leaves no gap).
 */
export default function TenunGuideVisibilityGate() {
  const pathname = usePathname() ?? "/";

  const shouldShowGuide = CHATBOT_ALLOWED_ROUTES.includes(pathname);

  if (!shouldShowGuide) return null;

  return <TenunGuideWidget />;
}
