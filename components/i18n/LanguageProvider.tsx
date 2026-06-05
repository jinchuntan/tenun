"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type Locale,
  type Translations,
  LOCALES,
  translate,
  translations,
} from "@/lib/i18n";

/**
 * Client-side language context. Holds the selected locale, persists it to
 * localStorage, keeps <html lang> in sync, and exposes a `t` dot-path helper
 * plus the raw `dict` tree (handy for arrays/objects the helper can't return).
 */

const STORAGE_KEY = "tenun-locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Dot-path string lookup, e.g. t("home.explore"). */
  t: (path: string) => string;
  /** The full translation tree for the active locale (for arrays/objects). */
  dict: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "ms";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load the saved preference once on mount (default stays "en").
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(saved)) setLocaleState(saved);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  // Reflect the active locale on <html lang> for a11y/SEO.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (path: string) => translate(locale, path),
      dict: translations[locale],
    }),
    [locale, setLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
