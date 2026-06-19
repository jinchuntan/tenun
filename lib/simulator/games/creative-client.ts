import type { Game, AnswerCheck } from "@/lib/simulator/types";

// Creative simulator content — a client-management visual novel. You edit an
// imperfect social post (left) while the client messages you on WhatsApp
// (right). Read each request, decide how to handle it (comply / clarify / push
// back), make the edits, and keep client satisfaction up. Hit 0 and you lose
// the client. Play surface: components/simulator/bespoke/CreativePlayer.tsx.

export type PostElement = "headline" | "caption" | "cta" | "hashtags";

export interface PostState {
  brand: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string;
  background: string; // key into BACKGROUNDS
}

export const BACKGROUNDS: Record<string, { label: string; className: string }> = {
  "warm-orange": { label: "Warm orange", className: "bg-gradient-to-br from-orange-400 to-amber-600" },
  "brand-teal": { label: "Brand teal", className: "bg-gradient-to-br from-teal-400 to-emerald-500" },
  "bright-teal": { label: "Bright teal", className: "bg-gradient-to-br from-cyan-400 to-teal-500" },
  "dull-grey": { label: "Muted grey", className: "bg-gradient-to-br from-stone-300 to-stone-400" },
  "neon-clash": { label: "Neon clash", className: "bg-gradient-to-br from-fuchsia-500 to-yellow-400" },
};

export const INITIAL_POST: PostState = {
  brand: "BloomCafé",
  headline: "Wekend Sale!",
  caption: "Come visit us.",
  cta: "Buy",
  hashtags: "#cafe",
  background: "warm-orange",
};

export type EditTask =
  | { kind: "text-free"; target: PostElement; instruction: string; check: AnswerCheck; exemplar: string }
  | { kind: "text-pick"; target: PostElement; instruction: string; options: { id: string; text: string; correct: boolean }[] }
  | { kind: "visual"; instruction: string; options: { id: string; bg: string; correct: boolean }[] };

export interface BeatOption {
  id: string;
  label: string; // your reply text (also shown as the choice)
  delta: number; // satisfaction change for choosing this
  react: string; // client's reply after your choice (or after the edit)
  best?: boolean; // the right call (for scoring)
  edit?: EditTask; // if choosing this means making a change
  end?: boolean; // final beat — finishes the project
}

export interface Beat {
  id: string;
  clientMsgs: string[];
  options: BeatOption[];
}

export const START_SATISFACTION = 75;
export const EDIT_BONUS = 3; // small bump for nailing an edit
export const WRONG_EDIT_PENALTY = 3;

