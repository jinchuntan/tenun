"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

/** Kick off Google OAuth, returning to `next` after sign-in. */
export async function signInWithGoogle(next: string) {
  const supabase = createClient();
  if (!supabase) {
    // No Supabase configured — just go straight through (local dev)
    window.location.href = next;
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) throw error;
}

/** Sign in with email + password. Throws on failure. */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Authentication isn't configured.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Create an account with email + password.
 * Returns `needsConfirmation: true` when Supabase requires email verification
 * before the session is active.
 */
export async function signUpWithEmail(email: string, password: string, next: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Authentication isn't configured.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
  // When email confirmation is on, Supabase returns a user with no active session.
  const needsConfirmation = !data.session;
  return { needsConfirmation };
}
