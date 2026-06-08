"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { UserProfile, CareerWeaveResult, PathwayCard, SkillGap } from "@/lib/types";
import {
  type DashboardPersonalization,
  type PathwayExplanation,
  type SkillGapExplanation,
  fetchDashboardSummary,
  fetchPathwayExplanation,
  fetchSkillGapExplanations,
  personalizationFingerprint,
  readCachedSummary,
  writeCachedSummary,
} from "@/lib/personalization";

/**
 * Holds the AI personalization LAYER for the dashboard. It fetches the
 * personalized summary once (cached in sessionStorage), and lazily fetches
 * per-pathway and skill-gap explanations on demand so we never spam the API on
 * initial load. Every value degrades to a deterministic fallback: if AI is
 * unavailable or fails, `summaryStatus` becomes "fallback" and panes render the
 * existing seeded/computed content instead.
 */

type LoadStatus = "loading" | "ready" | "fallback";
type FetchStatus = "idle" | "loading" | "ready" | "error";

interface PathwayEntry {
  status: "loading" | "ready" | "error";
  data?: PathwayExplanation;
}

interface PersonalizationValue {
  /** True while AI looks usable (no terminal "fallback"). Panes use this to decide whether to attempt lazy calls. */
  aiAvailable: boolean;
  summary: DashboardPersonalization | null;
  summaryStatus: LoadStatus;
  retrySummary: () => void;
  getPathway: (id: string) => PathwayEntry | undefined;
  ensurePathway: (pathway: PathwayCard) => void;
  skillGapStatus: FetchStatus;
  skillGapByKey: Record<string, SkillGapExplanation>;
  ensureSkillGaps: (pathwayName: string, gaps: SkillGap[]) => void;
}

const DEFAULT_VALUE: PersonalizationValue = {
  aiAvailable: false,
  summary: null,
  summaryStatus: "fallback",
  retrySummary: () => {},
  getPathway: () => undefined,
  ensurePathway: () => {},
  skillGapStatus: "idle",
  skillGapByKey: {},
  ensureSkillGaps: () => {},
};

const PersonalizationContext = createContext<PersonalizationValue>(DEFAULT_VALUE);

export function useDashboardPersonalization(): PersonalizationValue {
  return useContext(PersonalizationContext);
}

export function DashboardPersonalizationProvider({
  profile,
  result,
  children,
}: {
  profile: UserProfile;
  result: CareerWeaveResult;
  children: React.ReactNode;
}) {
  const { locale } = useLanguage();

  // Latest props/locale held in refs so the lazy callbacks stay stable.
  const profileRef = useRef(profile);
  const resultRef = useRef(result);
  const localeRef = useRef(locale);
  profileRef.current = profile;
  resultRef.current = result;
  localeRef.current = locale;

  const [summary, setSummary] = useState<DashboardPersonalization | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<LoadStatus>("loading");
  const [pathwayMap, setPathwayMap] = useState<Record<string, PathwayEntry>>({});
  const [skillGapByKey, setSkillGapByKey] = useState<Record<string, SkillGapExplanation>>({});
  const [skillGapStatus, setSkillGapStatus] = useState<FetchStatus>("idle");
  const fetchedSkillPaths = useRef<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // Cache key changes when the profile, target job, or locale changes.
  const cacheKey = personalizationFingerprint(profile, result.targetJob) + ":" + locale;

  useEffect(() => {
    let cancelled = false;

    // Reset lazy caches whenever the inputs change.
    setPathwayMap({});
    setSkillGapByKey({});
    setSkillGapStatus("idle");
    fetchedSkillPaths.current = new Set();

    const cached = readCachedSummary(cacheKey);
    if (cached) {
      setSummary(cached);
      setSummaryStatus("ready");
      return;
    }

    setSummary(null);
    setSummaryStatus("loading");

    fetchDashboardSummary({
      profile: profileRef.current,
      archetype: resultRef.current.archetype,
      threads: resultRef.current.threads,
      pathways: resultRef.current.pathways,
      recommendedPathway: resultRef.current.recommendedPathway,
      skillGaps: resultRef.current.skillGaps,
      targetJob: resultRef.current.targetJob,
      locale: localeRef.current,
    }).then((data) => {
      if (cancelled) return;
      if (data) {
        setSummary(data);
        setSummaryStatus("ready");
        writeCachedSummary(cacheKey, data);
      } else {
        setSummary(null);
        setSummaryStatus("fallback");
      }
    });

    return () => {
      cancelled = true;
    };
    // cacheKey captures profile/targetJob/locale; reloadKey forces a manual retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, reloadKey]);

  const retrySummary = useCallback(() => setReloadKey((k) => k + 1), []);

  const ensurePathway = useCallback((pathway: PathwayCard) => {
    setPathwayMap((prev) => {
      if (prev[pathway.id]) return prev; // already loading / ready / error
      fetchPathwayExplanation({
        profile: profileRef.current,
        pathway,
        targetJob: resultRef.current.targetJob,
        locale: localeRef.current,
      }).then((data) => {
        setPathwayMap((m) => ({
          ...m,
          [pathway.id]: data ? { status: "ready", data } : { status: "error" },
        }));
      });
      return { ...prev, [pathway.id]: { status: "loading" } };
    });
  }, []);

  const getPathway = useCallback(
    (id: string) => pathwayMap[id],
    [pathwayMap]
  );

  const ensureSkillGaps = useCallback((pathwayName: string, gaps: SkillGap[]) => {
    if (gaps.length === 0) return;
    if (fetchedSkillPaths.current.has(pathwayName)) return;
    fetchedSkillPaths.current.add(pathwayName);
    setSkillGapStatus("loading");
    fetchSkillGapExplanations({
      profile: profileRef.current,
      pathwayName,
      skillGaps: gaps,
      targetJob: resultRef.current.targetJob,
      locale: localeRef.current,
    }).then((list) => {
      if (!list) {
        setSkillGapStatus((s) => (s === "ready" ? s : "error"));
        return;
      }
      setSkillGapByKey((prev) => {
        const next = { ...prev };
        for (const e of list) next[e.skill.toLowerCase()] = e;
        return next;
      });
      setSkillGapStatus("ready");
    });
  }, []);

  const value: PersonalizationValue = {
    aiAvailable: summaryStatus !== "fallback",
    summary,
    summaryStatus,
    retrySummary,
    getPathway,
    ensurePathway,
    skillGapStatus,
    skillGapByKey,
    ensureSkillGaps,
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}
