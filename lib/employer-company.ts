// Company profile + lightweight verification for the employer onboarding loop.
// Verification is simulated: a non-free email domain verifies instantly,
// and the SSM number runs an async (faked) check.

export type SsmStatus = "unverified" | "pending" | "verified";

export interface CompanyProfile {
  companyName: string;
  hiringManager: string;
  workEmail: string;
  ssmNumber: string;
  /** True when the work email uses a company domain (not a free provider). */
  domainVerified: boolean;
  ssmStatus: SsmStatus;
}

export const EMPTY_PROFILE: CompanyProfile = {
  companyName: "",
  hiringManager: "",
  workEmail: "",
  ssmNumber: "",
  domainVerified: false,
  ssmStatus: "unverified",
};

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com",
  "outlook.com", "live.com", "icloud.com", "me.com", "proton.me", "protonmail.com",
  "aol.com", "mail.com", "gmx.com",
]);

export function emailDomain(email: string): string | null {
  const m = email.trim().toLowerCase().match(/^[^@\s]+@([^@\s]+\.[^@\s]+)$/);
  return m ? m[1] : null;
}

/** A valid email on a non-free (company) domain. */
export function isWorkEmail(email: string): boolean {
  const domain = emailDomain(email);
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

/** Fully verified = company domain confirmed AND SSM check passed. */
export function isFullyVerified(p: CompanyProfile): boolean {
  return p.domainVerified && p.ssmStatus === "verified";
}
