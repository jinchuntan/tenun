// Shared account-type helpers used by both client (auth form) and server
// (middleware, OAuth callback). Kept free of client-only imports so it can
// be pulled into server code safely.

export type AccountType = "candidate" | "employer";

export function isAccountType(value: unknown): value is AccountType {
  return value === "candidate" || value === "employer";
}

/** The home dashboard for a given account type. Defaults to the candidate side. */
export function dashboardPathFor(accountType?: string | null): string {
  return accountType === "employer" ? "/employers/dashboard" : "/dashboard";
}

/** True for paths that live inside the employer workspace. */
export function isEmployerPath(path: string): boolean {
  return path.startsWith("/employers");
}

/**
 * Where to send a user after auth. The account type wins: a `next` is only
 * honoured when it belongs to the same workspace as the account, so an
 * employer never lands on a candidate page (and vice versa).
 */
export function destinationFor(accountType: string | null | undefined, next?: string | null): string {
  const home = dashboardPathFor(accountType);
  if (!next) return home;
  const wantsEmployer = accountType === "employer";
  return isEmployerPath(next) === wantsEmployer ? next : home;
}
