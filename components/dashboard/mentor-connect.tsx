"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  MapPin,
  Clock,
  Send,
  X,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Mail,
  Edit3,
  Heart,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mentor, MentorContact, UserProfile, CareerArchetype } from "@/lib/types";
import { getMatchingMentors } from "@/lib/mentor-data";

// Gradient avatars by initial
const AVATAR_GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-rose-600",
  "from-pink-400 to-fuchsia-600",
  "from-amber-400 to-orange-600",
];

function daysSince(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24));
}

function buildEmailBody(mentor: Mentor, profile: UserProfile): { subject: string; body: string } {
  const subject = `Career Conversation Request — ${profile.name}`;
  const body = `Hi ${mentor.name},

I hope this message finds you well. My name is ${profile.name} — I'm a ${profile.currentRole} with a background in ${profile.skills.slice(0, 3).join(", ")}.

I came across your profile and was really inspired by your work in ${mentor.expertise[0]}. I'm at a stage in my career where I'm exploring paths that align with my interests in ${profile.interests.slice(0, 2).join(" and ")}, and your experience resonates directly with what I'm working toward.

${mentor.matchReason}

I would be genuinely grateful for 20–25 minutes of your time — even a quick call or email exchange would be tremendously helpful. I'm flexible on timing and happy to work around your schedule.

Thank you so much for considering this. I look forward to hearing from you.

Warm regards,
${profile.name}`;
  return { subject, body };
}

