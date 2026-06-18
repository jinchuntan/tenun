"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccountType } from "@/lib/account";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  loading: boolean;
  /** true when Supabase isn't configured — treat as "auth disabled" for local dev */
  authDisabled: boolean;
}

/** Subscribe to Supabase auth state across a component. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authDisabled, setAuthDisabled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setAuthDisabled(true);
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, authDisabled };
}

/**
 * Kick off Google OAuth, returning to `next` after sign-in.
 * On sign-up we pass the chosen `accountType` along so the callback can
 * persist it (OAuth can't carry sign-up metadata the way email sign-up does).
 */
export async function signInWithGoogle(next: string, accountType?: AccountType) {
  const supabase = createClient();
  if (!supabase) {
    // No Supabase configured — just go straight through (local dev)
    window.location.href = next || "/dashboard";
    return;
  }
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (accountType) params.set("role", accountType);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?${params.toString()}`,
      // Always show Google's account chooser so the user can pick which
      // account to use instead of silently reusing the current session.
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

/** Sign in with email + password. Returns the signed-in user. Throws on failure. */
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const supabase = createClient();
  if (!supabase) throw new Error("Authentication isn't configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

/**
 * Create an account with email + password.
 * Returns `needsConfirmation: true` when Supabase requires email verification
 * before the session is active.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  next: string,
  accountType: AccountType
) {
  const supabase = createClient();
  if (!supabase) throw new Error("Authentication isn't configured.");
  const params = new URLSearchParams({ next, role: accountType });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // account_type lands in raw_user_meta_data so the DB trigger can persist
      // it to profiles, and middleware can read it from the session.
      data: { account_type: accountType },
      emailRedirectTo: `${window.location.origin}/auth/callback?${params.toString()}`,
    },
  });
  if (error) throw error;
  // When email confirmation is on, Supabase returns a user with no active session.
  const needsConfirmation = !data.session;
  return { needsConfirmation };
}
