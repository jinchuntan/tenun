"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser, setAuthDisabled } from "@/store/slices/authSlice";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      dispatch(setAuthDisabled());
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      dispatch(setUser(data.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
