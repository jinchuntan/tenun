"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, Send, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

/**
 * Tenun Guide — a floating mascot chatbot that helps users figure out where to
 * go next on the site. The mascot launcher animates to feel alive; the chat
 * panel talks to /api/site-guide (OpenRouter primary, Groq fallback) which
 * answers strictly from the controlled knowledge base. No API keys touch the
 * browser; only the public support email is read here for the escalation copy.
 */

const MASCOT_SRC = "/images/tenun-mascot.png";
const MAX_MESSAGE_LENGTH = 1000;

// Routes where the guide should stay out of the way.
const HIDDEN_PREFIXES = ["/auth/callback"];
const HIDDEN_PATTERNS = [/\/preview$/, /\/cv\/[^/]+\/preview/];

type ChatRole = "user" | "assistant";
type ChatMessage = { id: string; role: ChatRole; content: string };
type SuggestedAction = { label: string; href: string };

type GuideApiResponse = {
  answer: string;
  confidence?: "high" | "medium" | "low";
  suggestedActions?: SuggestedAction[];
  shouldEscalate?: boolean;
  escalationMessage?: string;
};

function getSupportEmail(): string {
  // NEXT_PUBLIC_* is inlined at build time, safe to read on the client.
  const fromEnv = process.env.NEXT_PUBLIC_TENUN_SUPPORT_EMAIL?.trim();
  // TODO(dev): set NEXT_PUBLIC_TENUN_SUPPORT_EMAIL so this shows your real inbox.
  return fromEnv && fromEnv.length > 0 ? fromEnv : "support@tenun.example";
}

type PageKey = "home" | "jobs" | "profile" | "dashboard" | "employers" | "default";

/** Map the current pathname to a translation key for greeting + quick actions. */
function pageKey(pathname: string): PageKey {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/jobs/")) return "jobs";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/employers")) return "employers";
  return "default";
}

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `m${messageCounter}`;
}

