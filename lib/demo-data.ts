import { UserProfile } from "./types";
import { demoFormDataToUserProfile } from "./profile-form";

/**
 * Aisha Lim — the "Load demo profile" persona.
 *
 * Demo data is intentionally COMPLETE and FICTIONAL: unlike real CV parsing
 * (which must be evidence-based and must never invent missing facts), the demo
 * is free to fill every field so the profile wizard looks fully populated.
 *
 * Single source of truth: `getAishaDemoFormData()` in ./profile-form. This
 * `UserProfile` is derived from it (no duplicate Aisha data) and is what the
 * dashboard consumes for `/dashboard?demo=true` and the "generalist" persona.
 */
export const demoProfile: UserProfile = demoFormDataToUserProfile();
