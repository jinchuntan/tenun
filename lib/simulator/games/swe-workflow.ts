import type { Game, AnswerCheck, CodeLine } from "@/lib/simulator/types";

// SWE simulator content — the FULL engineer workflow for one ticket:
// branch → fix in the editor → run tests → review the diff → commit → push →
// open a PR → address review → merge. Played in a VS Code-style shell with a
// real (typed) terminal. See components/simulator/bespoke/SwePlayer.tsx.

export type Severity = "error" | "warning";

export interface WfIssue {
  id: string;
  lineId: string;
  title: string;
  /** Shown in the Quick Fix popover. */
  concern: string;
  hint: string;
  severity: Severity;
  fixedText: string;
  /** Free-type fix validator (omitted for removal-type issues). */
  check?: AnswerCheck;
  /** Debug-line removal: shows a "Remove line" button instead of an editor. */
  removal?: boolean;
}

export interface WfFile {
  path: string;
  language: string;
  lines: CodeLine[];
}

export const WF_FILES: WfFile[] = [
  {
    path: "checkout/pricing.py",
    language: "python",
    lines: [
      { id: "pa1", text: "def final_price(cart_total, is_member):" },
      { id: "pa2", text: "    discount = 0.10 if is_member else 0.0" },
      { id: "pa3", text: "    price = cart_total + cart_total * discount" },
      { id: "pa4", text: "    tax = price * 0.06" },
      { id: "pa5", text: "    return round(price + tax, 1)" },
    ],
  },
  {
    path: "checkout/cart.py",
    language: "python",
    lines: [
      { id: "ca1", text: 'COUPONS = {"SAVE5": 5, "SAVE10": 10}' },
      { id: "ca2", text: "" },
      { id: "ca3", text: "def cart_total(items):" },
      { id: "ca4", text: "    total = 0" },
      { id: "ca5", text: "    for i in items:" },
      { id: "ca6", text: "        total += i.price" },
      { id: "ca7", text: "    return total" },
      { id: "ca8", text: "" },
      { id: "ca9", text: "def apply_coupon(price, code):" },
      { id: "ca10", text: "    discount = COUPONS[code]" },
      { id: "ca11", text: '    print("DEBUG coupon:", code, discount)' },
      { id: "ca12", text: "    return price - discount" },
      { id: "ca13", text: "" },
      { id: "ca14", text: "def is_adult(age):" },
      { id: "ca15", text: "    return age > 18" },
    ],
  },
];

export const WF_ISSUES: Record<string, WfIssue> = {
  // ── Implement: the 4 flagged bugs from the ticket ──
  i_discount: {
    id: "i_discount",
    lineId: "pa3",
    title: "Discount added, not subtracted",
    concern: "Members are charged 110%. Multiply by (1 - discount).",
    hint: "A 10% discount means paying 90%: cart_total * (1 - discount).",
    severity: "error",
    fixedText: "    price = cart_total * (1 - discount)",
    check: {
      mustInclude: ["cart_total", "discount"],
      mustIncludeAny: ["1 - discount", "- cart_total * discount"],
      mustNotInclude: ["+ cart_total * discount"],
    },
  },
  i_round: {
    id: "i_round",
    lineId: "pa5",
    title: "Money rounded to 1 decimal",
    concern: "Currency needs two decimal places.",
    hint: "round(price + tax, 2).",
    severity: "warning",
    fixedText: "    return round(price + tax, 2)",
    check: { mustInclude: ["round"], pattern: "round\\([^)]*,\\s*2\\)", mustNotInclude: ["round(price + tax, 1)"] },
  },
  i_coupon: {
    id: "i_coupon",
    lineId: "ca10",
    title: "Invalid coupon code crashes (KeyError)",
    concern: "COUPONS[code] throws if the code is unknown. Use .get with a default.",
    hint: "COUPONS.get(code, 0) returns 0 instead of crashing.",
    severity: "error",
    fixedText: "    discount = COUPONS.get(code, 0)",
    check: { mustIncludeAny: ["coupons.get(code, 0)", ".get(code"], mustNotInclude: ["coupons[code]"] },
  },
  i_age: {
    id: "i_age",
    lineId: "ca15",
    title: "Off-by-one in age check",
    concern: "An 18-year-old is an adult. Use >=.",
    hint: "return age >= 18.",
    severity: "warning",
    fixedText: "    return age >= 18",
    check: { mustIncludeAny: [">= 18", ">=18"] },
  },
  // ── Edge case: surfaced only by the failing test ──
  i_negative: {
    id: "i_negative",
    lineId: "ca12",
    title: "Coupon can make the price negative",
    concern: "A big coupon makes price - discount negative. Clamp it at 0.",
    hint: "return max(0, price - discount).",
    severity: "error",
    fixedText: "    return max(0, price - discount)",
    check: { mustInclude: ["price - discount"], mustIncludeAny: ["max(0", "max( 0"] },
  },
  // ── Debug line: caught at diff review, removed before commit ──
  d_debug: {
    id: "d_debug",
    lineId: "ca11",
    title: "Leftover debug print",
    concern: "You left a debug print in apply_coupon. Remove it before committing.",
    hint: "Delete the print line.",
    severity: "warning",
    fixedText: "",
    removal: true,
  },
  // ── Review feedback: guard against None ──
  r_none: {
    id: "r_none",
    lineId: "ca5",
    title: "cart_total crashes on None items",
    concern: "Reviewer: guard against items being None before iterating.",
    hint: "for i in (items or []):",
    severity: "warning",
    fixedText: "    for i in (items or []):",
    check: { mustInclude: ["for i in"], mustIncludeAny: ["items or []", "or []"] },
  },
};