export default function TenunGuideWidget() {
  const pathname = usePathname() ?? "/";
  const prefersReducedMotion = useReducedMotion();
  const { dict, locale } = useLanguage();
  const guide = dict.guide;

  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<SuggestedAction[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const key = useMemo(() => pageKey(pathname), [pathname]);
  const greeting = guide.greetings[key];
  const quickActions = guide.quickActions[key];
  const supportEmail = useMemo(() => getSupportEmail(), []);

  const hidden = useMemo(() => {
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return true;
    if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return true;
    return false;
  }, [pathname]);

  // First-visit "Need help?" nudge — shown once, never if already opened.
  useEffect(() => {
    if (hidden) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem("tenun-guide-hint") === "seen";
    } catch {
      /* storage may be unavailable; just show the hint */
    }
    if (dismissed) return;
    const t = window.setTimeout(() => setShowHint(true), 1600);
    return () => window.clearTimeout(t);
  }, [hidden]);

  // Seed the page-specific greeting the first time the panel opens.
  useEffect(() => {
    if (open && !greeted) {
      setMessages([{ id: nextId(), role: "assistant", content: greeting }]);
      setGreeted(true);
    }
  }, [open, greeted, greeting]);

  // Keep the latest message in view.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      window.localStorage.setItem("tenun-guide-hint", "seen");
    } catch {
      /* ignore */
    }
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    dismissHint();
  }, [dismissHint]);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!text || loading) return;

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: text };
      // Capture history BEFORE appending so we send prior turns, last 8 only.
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setActions([]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/site-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history,
            locale,
            pageContext: {
              pathname,
              pageTitle: typeof document !== "undefined" ? document.title : undefined,
            },
          }),
        });

        if (!res.ok) {
          const friendly =
            res.status === 429
              ? guide.rateLimited
              : `${guide.errorWithEmail} ${supportEmail}.`;
          setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: friendly }]);
          return;
        }

        const data = (await res.json()) as GuideApiResponse;
        let answer = data.answer || `${guide.cannotReach} ${supportEmail}.`;
        if (data.shouldEscalate && data.escalationMessage) {
          answer = `${answer}\n\n${data.escalationMessage}`;
        }
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: answer }]);
        setActions(Array.isArray(data.suggestedActions) ? data.suggestedActions.slice(0, 4) : []);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: `${guide.cannotReach} ${supportEmail}.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, pathname, supportEmail, locale, guide]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void send(input);
    },
    [input, send]
  );

  if (hidden) return null;

  // Idle "alive" motion for the mascot launcher — disabled under reduced motion.
  const idleAnim = prefersReducedMotion
    ? undefined
    : { y: [0, -4, 0], rotate: [0, -2, 2, 0] };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="guide-panel"
            role="dialog"
            aria-label="Tenun Guide chat"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="flex h-[30rem] max-h-[75vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-beige-300/70 bg-beige-50 shadow-2xl shadow-navy-900/20"
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-beige-300/70 bg-navy-800 px-4 py-3 text-beige-50">
              <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-beige-100 ring-2 ring-gold-400">
                <MascotImage size={36} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm leading-tight">{guide.header}</p>
                <p className="text-xs text-beige-200/90">{guide.subheader}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={guide.close}
                className="rounded-full p-1.5 text-beige-200 transition hover:bg-navy-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "rounded-br-md bg-navy-700 text-beige-50"
                        : "rounded-bl-md bg-white text-navy-900 ring-1 ring-beige-300/70"
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && <TypingBubble reduced={!!prefersReducedMotion} />}
            </div>

            {/* Suggested actions from the model */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-beige-300/70 px-4 py-3">
                {actions.map((a) => (
                  <Link
                    key={`${a.label}-${a.href}`}
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1.5 text-xs font-medium text-navy-800 ring-1 ring-gold-300 transition hover:bg-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    {a.label}
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}

            {/* Starter quick-action chips (only before the user has asked anything) */}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 border-t border-beige-300/70 px-4 py-3">
                {quickActions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-700 ring-1 ring-beige-300 transition hover:bg-beige-100 hover:ring-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-beige-300/70 bg-beige-100/60 px-3 py-3"
            >
              <label htmlFor="tenun-guide-input" className="sr-only">
                {guide.header}
              </label>
              <input
                id="tenun-guide-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder={guide.placeholder}
                autoComplete="off"
                className="flex-1 rounded-full border border-beige-300 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label={guide.send}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-visit hint */}
      <AnimatePresence>
        {showHint && !open && (
          <motion.button
            type="button"
            onClick={openPanel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mr-1 rounded-2xl rounded-br-sm bg-navy-800 px-3 py-2 text-xs font-medium text-beige-50 shadow-lg ring-1 ring-navy-700"
          >
            {guide.needHelp}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Launcher */}
      {!open && (
        <motion.button
          type="button"
          onClick={openPanel}
          aria-label={guide.open}
          aria-expanded={open}
          animate={idleAnim}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          whileHover={prefersReducedMotion ? undefined : { scale: 1.08, y: -2 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          className="group relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gold-400 bg-beige-100 shadow-xl shadow-navy-900/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300"
        >
          <MascotImage size={52} />
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-beige-100 bg-emerald-400" />
        </motion.button>
      )}
    </div>
  );
}

/** Animated typing indicator — three bouncing dots. */
function TypingBubble({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-beige-300/70">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-navy-400"
            animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={
              reduced
                ? undefined
                : { duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Mascot image with a graceful fallback. If the asset is missing or fails to
 * load, we render a simple gold "T" / Sparkles badge so there's never a broken
 * image link.
 */
function MascotImage({ size }: { size: number }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-navy-800 font-display text-gold-300"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        aria-hidden="true"
      >
        <span className="relative">
          T
          <Sparkles
            className="absolute -right-2 -top-1 text-gold-400"
            style={{ width: size * 0.3, height: size * 0.3 }}
          />
        </span>
      </span>
    );
  }

  return (
    <Image
      src={MASCOT_SRC}
      alt="Tenun mascot"
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="object-contain"
      priority={false}
    />
  );
}
