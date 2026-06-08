import { NextResponse } from "next/server";

/**
 * Lightweight, reusable API input validation for the MVP.
 *
 * Goal: stop oversized / malformed payloads from reaching AI providers or logs,
 * and return clean 400s for clearly-invalid input — WITHOUT being so strict that
 * normal users are blocked. Oversized strings/arrays are capped (not rejected);
 * only missing-required / wrong-type / bad-email cases produce a 400.
 */

/** Standard input limits (characters / item counts). */
export const LIMITS = {
  QUERY: 300,
  TITLE: 120,
  COMPANY: 120,
  ROLE: 120,
  NAME: 120,
  EMAIL: 254,
  ARRAY_ITEMS: 20,
  ARRAY_ITEM: 80,
  /** Free-text experience / notes / context sent to AI. */
  CONTEXT: 8000,
  /** Résumé / CV text sent to AI. */
  RESUME: 100000,
  /** Whole structured payload stringified into a personalization prompt. */
  AI_PAYLOAD: 16000,
  OUTREACH_SUBJECT: 200,
  OUTREACH_BODY: 8000,
} as const;

/** Trim and hard-cap a string. Non-strings become "". */
export function cleanString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Like cleanString but returns undefined when empty (handy for optional fields). */
export function optionalString(value: unknown, max: number): string | undefined {
  const s = cleanString(value, max);
  return s.length > 0 ? s : undefined;
}

/** Cap an array to N items, trimming + length-capping each string entry. */
export function cleanStringArray(
  value: unknown,
  maxItems: number = LIMITS.ARRAY_ITEMS,
  maxLen: number = LIMITS.ARRAY_ITEM
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().slice(0, maxLen))
    .filter((x) => x.length > 0)
    .slice(0, maxItems);
}

/** Basic email shape + length validation. */
export function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= LIMITS.EMAIL &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

/** Mask an email for logs: `jane.doe@example.com` → `j***@example.com`. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

/** Clean 400 response with a friendly message. */
export function badRequest(message = "Invalid request."): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