export const BEATS: Beat[] = [
  {
    id: "intro",
    clientMsgs: ["Hi! Thanks for the first draft of the weekend post 🙌", "A few tweaks before we publish — free to jump in now?"],
    options: [
      { id: "yes", label: "Absolutely — ready when you are! 😊", delta: 3, best: true, react: "Amazing, let's go 🙌" },
      { id: "busy", label: "I'm pretty swamped, can it wait?", delta: -8, react: "Oh… it's kind of urgent though." },
      { id: "curt", label: "k", delta: -5, react: "…okay then." },
    ],
  },
  {
    id: "typo",
    clientMsgs: ["First — there's a typo in the headline 😅 it says 'Wekend'."],
    options: [
      {
        id: "fix", label: "Good catch — fixing it now!", delta: 4, best: true,
        react: "Perfect, thank you! ✨",
        edit: { kind: "text-free", target: "headline", instruction: "Fix the headline typo.", check: { mustInclude: ["weekend"], mustNotInclude: ["wekend"] }, exemplar: "Weekend Sale!" },
      },
      { id: "deny", label: "Are you sure? Looks fine to me.", delta: -12, react: "…it literally says 'Wekend'. Please just fix it." },
      { id: "later", label: "I'll get to it eventually.", delta: -7, react: "I'd really like it done before we publish." },
    ],
  },
  {
    id: "cta",
    clientMsgs: ["The button just says 'Buy' — can we make it warmer and more inviting?"],
    options: [
      {
        id: "ok", label: "On it — something warmer 👍", delta: 4, best: true,
        react: "Ooh I love that one!",
        edit: { kind: "text-pick", target: "cta", instruction: "Pick a warmer call-to-action.", options: [
          { id: "a", text: "Shop the Sale", correct: true },
          { id: "b", text: "BUY NOW!!!", correct: false },
          { id: "c", text: "Click Here", correct: false },
        ] },
      },
      { id: "fine", label: "'Buy' is fine, it's direct.", delta: -9, react: "It feels a bit cold to me." },
    ],
  },
  {
    id: "pop",
    clientMsgs: ["Hmm, the post just doesn't *pop* enough, you know?"],
    options: [
      {
        id: "clarify", label: "Could you tell me what feels flat — the colours, or the text?", delta: 5, best: true,
        react: "Good question — honestly it's the background, it looks a bit dull/clashing.",
        edit: { kind: "visual", instruction: "Switch to a brighter, on-brand background.", options: [
          { id: "a", bg: "bright-teal", correct: true },
          { id: "b", bg: "dull-grey", correct: false },
          { id: "c", bg: "neon-clash", correct: false },
        ] },
      },
      { id: "yesman", label: "Sure! I'll make everything bigger and brighter!", delta: -8, react: "…that's not quite what I meant." },
      { id: "fine", label: "Looks fine to me, to be honest.", delta: -10, react: "Well, I'm not happy with it." },
    ],
  },
  {
    id: "comicsans",
    clientMsgs: ["Oh! Can you change the font to Comic Sans? My nephew loves it 😄"],
    options: [
      { id: "pushback", label: "I'd gently steer away from that — Comic Sans reads as unprofessional for a café brand. Can we keep the clean font?", delta: 6, best: true, react: "Haha fair enough — you're the expert. Keep it 👍" },
      { id: "cave", label: "Sure! Comic Sans coming right up 😅", delta: -11, react: "Yay!" },
      { id: "rude", label: "No. That's a terrible idea.", delta: -7, react: "…no need to be rude about it." },
    ],
  },
  {
    id: "brandcolor",
    clientMsgs: ["Our brand colour is teal, but this background looks orange — can you match the brand?"],
    options: [
      {
        id: "ok", label: "Of course — switching to brand teal.", delta: 4, best: true,
        react: "That's the one! 💚",
        edit: { kind: "visual", instruction: "Match the brand colour.", options: [
          { id: "a", bg: "brand-teal", correct: true },
          { id: "b", bg: "warm-orange", correct: false },
          { id: "c", bg: "neon-clash", correct: false },
        ] },
      },
      { id: "no", label: "The orange stands out more, though.", delta: -9, react: "But it's not our brand. Please match it." },
    ],
  },
  {
    id: "claim",
    clientMsgs: ["Let's make the headline 'The BEST coffee in the world — guaranteed!' 💪"],
    options: [
      { id: "pushback", label: "I'd avoid 'best in the world, guaranteed' — unprovable claims can hurt credibility and breach ad rules. How about 'Award-winning roast'?", delta: 6, best: true, react: "Hadn't thought of that — good call, let's do that." },
      { id: "cave", label: "Sure, sounds bold!", delta: -12, react: "Great!" },
      { id: "blunt", label: "We can't, that's false advertising.", delta: -3, react: "Okay okay, no need to lecture me." },
    ],
  },
  {
    id: "caption",
    clientMsgs: ["Can the caption mention the actual offer — 20% off, this weekend only?"],
    options: [
      {
        id: "ok", label: "Great idea — adding that now.", delta: 4, best: true,
        react: "Perfect, that's much clearer 🙌",
        edit: { kind: "text-free", target: "caption", instruction: "Rewrite the caption to mention 20% off this weekend.", check: { mustIncludeAnyOf: [["20%", "20 %", "20 percent"], ["weekend"]] }, exemplar: "This weekend only — 20% off every drink. Come treat yourself ☕" },
      },
      { id: "no", label: "People will see the headline, no need.", delta: -8, react: "I'd really like the offer spelled out." },
    ],
  },
  {
    id: "pressure",
    clientMsgs: ["Actually — I need this published in 10 minutes, my boss is asking!! 😰"],
    options: [
      { id: "calm", label: "No problem — I'm almost there, I'll have the final to you in 5. 🙌", delta: 5, best: true, react: "You're a lifesaver 🙏" },
      { id: "panic", label: "That's not enough time, you're stressing me out!", delta: -10, react: "…okay, sorry. I just need it soon." },
      { id: "curt", label: "Fine, rushing now.", delta: -3, react: "Thanks, I guess." },
    ],
  },
  {
    id: "huge",
    clientMsgs: ["Make the headline HUGE so the text fills the whole image, use all the space!"],
    options: [
      { id: "pushback", label: "I'd keep some breathing room — oversized text actually reads worse and looks cramped. I'll make it bold but balanced.", delta: 6, best: true, react: "Okay, I trust you on that." },
      { id: "cave", label: "Sure, cranking it to max size!", delta: -8, react: "Cool!" },
    ],
  },
  {
    id: "hashtags",
    clientMsgs: ["Last thing — can we add a few relevant hashtags?"],
    options: [
      {
        id: "ok", label: "On it — a few targeted ones.", delta: 4, best: true,
        react: "Nice, those are perfect.",
        edit: { kind: "text-pick", target: "hashtags", instruction: "Pick a good set of hashtags.", options: [
          { id: "a", text: "#WeekendSale #CoffeeLovers #BloomCafé", correct: true },
          { id: "b", text: "#follow #like #l4l #spam #viral #f4f", correct: false },
          { id: "c", text: "#coffee", correct: false },
        ] },
      },
      { id: "skip", label: "Hashtags are dead, skip it.", delta: -6, react: "I'd still like a couple, please." },
    ],
  },
  {
    id: "deliver",
    clientMsgs: ["Looks great! Send me the final and we're done 🎉"],
    options: [
      { id: "deliver", label: "Doing a final once-over… and sent! Pleasure working with you 😊", delta: 5, best: true, react: "Perfect — thank you so much!! ⭐⭐⭐", end: true },
      { id: "curt", label: "Sent.", delta: -3, react: "…thanks.", end: true },
    ],
  },
];

export const creativeClientGame: Game = {
  id: "creative-social-post",
  family: "creative",
  role: "Social Media Creative",
  tagline: "Edit a client's social post while managing them over WhatsApp — keep them happy.",
  icon: "🎨",
  minutes: 18,
  intro:
    "You're a freelance social media creative. Your client, BloomCafé, has a weekend-sale post that needs polishing — and they're messaging you on WhatsApp with changes. Some are spot-on, some are bad ideas you'll need to push back on. Edit the post on the left, handle the client on the right, and keep their satisfaction up. Let it hit zero and you lose the client.",
  playSummary: "~12 client requests · live chat",
  steps: [], // bespoke surface — see components/simulator/bespoke/CreativePlayer.tsx
  interestPrompt:
    "That's client-services creative work: taste, plus the people skills to manage feedback, push back diplomatically, and keep someone happy. Could you do this most days?",
};
