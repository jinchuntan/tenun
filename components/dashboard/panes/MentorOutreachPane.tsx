"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  UserPlus, Mail, Linkedin, Reply, Sparkles, Loader2, RefreshCw,
  Copy, Check, MapPin, CheckCircle2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile, PathwayCard, SkillGap, Mentor } from "@/lib/types";
import { getMatchingMentors } from "@/lib/mentor-data";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useDashboardPersonalization } from "@/components/dashboard/personalization-context";
import { fetchOutreachDraft } from "@/lib/personalization";

/**
 * Combined Mentors + Outreach pane. Left = pick a mentor, right = prepare the
 * message. Replaces the old separate "Mentors" (swipe deck) and "Outreach"
 * (studio) tabs with one simple "Choose who to contact, then write your message"
 * flow. Drafting is deterministic by default and AI-assisted when available,
 * with graceful fallback — the page never depends on AI.
 */

type DraftType = "mentorship-request" | "cold-email" | "linkedin-message" | "follow-up";

const MESSAGE_TYPES: { type: DraftType; label: string; icon: React.ElementType }[] = [
  { type: "mentorship-request", label: "Mentorship", icon: UserPlus },
  { type: "cold-email", label: "Email", icon: Mail },
  { type: "linkedin-message", label: "LinkedIn", icon: Linkedin },
  { type: "follow-up", label: "Follow-up", icon: Reply },
];

/** Types where a subject line makes sense (LinkedIn messages have none). */
const HAS_SUBJECT = new Set<DraftType>(["mentorship-request", "cold-email", "follow-up"]);

interface Draft {
  subject?: string;
  body: string;
}

interface Props {
  profile: UserProfile;
  pathways: PathwayCard[];
  recommendedPathwayId: string;
  skillGaps: SkillGap[];
}

// ── Deterministic draft builder (always available, no AI) ───────────────────

function topSkills(profile: UserProfile, n = 3): string {
  return profile.skills.slice(0, n).join(", ") || "a few core skills I'm developing";
}

/** First sentence of experience, or null when there's little to draw on. */
function experienceLine(profile: UserProfile): string | null {
  const exp = profile.experience?.trim();
  if (!exp || exp.length < 25) return null;
  const first = exp.split(/[.!]\s/)[0];
  return first.length > 130 ? first.slice(0, 127) + "…" : first;
}

function buildDraft(profile: UserProfile, mentor: Mentor, type: DraftType, pathwayName: string): Draft {
  const name = profile.name || "there";
  const role = profile.currentRole || "early-career professional";
  const skills = topSkills(profile);
  const focus = mentor.expertise[0] || "your field";
  const exp = experienceLine(profile);
  // Honest phrasing when the user has little experience to point to.
  const credibility = exp
    ? `So far, ${exp.charAt(0).toLowerCase() + exp.slice(1)}.`
    : `I'm currently building experience in ${skills}.`;

  switch (type) {
    case "mentorship-request":
      return {
        subject: `Mentorship request from ${name}`,
        body: `Dear ${mentor.name},

My name is ${name}, a ${role}. I really admire your work in ${focus} at ${mentor.organization}.

I'm exploring a path toward ${pathwayName}, and your experience resonates with where I'm trying to grow. ${credibility}

Would you be open to a short 20–25 minute mentorship conversation? I'm flexible around your schedule and will come prepared with specific questions.

Thank you for considering,
${name}`,
      };

    case "cold-email":
      return {
        subject: `Reaching out — ${name}, ${role}`,
        body: `Hi ${mentor.name},

My name is ${name}, a ${role} with a focus on ${skills}. I came across your work in ${focus} at ${mentor.organization} and found it genuinely inspiring.

${credibility} I'm working toward ${pathwayName} and would love to learn from your perspective.

Would you have 15 minutes for a quick call or email exchange? I'd really appreciate any guidance you can share.

Thank you for your time,
${name}`,
      };

    case "linkedin-message":
      return {
        body: `Hi ${mentor.name}, I came across your profile and was inspired by your work in ${focus} at ${mentor.organization}. I'm a ${role} exploring ${pathwayName}, and ${exp ? "building on " + skills : "currently building experience in " + skills}. Would you be open to a short virtual coffee chat? Thank you! — ${name}`,
      };

    case "follow-up":
      return {
        subject: `Following up — ${name}`,
        body: `Hi ${mentor.name},

I hope you're doing well. I wanted to gently follow up on my earlier note about connecting around ${pathwayName} and your experience in ${focus}.

I completely understand things get busy. If you have 15 minutes at any point, I'd still really value a short conversation. ${credibility}

Thank you again,
${name}`,
      };
  }
}

