"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Linkedin,
  UserPlus,
  Reply,
  Mic,
  ThumbsUp,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserProfile,
  PathwayCard,
  PersonalizedMentor,
  PersonalizedHub,
  SkillGap,
  OutreachMessageType,
  OutreachDraft,
} from "@/lib/types";
import { generateOutreachDraft, OutreachContext } from "@/lib/outreach-engine";

const messageTypes: {
  type: OutreachMessageType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: "cold-email",
    label: "Cold Email",
    icon: Mail,
    description: "Reach out to a recruiter or hiring manager",
  },
  {
    type: "linkedin-message",
    label: "LinkedIn Message",
    icon: Linkedin,
    description: "Connect with an alumni or professional",
  },
  {
    type: "mentorship-request",
    label: "Mentorship Request",
    icon: UserPlus,
    description: "Ask someone to be your mentor",
  },
  {
    type: "follow-up",
    label: "Follow-up",
    icon: Reply,
    description: "Follow up on a previous conversation",
  },
  {
    type: "self-intro",
    label: "Self Introduction",
    icon: Mic,
    description: "Introduce yourself at an event or online",
  },
  {
    type: "why-good-fit",
    label: "Why I'm a Fit",
    icon: ThumbsUp,
    description: "Explain why you're right for a role",
  },
];

interface OutreachStudioProps {
  profile: UserProfile;
  pathways: PathwayCard[];
  mentors: PersonalizedMentor[];
  hubs: PersonalizedHub[];
  skillGaps: SkillGap[];
  preselectedMentor?: PersonalizedMentor | null;
  onMentorHandled?: () => void;
}