export const IMPLEMENT_IDS = ["i_discount", "i_round", "i_coupon", "i_age"];
export const EDGE_IDS = ["i_negative"];
export const DEBUG_IDS = ["d_debug"];
export const REVIEW_IDS = ["r_none"];

export const TICKET = {
  key: "TENUN-482",
  title: "Checkout charges members the wrong price",
  type: "Bug",
  priority: "High",
  description:
    "Members report being overcharged at checkout, and an unknown coupon code crashes the cart. Fix the pricing and coupon logic in checkout/. Make sure the existing tests pass before you raise a PR.",
  acceptance: [
    "Members pay the discounted price (not more)",
    "Totals are correct to 2 decimal places",
    "An unknown coupon code doesn't crash checkout",
    "Tests pass locally before pushing",
  ],
  branch: "feature/TENUN-482-checkout-pricing",
};

export const TEST_FAIL_OUTPUT = [
  "============================= test session starts =============================",
  "collected 6 items",
  "",
  "tests/test_pricing.py ...                                                 [ 50%]",
  "tests/test_cart.py ..F                                                    [100%]",
  "",
  "=================================== FAILURES ==================================",
  "___________________________ test_coupon_never_negative ________________________",
  "    def test_coupon_never_negative():",
  '        # A big coupon must never make the price negative',
  '>       assert apply_coupon(3, "SAVE10") >= 0',
  "E       assert -7 >= 0",
  "",
  "tests/test_cart.py:14: AssertionError",
  "========================= 1 failed, 5 passed in 0.12s =========================",
];

export const TEST_PASS_OUTPUT = [
  "============================= test session starts =============================",
  "collected 6 items",
  "",
  "tests/test_pricing.py ...                                                 [ 50%]",
  "tests/test_cart.py ...                                                    [100%]",
  "",
  "============================== 6 passed in 0.11s ==============================",
];

export const DIFF_OUTPUT = [
  "diff --git a/checkout/cart.py b/checkout/cart.py",
  "@@ def apply_coupon(price, code): @@",
  "-    discount = COUPONS[code]",
  "+    discount = COUPONS.get(code, 0)",
  '+    print("DEBUG coupon:", code, discount)',
  "-    return price - discount",
  "+    return max(0, price - discount)",
  "",
  "⚠ Heads up: you left a debug print() in apply_coupon. Remove it before committing.",
];

export const REVIEW_COMMENT = {
  author: "priya-senior",
  body: "Nice fixes! One thing before I approve: cart_total will crash if items is None (it happens for guest carts). Can you guard against that? 🙏",
};

export const COMMIT_CHECK: AnswerCheck = {
  mustIncludeAny: ["discount", "coupon", "price", "checkout", "pricing", "tenun-482", "482"],
  mustNotInclude: ["fix stuff", "wip", "asdf", "stuff", "changes", "update code"],
};

export const PR_TITLE_CHECK: AnswerCheck = {
  mustIncludeAny: ["discount", "coupon", "price", "checkout", "pricing", "482"],
  mustNotInclude: ["wip", "test", "asdf"],
};

export const PR_BODY_CHECK: AnswerCheck = {
  mustIncludeAnyOf: [
    ["discount", "price", "members", "overcharg"],
    ["coupon", "keyerror", "crash", "negative"],
    ["test", "pytest", "passing"],
  ],
};

export const swePrGame: Game = {
  id: "swe-pr-review",
  family: "engineering",
  role: "Software Engineer",
  tagline: "Take a ticket from branch to merge — fix it, test it, PR it, ship it.",
  icon: "💻",
  minutes: 22,
  intro:
    "You're a backend engineer and ticket TENUN-482 just landed: checkout is overcharging members and crashing on bad coupons. You'll do the whole job in the IDE — branch, fix the bugs, run the tests, review your own diff, commit and push, open a PR, handle the reviewer's feedback, and merge. Type the git commands yourself, just like the real thing.",
  playSummary: "Full PR workflow · branch → merge",
  steps: [], // bespoke surface — see components/simulator/bespoke/SwePlayer.tsx
  interestPrompt:
    "That's the real engineering loop end-to-end: a ticket, a branch, fixes, tests, a PR, review, and a merge. Could you do this most days?",
};