// ── Pane ────────────────────────────────────────────────────────────────────

export function MentorOutreachPane({ profile, pathways, recommendedPathwayId, skillGaps }: Props) {
  const { locale } = useLanguage();
  const { aiAvailable } = useDashboardPersonalization();

  const mentors = useMemo(
    () => getMatchingMentors(profile.interests, profile.preferredIndustries, profile.riskAppetite),
    [profile.interests, profile.preferredIndustries, profile.riskAppetite]
  );

  const pathwayName =
    pathways.find((p) => p.id === recommendedPathwayId)?.name ?? "your chosen path";

  const [selectedId, setSelectedId] = useState<string>(mentors[0]?.id ?? "");
  const [type, setType] = useState<DraftType>("mentorship-request");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const selected = mentors.find((m) => m.id === selectedId) ?? mentors[0];

  // Keep the draft in sync with the selected mentor + message type so the panel
  // always reflects "who you're contacting". Editing then switching recipient
  // intentionally regenerates (it's a new message).
  useEffect(() => {
    if (!selected) return;
    setDraft(buildDraft(profile, selected, type, pathwayName));
    setCopied(false);
    setAiError(false);
  }, [selectedId, type, selected, profile, pathwayName]);

  const regenerate = useCallback(() => {
    if (!selected) return;
    setDraft(buildDraft(profile, selected, type, pathwayName));
    setCopied(false);
    setAiError(false);
  }, [selected, profile, type, pathwayName]);

  const writeWithAI = useCallback(async () => {
    if (!selected) return;
    setAiLoading(true);
    setAiError(false);
    setCopied(false);

    const base = buildDraft(profile, selected, type, pathwayName);
    const ai = await fetchOutreachDraft({
      profile,
      messageType: type,
      pathwayName,
      recipientContext: `${selected.name}, ${selected.title} at ${selected.organization}`,
      skillGaps: skillGaps.map((g) => g.skill),
      resumeText: profile.resumeText,
      baseDraft: { subject: base.subject, body: base.body },
      locale,
    });

    if (ai) {
      setDraft({ subject: HAS_SUBJECT.has(type) ? ai.subject ?? base.subject : undefined, body: ai.body });
    } else {
      setAiError(true);
      setDraft(base);
    }
    setAiLoading(false);
  }, [selected, profile, type, pathwayName, skillGaps, locale]);

  const handleCopy = async () => {
    if (!draft) return;
    const text = draft.subject ? `Subject: ${draft.subject}\n\n${draft.body}` : draft.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const mailtoHref =
    selected?.email && draft
      ? `mailto:${selected.email}?subject=${encodeURIComponent(draft.subject ?? "")}&body=${encodeURIComponent(draft.body)}`
      : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-navy-900">Mentors &amp; Outreach</h2>
        <p className="text-xs text-navy-500 mt-0.5">
          Choose who to contact, then prepare your message. Drafts are editable — nothing is sent automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4 sm:gap-5 items-start">
        {/* Left — mentor selection */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider">
            Suggested mentors
          </p>
          {mentors.length === 0 ? (
            <p className="text-xs text-navy-400">No mentors matched your profile yet.</p>
          ) : (
            mentors.map((m, i) => (
              <MentorCard
                key={m.id}
                mentor={m}
                topMatch={i === 0}
                selected={m.id === selected?.id}
                onSelect={() => setSelectedId(m.id)}
              />
            ))
          )}
        </div>

        {/* Right — outreach / email draft */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 lg:sticky lg:top-4">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider">To</p>
                  <p className="text-sm font-bold text-navy-900 truncate">{selected.name}</p>
                  <p className="text-xs text-navy-500 truncate">{selected.title} · {selected.organization}</p>
                </div>
              </div>

              {/* Message type */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {MESSAGE_TYPES.map((mt) => {
                  const Icon = mt.icon;
                  const active = type === mt.type;
                  return (
                    <button
                      key={mt.type}
                      type="button"
                      onClick={() => setType(mt.type)}
                      aria-pressed={active}
                      className={[
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                        active ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100",
                      ].join(" ")}
                    >
                      <Icon className="w-3.5 h-3.5" /> {mt.label}
                    </button>
                  );
                })}
              </div>

              {/* Subject */}
              {draft?.subject !== undefined && (
                <div className="mt-4">
                  <label className="text-[10px] font-medium text-navy-500 mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft((d) => (d ? { ...d, subject: e.target.value } : d))}
                    className="w-full bg-beige-50 border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
                  />
                </div>
              )}

              {/* Body */}
              <div className="mt-3">
                <label className="text-[10px] font-medium text-navy-500 mb-1 block">Message</label>
                <textarea
                  value={draft?.body ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, body: e.target.value } : { body: e.target.value }))}
                  className="w-full min-h-[220px] sm:min-h-[260px] bg-beige-50 border border-navy-200 rounded-lg px-3 py-3 text-xs text-navy-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy-300 resize-y"
                />
              </div>

              {aiError && (
                <p className="text-[10px] text-amber-600 mt-2">
                  AI is unavailable right now — here&apos;s an editable template draft.
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {aiAvailable && (
                  <Button onClick={writeWithAI} disabled={aiLoading} size="sm" className="gap-1.5">
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {aiLoading ? "Writing…" : "Write with AI"}
                  </Button>
                )}
                <Button onClick={regenerate} variant="outline" size="sm" className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> {aiAvailable ? "Template" : "Regenerate"}
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-900 text-white text-xs font-medium hover:bg-navy-700 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Open email
                  </a>
                )}
                {selected.linkedinUrl && type === "linkedin-message" && (
                  <a
                    href={selected.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800 transition-colors"
                  >
                    Open LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <p className="text-[10px] text-navy-400 mt-3">
                Edit anything above, then copy or open your email client. Tenun never sends on your behalf.
              </p>
            </>
          ) : (
            <p className="text-sm text-navy-400">Select a mentor to start a draft.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mentor card (left column) ───────────────────────────────────────────────

function MentorCard({
  mentor,
  topMatch,
  selected,
  onSelect,
}: {
  mentor: Mentor;
  topMatch: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "w-full text-left rounded-2xl border p-4 transition-all",
        selected
          ? "border-navy-700 bg-navy-50/60 ring-1 ring-navy-700"
          : "border-gray-200 bg-white hover:border-navy-300",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-navy-600 to-gold-500 text-white flex items-center justify-center text-sm font-bold">
          {mentor.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-navy-900 truncate">{mentor.name}</p>
            {topMatch && (
              <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700 uppercase tracking-wide">
                Top match
              </span>
            )}
            {selected && <CheckCircle2 className="w-4 h-4 text-navy-700 shrink-0 ml-auto" />}
          </div>
          <p className="text-xs text-navy-500 truncate">{mentor.title} · {mentor.organization}</p>
          <p className="flex items-center gap-1 text-[11px] text-navy-400 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {mentor.location}
          </p>

          <div className="flex flex-wrap gap-1 mt-2">
            {mentor.expertise.slice(0, 3).map((e) => (
              <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-navy-50 text-navy-600 border border-navy-100">
                {e}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-navy-500 leading-snug mt-2 line-clamp-2">{mentor.matchReason}</p>

          <span
            className={[
              "inline-block mt-2.5 text-[11px] font-semibold px-3 py-1 rounded-full",
              selected ? "bg-navy-700 text-white" : "bg-navy-100 text-navy-700",
            ].join(" ")}
          >
            {selected ? "Selected" : "Use this mentor"}
          </span>
        </div>
      </div>
    </button>
  );
}