export function OutreachStudio({
  profile,
  pathways,
  mentors,
  hubs,
  skillGaps,
  preselectedMentor,
  onMentorHandled,
}: OutreachStudioProps) {
  const [selectedType, setSelectedType] = useState<OutreachMessageType>("cold-email");
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>("");
  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasHandledMentor = useRef(false);

  // Handle preselected mentor from Mentor Bridge
  useEffect(() => {
    if (preselectedMentor && !hasHandledMentor.current) {
      hasHandledMentor.current = true;
      setSelectedType("mentorship-request");
      setSelectedMentorId(preselectedMentor.id);
      // Auto-generate draft
      const context: OutreachContext = {
        profile,
        messageType: "mentorship-request",
        targetMentor: preselectedMentor,
        targetPathway: pathways.find((p) => preselectedMentor.pathwayTags.includes(p.id)),
      };
      setDraft(generateOutreachDraft(context));
      onMentorHandled?.();
    }
  }, [preselectedMentor, profile, pathways, onMentorHandled]);

  // Reset mentor handling when preselectedMentor changes
  useEffect(() => {
    if (!preselectedMentor) {
      hasHandledMentor.current = false;
    }
  }, [preselectedMentor]);

  const handleGenerate = useCallback(() => {
    const context: OutreachContext = {
      profile,
      messageType: selectedType,
      targetMentor: mentors.find((m) => m.id === selectedMentorId),
      targetPathway: pathways.find((p) => p.id === selectedPathwayId),
      targetHub: hubs.find((h) => h.id === selectedHubId),
      targetRole: targetRole || undefined,
      targetCompany: targetCompany || undefined,
    };
    setDraft(generateOutreachDraft(context));
    setCopied(false);
  }, [profile, selectedType, selectedMentorId, selectedPathwayId, selectedHubId, targetRole, targetCompany, mentors, pathways, hubs]);

  const handleCopy = async () => {
    if (!draft) return;
    const text = draft.subject
      ? `Subject: ${draft.subject}\n\n${draft.body}`
      : draft.body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showMentorSelector =
    selectedType === "mentorship-request" || selectedType === "linkedin-message";

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">
            Outreach Studio
          </h2>
          <p className="text-sm text-navy-500">
            Generate personalized message drafts — edit, then copy and send
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-4">
            {/* Message type */}
            <div>
              <label className="text-xs font-medium text-navy-700 mb-2 block">
                Message Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {messageTypes.map((mt) => {
                  const Icon = mt.icon;
                  return (
                    <button
                      key={mt.type}
                      onClick={() => setSelectedType(mt.type)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all text-left ${
                        selectedType === mt.type
                          ? "bg-navy-700 text-white"
                          : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {mt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-navy-400 mt-1.5">
                {messageTypes.find((m) => m.type === selectedType)?.description}
              </p>
            </div>

            {/* Context selectors */}
            <div className="space-y-3">
              {/* Pathway */}
              <div>
                <label className="text-xs font-medium text-navy-700 mb-1 block">
                  Career Pathway (optional)
                </label>
                <div className="relative">
                  <select
                    value={selectedPathwayId}
                    onChange={(e) => setSelectedPathwayId(e.target.value)}
                    className="w-full appearance-none bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-300 pr-8"
                  >
                    <option value="">None</option>
                    {pathways.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.score}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400 pointer-events-none" />
                </div>
              </div>

              {/* Hub */}
              <div>
                <label className="text-xs font-medium text-navy-700 mb-1 block">
                  Target Location (optional)
                </label>
                <div className="relative">
                  <select
                    value={selectedHubId}
                    onChange={(e) => setSelectedHubId(e.target.value)}
                    className="w-full appearance-none bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-300 pr-8"
                  >
                    <option value="">None</option>
                    {hubs.slice(0, 10).map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.city}, {h.country} ({h.matchScore}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400 pointer-events-none" />
                </div>
              </div>

              {/* Mentor (for mentorship/linkedin types) */}
              {showMentorSelector && (
                <div>
                  <label className="text-xs font-medium text-navy-700 mb-1 block">
                    Target Mentor
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMentorId}
                      onChange={(e) => setSelectedMentorId(e.target.value)}
                      className="w-full appearance-none bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-300 pr-8"
                    >
                      <option value="">Select a mentor</option>
                      {mentors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.role} @ {m.company}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Role & Company */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-navy-700 mb-1 block">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. PM, Analyst"
                    className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-700 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-700 mb-1 block">
                    Company
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. Grab, Google"
                    className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-700 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300"
                  />
                </div>
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              className="w-full gap-2"
              size="sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate Draft
            </Button>
          </CardContent>
        </Card>

        {/* Right: Draft output */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <AnimatePresence mode="wait">
              {draft ? (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Draft header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium text-navy-700">
                        {messageTypes.find((m) => m.type === draft.type)?.label}
                      </p>
                      <p className="text-[10px] text-navy-400">
                        To: {draft.recipientContext}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        className="gap-1 text-xs h-8"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCopy}
                        className="gap-1 text-xs h-8"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Subject line */}
                  {draft.subject && (
                    <div className="mb-2">
                      <label className="text-[10px] font-medium text-navy-500 mb-0.5 block">
                        Subject:
                      </label>
                      <input
                        type="text"
                        value={draft.subject}
                        onChange={(e) =>
                          setDraft({ ...draft, subject: e.target.value })
                        }
                        className="w-full bg-beige-50 border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
                      />
                    </div>
                  )}

                  {/* Editable body */}
                  <textarea
                    ref={textareaRef}
                    value={draft.body}
                    onChange={(e) =>
                      setDraft({ ...draft, body: e.target.value })
                    }
                    className="w-full min-h-[300px] bg-beige-50 border border-navy-200 rounded-lg px-4 py-3 text-xs text-navy-800 leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-navy-300 resize-y"
                  />

                  <p className="text-[10px] text-navy-400 mt-2">
                    Edit the draft above to personalize it, then copy and paste into your email or messaging app.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mb-4">
                    <Send className="w-7 h-7 text-navy-300" />
                  </div>
                  <h3 className="font-semibold text-navy-700 text-sm mb-1">
                    Ready to craft your message
                  </h3>
                  <p className="text-xs text-navy-400 max-w-xs">
                    Select a message type and optional context on the left, then
                    click &quot;Generate Draft&quot; to create a personalized
                    outreach message.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