function EmailModal({
  mentor,
  profile,
  onClose,
  onSent,
}: {
  mentor: Mentor;
  profile: UserProfile;
  onClose: () => void;
  onSent: (contact: MentorContact) => void;
}) {
  const initial = buildEmailBody(mentor, profile);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [editingBody, setEditingBody] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const mailtoLink = `mailto:${mentor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    setSent(true);
    onSent({
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorEmail: mentor.email || "",
      sentAt: new Date().toISOString(),
      followUps: [],
      status: "sent",
      subject,
      body,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-navy-100">
          <div>
            <h3 className="font-bold text-navy-900">Draft Cold Email</h3>
            <p className="text-xs text-navy-500 mt-0.5">To: {mentor.name} · {mentor.organization}</p>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {sent ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h4 className="font-semibold text-navy-900 mb-1">Email queued!</h4>
              <p className="text-sm text-navy-500 max-w-xs mx-auto">
                Opened in your email client — review and hit send when ready.
              </p>
              <Button onClick={onClose} className="mt-5" size="sm">Done</Button>
            </motion.div>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-navy-700 block mb-1">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-navy-700">Message</label>
                  <button
                    onClick={() => setEditingBody(v => !v)}
                    className="text-[11px] text-navy-500 hover:text-navy-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {editingBody ? "Preview" : "Edit"}
                  </button>
                </div>
                {editingBody ? (
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg border border-navy-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 resize-none"
                  />
                ) : (
                  <div className="bg-navy-50 rounded-lg p-3 text-xs text-navy-600 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                    {body}
                  </div>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Tip:</strong> Personalise the second paragraph — it significantly improves response rates.
              </div>
              <Button onClick={handleSend} className="w-full" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Open in email client
              </Button>
              <p className="text-[10px] text-navy-400 text-center">
                Opens your default email app with the message pre-filled.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SwipeCard({
  mentor,
  index,
  total,
  gradientClass,
  alreadySent,
  onConnect,
  onPass,
}: {
  mentor: Mentor;
  index: number;
  total: number;
  gradientClass: string;
  alreadySent: boolean;
  onConnect: () => void;
  onPass: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -30], [1, 0]);

  const stackOffset = Math.min(index, 2);
  const scale = 1 - stackOffset * 0.04;
  const yOffset = stackOffset * 10;

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 120) onConnect();
    else if (info.offset.x < -120) onPass();
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        scale,
        y: yOffset,
        zIndex: total - index,
        x: index === 0 ? x : 0,
        rotate: index === 0 ? rotate : 0,
      }}
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={index === 0 ? handleDragEnd : undefined}
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden flex flex-col">
        {/* Swipe indicators */}
        {index === 0 && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-10 bg-green-500 text-white text-sm font-black px-4 py-1.5 rounded-full rotate-[-20deg] border-2 border-green-600 shadow"
            >
              CONNECT
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 z-10 bg-red-500 text-white text-sm font-black px-4 py-1.5 rounded-full rotate-[20deg] border-2 border-red-600 shadow"
            >
              PASS
            </motion.div>
          </>
        )}

        {/* Avatar header */}
        <div className={`bg-gradient-to-br ${gradientClass} px-6 pt-8 pb-10 relative`}>
          <div className="w-24 h-24 rounded-full bg-white/25 border-4 border-white/60 flex items-center justify-center mx-auto shadow-lg">
            <span className="text-4xl font-black text-white">
              {mentor.name.charAt(0)}
            </span>
          </div>
          {alreadySent && (
            <div className="absolute top-4 right-4 bg-white/90 text-green-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Contacted
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="text-center mb-4 -mt-6">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-navy-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">{mentor.name.charAt(0)}</span>
            </div>
            <h3 className="font-bold text-navy-900 text-lg leading-tight">{mentor.name}</h3>
            <p className="text-sm text-navy-500 mt-0.5">{mentor.title}</p>
            <p className="text-xs text-navy-400">{mentor.organization}</p>
          </div>

          <div className="flex justify-center gap-4 text-xs text-navy-500 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {mentor.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {mentor.responseTime}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mb-4">
            {mentor.expertise.slice(0, 4).map(e => (
              <Badge key={e} variant="secondary" className="text-[11px]">{e}</Badge>
            ))}
          </div>

          <div className="bg-beige-50 rounded-xl p-3 mb-3 border border-beige-100">
            <p className="text-xs text-navy-600 leading-relaxed text-center">
              <span className="font-semibold text-navy-800">Why you match: </span>
              {mentor.matchReason}
            </p>
          </div>

          <p className="text-xs text-navy-500 leading-relaxed text-center line-clamp-3">
            {mentor.background}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-navy-100 bg-navy-50/50">
          <Button
            size="sm"
            className="w-full"
            onClick={onConnect}
            variant={alreadySent ? "outline" : "default"}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            {alreadySent ? "Draft follow-up" : "Connect & draft email"}
          </Button>
          {mentor.linkedinUrl && (
            <a
              href={mentor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 mt-2 text-xs text-navy-500 hover:text-navy-800 transition-colors"
            >
              View on LinkedIn <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ContactTracker({
  contact,
  onFollowUp,
}: {
  contact: MentorContact;
  onFollowUp: (contact: MentorContact) => void;
}) {
  const days = daysSince(contact.sentAt);
  const lastFollowUp = contact.followUps.length > 0
    ? daysSince(contact.followUps[contact.followUps.length - 1])
    : null;
  return (
    <div className="flex items-center gap-3 bg-navy-50 rounded-xl p-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${contact.status === "replied" ? "bg-green-100" : "bg-navy-100"}`}>
        {contact.status === "replied"
          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
          : <Clock className="w-4 h-4 text-navy-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-navy-900">{contact.mentorName}</p>
        <p className="text-[11px] text-navy-500">
          {contact.status === "replied" ? "Replied ✓" : `Sent ${days} day${days !== 1 ? "s" : ""} ago`}
          {contact.followUps.length > 0 && ` · ${contact.followUps.length} follow-up${contact.followUps.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      {contact.status !== "replied" && (lastFollowUp === null || lastFollowUp >= 7) && (
        <button
          onClick={() => onFollowUp(contact)}
          className="text-[11px] text-navy-600 hover:text-navy-900 flex items-center gap-1 shrink-0"
        >
          <RefreshCw className="w-3 h-3" /> Follow up
        </button>
      )}
    </div>
  );
}

export function MentorConnect({
  profile,
  archetype,
}: {
  profile: UserProfile;
  archetype: CareerArchetype;
}) {
  const mentors = getMatchingMentors(profile.interests, profile.preferredIndustries, profile.riskAppetite);
  const [stack, setStack] = useState<number[]>(mentors.map((_, i) => i));
  const [passed, setPassed] = useState<number[]>([]);
  const [contacts, setContacts] = useState<MentorContact[]>([]);
  const [emailMentor, setEmailMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tenun-mentor-contacts") || "[]");
      setContacts(stored);
    } catch { /* localStorage unavailable */ }
  }, []);

  const saveContact = (contact: MentorContact) => {
    const updated = [...contacts.filter(c => c.mentorId !== contact.mentorId || c.sentAt !== contact.sentAt), contact];
    setContacts(updated);
    try { localStorage.setItem("tenun-mentor-contacts", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const handleSent = (contact: MentorContact) => {
    saveContact(contact);
    setTimeout(() => setEmailMentor(null), 2000);
  };

  const handleFollowUp = (existing: MentorContact) => {
    const mentor = mentors.find(m => m.id === existing.mentorId);
    if (mentor) setEmailMentor(mentor);
  };

  const topIndex = stack[stack.length - 1];
  const topMentor = topIndex !== undefined ? mentors[topIndex] : null;

  const handleConnect = () => {
    if (topMentor) setEmailMentor(topMentor);
  };

  const handlePass = () => {
    if (topIndex === undefined) return;
    setPassed(p => [...p, topIndex]);
    setStack(s => s.slice(0, -1));
  };

  const handleReset = () => {
    setStack(mentors.map((_, i) => i));
    setPassed([]);
  };

  const sentMentorIds = new Set(contacts.map(c => c.mentorId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Mentor Connect</h2>
        <p className="text-sm text-navy-500 mt-1">
          Swipe right to connect, left to pass — we'll help draft your first message
        </p>
      </div>

      {contacts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-navy-700">Your outreach</h3>
          {contacts.map(c => (
            <ContactTracker key={`${c.mentorId}-${c.sentAt}`} contact={c} onFollowUp={handleFollowUp} />
          ))}
        </div>
      )}

      {/* Swipe stack */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-full max-w-sm mx-auto" style={{ height: 520 }}>
          <AnimatePresence>
            {stack.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-navy-200 p-8"
              >
                <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-navy-400" />
                </div>
                <h4 className="font-bold text-navy-800 mb-1">You've seen all mentors</h4>
                <p className="text-sm text-navy-400 mb-5">Passed on {passed.length} · Contacted {contacts.length}</p>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Start over
                </Button>
              </motion.div>
            ) : (
              [...stack].reverse().slice(0, 3).map((mentorIdx, displayIdx) => (
                <SwipeCard
                  key={mentorIdx}
                  mentor={mentors[mentorIdx]}
                  index={displayIdx}
                  total={stack.length}
                  gradientClass={AVATAR_GRADIENTS[mentorIdx % AVATAR_GRADIENTS.length]}
                  alreadySent={sentMentorIds.has(mentors[mentorIdx].id)}
                  onConnect={displayIdx === 0 ? handleConnect : () => {}}
                  onPass={displayIdx === 0 ? handlePass : () => {}}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {stack.length > 0 && (
          <div className="flex items-center gap-8">
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-red-200 text-red-400 hover:border-red-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-xs text-navy-400">{stack.length} left</p>
            </div>
            <button
              onClick={handleConnect}
              className="w-14 h-14 rounded-full bg-white border-2 border-green-200 text-green-500 hover:border-green-400 hover:text-green-600 hover:shadow-md transition-all flex items-center justify-center shadow-sm"
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {emailMentor && (
          <EmailModal
            mentor={emailMentor}
            profile={profile}
            onClose={() => setEmailMentor(null)}
            onSent={contact => {
              handleSent(contact);
              // advance the card after connecting
              if (stack[stack.length - 1] !== undefined) {
                setStack(s => s.slice(0, -1));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
