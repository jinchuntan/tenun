import type { Game, AnswerCheck } from "@/lib/simulator/types";

// HR simulator content — a "Papers, Please"-style inbox across a 5-day week.
// Each day's emails are real People-Ops problems: route them, decide them,
// escalate the sensitive ones, and investigate the suspicious attachments.
// Play surface: components/simulator/bespoke/HrPlayer.tsx (Outlook 3-pane).

export type CaseCategory =
  | "Onboarding"
  | "Payroll"
  | "IT"
  | "Leave"
  | "Routing"
  | "Security"
  | "Sensitive"
  | "Compliance"
  | "Offboarding";

export interface CaseAction {
  id: string;
  /** Toolbar button label, e.g. "Forward to Payroll". */
  label: string;
  correct: boolean;
  /** Shown after the player chooses this action. */
  feedback: string;
}

export interface Attachment {
  id: string;
  name: string; // medical_cert.pdf
  /** Lines of the document, rendered in a viewer for investigation. */
  lines: string[];
}

export interface ComposeSpec {
  placeholder?: string;
  check: AnswerCheck;
  exemplar: string;
  feedback: string;
}

export interface EmailCase {
  id: string;
  from: { name: string; role: string };
  subject: string;
  time: string; // "09:14"
  body: string[]; // paragraphs
  category: CaseCategory;
  points: number;
  attachments?: Attachment[];
  /** Hint nudging the player to open the attachment before deciding. */
  investigate?: string;
  mode: "action" | "compose";
  actions?: CaseAction[];
  compose?: ComposeSpec;
  /** Teaching takeaway shown once the case is resolved. */
  lesson: string;
}

export interface HrDay {
  number: number;
  briefing: string;
  cases: EmailCase[];
}

export const HR_WEEK: HrDay[] = [
  // ───────────────────────── DAY 1 — clean routing ─────────────────────────
  {
    number: 1,
    briefing:
      "First day on the People Ops desk. Easy stuff today — mostly knowing who owns what. Read each email and route it to the right place.",
    cases: [
      {
        id: "d1-it-access",
        from: { name: "Marcus Tan", role: "New hire, Engineering" },
        subject: "Can't log into my work email",
        time: "09:02",
        body: [
          "Hi, I started today but my company email and laptop login both say 'account not found'. I can't access anything. Who can help?",
        ],
        category: "IT",
        points: 8,
        mode: "action",
        actions: [
          { id: "a", label: "Forward to IT", correct: true, feedback: "Right — account provisioning and logins are IT's job. Quick forward, problem solved." },
          { id: "b", label: "Reply: try again later", correct: false, feedback: "Fobbing off a blocked new hire wastes their first day. Route it to the team that can actually fix it." },
          { id: "c", label: "Escalate to his manager", correct: false, feedback: "The manager can't create accounts — this is a straightforward IT ticket, not an escalation." },
        ],
        lesson: "Half of HR is knowing who owns a problem. Access issues → IT.",
      },
      {
        id: "d1-payslip",
        from: { name: "Nurul Aziz", role: "Marketing Exec" },
        subject: "My pay looks lower this month?",
        time: "10:21",
        body: [
          "Hi, my salary credited today is about RM300 less than usual and I'm not sure why. Could you check what happened?",
        ],
        category: "Payroll",
        points: 8,
        mode: "action",
        actions: [
          { id: "a", label: "Forward to Payroll", correct: true, feedback: "Correct — payroll calculations (tax, deductions, EPF) sit with Payroll. They can pull her breakdown." },
          { id: "b", label: "Reply with a guess", correct: false, feedback: "Never guess about someone's pay. Route it to Payroll, who can see the actual figures." },
          { id: "c", label: "Deny — pay is confidential", correct: false, feedback: "It's her own pay; she's entitled to ask. Send it to the team that can explain it." },
        ],
        lesson: "Pay-figure questions → Payroll. Don't speculate about someone's money.",
      },
      {
        id: "d1-product",
        from: { name: "David Lim", role: "External — Gmail address" },
        subject: "Pricing for your product?",
        time: "14:48",
        body: [
          "Hello, I found your company online and I'm interested in bulk pricing for your software. Can you send me a quote and a demo?",
        ],
        category: "Routing",
        points: 8,
        mode: "action",
        actions: [
          { id: "a", label: "Forward to Sales", correct: true, feedback: "Yes — this is a sales lead that landed in the wrong inbox. Pass it to Sales so they can chase it." },
          { id: "b", label: "Reply: wrong department", correct: false, feedback: "Technically true, but bouncing a potential customer loses the company money. Hand it to Sales instead." },
          { id: "c", label: "Delete it", correct: false, feedback: "That's a live lead, not spam — deleting it throws away revenue. Route it to Sales." },
        ],
        lesson: "Not every email is yours to answer — but route it usefully instead of bouncing it.",
      },
    ],
  },

  // ───────────────────────── DAY 2 — onboarding + judgment ─────────────────
  {
    number: 2,
    briefing:
      "The new-hire cohort is settling in. Today needs more judgment — a nudge here, an approval there, and one email that isn't what it claims to be.",
    cases: [
      {
        id: "d2-module",
        from: { name: "Aisha Rahman", role: "New hire, Analyst" },
        subject: "Onboarding — didn't finish a module",
        time: "09:11",
        body: [
          "Hi! I got through most of onboarding but didn't finish the 'Data Protection' compliance module — I ran out of time. Is that okay?",
        ],
        category: "Onboarding",
        points: 10,
        mode: "compose",
        compose: {
          placeholder: "Hi Aisha, …",
          check: {
            mustIncludeAny: ["compliance", "data protection", "module"],
            mustInclude: ["friday"],
            mustNotInclude: ["ignore", "don't worry about it", "skip it"],
          },
          exemplar:
            "Hi Aisha! Thanks for flagging it. The Data Protection module is mandatory, so please finish it by Friday — it's about 30 minutes. Let me know if you hit any issues and I'll help. Thanks!",
          feedback:
            "A good nudge: warm, names the deadline (Friday), explains it's required (not optional), and offers help. Compliance can't simply be skipped.",
        },
        lesson: "Required training is required — remind kindly, give a clear deadline, never wave it through.",
      },
      {
        id: "d2-leave",
        from: { name: "Wei Sheng", role: "Designer" },
        subject: "Annual leave request — next month",
        time: "11:30",
        body: [
          "Hi, I'd like to take 3 days annual leave (12–14 next month) for a family trip. I have 11 days of balance left. Manager is cc'd and fine with it.",
        ],
        category: "Leave",
        points: 10,
        mode: "action",
        actions: [
          { id: "a", label: "Approve", correct: true, feedback: "Correct — sufficient balance, advance notice, manager already approved. Nothing to investigate; approve it." },
          { id: "b", label: "Deny", correct: false, feedback: "On what grounds? He has the balance and manager sign-off. Denying a clean request damages trust." },
          { id: "c", label: "Request info", correct: false, feedback: "He's already given balance, dates, and manager approval. Asking for more just creates friction." },
        ],
        lesson: "When a request is complete and within policy, just approve it. Don't manufacture friction.",
      },
      {
        id: "d2-advance",
        from: { name: "Priya Menon", role: "Support Lead" },
        subject: "Salary advance possible?",
        time: "13:05",
        body: [
          "Hi, I've had an unexpected medical bill and was wondering if I could get an advance on next month's salary. What are my options?",
        ],
        category: "Payroll",
        points: 10,
        mode: "action",
        actions: [
          { id: "a", label: "Forward to Payroll/Manager re: policy", correct: true, feedback: "Right — advances depend on company policy and approvals you don't own. Loop in Payroll and her manager rather than promising anything." },
          { id: "b", label: "Reply: yes, approved", correct: false, feedback: "You can't approve an advance unilaterally — that's a policy and budget decision. Don't commit the company." },
          { id: "c", label: "Deny outright", correct: false, feedback: "A flat 'no' without checking policy is cold and may be wrong. Route it to the people who decide." },
        ],
        lesson: "Don't promise (or refuse) things outside your authority — route to the policy owner.",
      },
      {
        id: "d2-phish",
        from: { name: "“CEO – Datuk Fariz”", role: "Lookalike external address" },
        subject: "Urgent task - need your help now",
        time: "16:42",
        body: [
          "I'm in back-to-back meetings and need you to buy 5 x RM500 gift cards for a client right now. Send me the codes by email. Don't call, just handle it discreetly. Thanks.",
        ],
        category: "Security",
        points: 12,
        mode: "action",
        actions: [
          { id: "a", label: "Report to IT Security", correct: true, feedback: "Exactly — gift-card urgency + 'don't call' + lookalike address is a classic CEO-fraud phish. Report it; don't engage." },
          { id: "b", label: "Buy the gift cards", correct: false, feedback: "This is the scam working. Real executives don't ask for secret gift-card codes by email. You'd have lost RM2,500." },
          { id: "c", label: "Reply to confirm", correct: false, feedback: "Replying tells the attacker the inbox is live. Verify through a known channel and report — never reply to the email itself." },
        ],
        lesson: "Urgency + secrecy + gift cards = fraud. HR is a top phishing target. Report, don't react.",
      },
    ],
  },

  // ───────────────────────── DAY 3 — investigation begins ──────────────────
  {
    number: 3,
    briefing:
      "Mid-week, and not everything is as it looks. Some emails come with attachments — open them and check the details before you decide.",
    cases: [
      {
        id: "d3-mc",
        from: { name: "Jason Koh", role: "Warehouse Staff" },
        subject: "MC for last Sunday",
        time: "08:55",
        body: [
          "Hi, attaching my medical certificate for the sick leave I took last Sunday (the 14th). Please process it as paid sick leave.",
        ],
        category: "Leave",
        points: 12,
        investigate: "Open the MC and check the details against his claim.",
        attachments: [
          {
            id: "mc",
            name: "medical_cert.pdf",
            lines: [
              "KLINIK SIHAT SDN BHD",
              "Medical Certificate",
              "Patient: Jason Koh",
              "Date of consultation: 15th (Monday)",
              "MC valid for: 1 day — 15th",
              "Dr. Lim · Reg. 44210",
            ],
          },
        ],
        mode: "action",
        actions: [
          { id: "a", label: "Request info — dates don't match", correct: true, feedback: "Sharp eye. He claims Sunday the 14th, but the MC is dated Monday the 15th. Ask him to clarify before processing — it may be an honest mix-up or a misuse." },
          { id: "b", label: "Approve as paid sick leave", correct: false, feedback: "The MC covers the 15th, not the 14th he's claiming. Approving as-is pays leave the certificate doesn't support." },
          { id: "c", label: "Deny and issue a warning", correct: false, feedback: "Too aggressive — it could be a genuine date error. Clarify first; escalate only if the story doesn't hold." },
        ],
        lesson: "Investigate before you process. A mismatched date isn't proof of fraud, but it's a reason to verify.",
      },
      {
        id: "d3-expense",
        from: { name: "Farah Idris", role: "Sales Rep" },
        subject: "Client dinner expense claim",
        time: "10:40",
        body: [
          "Hi, claiming RM480 for a client dinner last week. Receipt attached. Please reimburse with my next payout.",
        ],
        category: "Payroll",
        points: 12,
        investigate: "Check the receipt total against the claim.",
        attachments: [
          {
            id: "rcpt",
            name: "receipt.jpg",
            lines: [
              "THE GRILL HOUSE",
              "Table 12 · 2 pax",
              "Food & drinks .......... RM 148.00",
              "Service + tax .......... RM  17.80",
              "TOTAL .................. RM 165.80",
            ],
          },
        ],
        mode: "action",
        actions: [
          { id: "a", label: "Request info — amount doesn't match", correct: true, feedback: "Correct — the receipt is RM165.80 but she's claiming RM480. That gap needs explaining before any reimbursement." },
          { id: "b", label: "Forward to Payroll to reimburse RM480", correct: false, feedback: "You'd be approving a RM480 payout against a RM165.80 receipt. Always reconcile the claim to the evidence first." },
          { id: "c", label: "Reimburse RM165.80 quietly", correct: false, feedback: "Don't silently change the figure either — she may have other receipts. Ask her to clarify the discrepancy." },
        ],
        lesson: "Match the claim to the receipt. A number that doesn't reconcile is a question, not a payment.",
      },
      {
        id: "d3-reference",
        from: { name: "Talent Co Recruiters", role: "External agency" },
        subject: "Reference check — ex-employee Sam Ng",
        time: "12:15",
        body: [
          "Hello, Sam Ng listed your company as a previous employer. Could you confirm his role, dates, and tell us why he left and whether you'd rehire him?",
        ],
        category: "Compliance",
        points: 12,
        mode: "action",
        actions: [
          { id: "a", label: "Reply with policy: confirm title & dates only", correct: true, feedback: "Right — standard reference policy is to confirm only objective facts (title, employment dates). Opinions on 'why he left' or 'would you rehire' create legal exposure." },
          { id: "b", label: "Share full performance details", correct: false, feedback: "Volunteering performance opinions and reasons for leaving can expose the company to defamation claims. Stick to verifiable facts." },
          { id: "c", label: "Ignore it", correct: false, feedback: "Silence is unhelpful and unprofessional. Respond — just within policy limits." },
        ],
        lesson: "References: confirm facts (title, dates), not opinions. It protects the company and the ex-employee.",
      },
      {
        id: "d3-bank",
        from: { name: "Hafiz Omar", role: "Operations" },
        subject: "Change my payroll bank account",
        time: "15:33",
        body: [
          "Hi, please update my salary bank account to the new number below before payday. Thanks!",
          "New acc: 5512-8890-2210 (Maybank)",
        ],
        category: "Security",
        points: 12,
        mode: "action",
        actions: [
          { id: "a", label: "Request identity verification first", correct: true, feedback: "Correct — emailed bank-change requests are a common payroll-diversion fraud. Verify it's really him through a trusted channel before changing anything." },
          { id: "b", label: "Forward to Payroll to update now", correct: false, feedback: "If the account is compromised, you've just rerouted his salary to a fraudster. Verify identity before any bank-detail change." },
          { id: "c", label: "Reply asking him to confirm by email", correct: false, feedback: "An email 'confirmation' proves nothing — a hijacked account will happily confirm. Use a phone/in-person check." },
        ],
        lesson: "Bank-detail changes by email need out-of-band identity checks. This is a classic fraud vector.",
      },
    ],
  },

  // ───────────────────────── DAY 4 — sensitive + harder ────────────────────
  {
    number: 4,
    briefing:
      "Heavier day. Some of these are sensitive — they're about people's privacy, dignity, and safety. Handle them carefully and escalate what needs escalating.",
    cases: [
      {
        id: "d4-harassment",
        from: { name: "Anonymous-ish", role: "Junior team member" },
        subject: "Something happened and I don't know who to tell",
        time: "09:20",
        body: [
          "I need to report inappropriate comments from my team lead that are making me dread coming to work. I'm scared it'll affect my job. Please keep this confidential.",
        ],
        category: "Sensitive",
        points: 14,
        mode: "action",
        actions: [
          { id: "a", label: "Escalate confidentially to HR lead / grievance process", correct: true, feedback: "Correct — a harassment report triggers the formal grievance process, handled confidentially and by the right people. Acknowledge to her that she's safe and heard." },
          { id: "b", label: "Reply: are you sure it's that serious?", correct: false, feedback: "Minimising a harassment disclosure is harmful and exposes the company. Believe, support, and route it properly." },
          { id: "c", label: "Forward to her team lead to sort out", correct: false, feedback: "Never — the team lead is the person she's reporting. Forwarding to them breaches confidence and could enable retaliation." },
        ],
        lesson: "Harassment reports: confidential, formal process, never loop in the accused. Get it to the right hands fast.",
      },
      {
        id: "d4-address",
        from: { name: "Roland Chua", role: "Sales Manager" },
        subject: "Need Aisha's home address",
        time: "11:02",
        body: [
          "Hey, can you send me the home address of Aisha from my team? I want to send something. Just reply here with it, thanks.",
        ],
        category: "Sensitive",
        points: 14,
        mode: "action",
        actions: [
          { id: "a", label: "Decline / verify reason & get consent", correct: true, feedback: "Right — an employee's home address is protected personal data. Don't hand it over on request; offer to pass a message or get her consent." },
          { id: "b", label: "Reply with the address", correct: false, feedback: "That's a privacy breach (and likely violates PDPA). Personal data isn't shared just because a manager asks." },
          { id: "c", label: "Forward request to IT", correct: false, feedback: "IT isn't the gatekeeper of HR personal data, and it doesn't address the privacy issue. You handle this — by declining." },
        ],
        lesson: "Personal data (addresses, IDs, medical) isn't shared on casual request — protect it by default.",
      },
      {
        id: "d4-resignation",
        from: { name: "Grace Wong", role: "Finance Analyst" },
        subject: "Resignation",
        time: "13:44",
        body: [
          "Please accept this as formal notice of my resignation, effective four weeks from today. It's been a great two years. Happy to help with handover.",
        ],
        category: "Offboarding",
        points: 14,
        mode: "action",
        actions: [
          { id: "a", label: "Acknowledge + notify manager + start offboarding", correct: true, feedback: "Correct — acknowledge warmly, confirm the last working day, loop in her manager, and kick off the offboarding checklist (handover, access removal, exit interview)." },
          { id: "b", label: "Try to talk her out of it immediately", correct: false, feedback: "Retention conversations are the manager's call, not a reflexive HR push-back. Process the resignation properly first." },
          { id: "c", label: "Do nothing until her last day", correct: false, feedback: "Offboarding starts now — handover, access, final pay and exit logistics all need lead time." },
        ],
        lesson: "Resignations kick off a process: acknowledge, inform the manager, and start structured offboarding early.",
      },
      {
        id: "d4-contract",
        from: { name: "Onboarding system", role: "Automated alert" },
        subject: "⚠ Unsigned contract — starts Monday",
        time: "15:10",
        body: [
          "Alert: New hire 'Daniel Yeo' is scheduled to start Monday, but his employment contract is still unsigned in the system.",
        ],
        category: "Onboarding",
        points: 14,
        mode: "action",
        actions: [
          { id: "a", label: "Chase the signed contract before Monday", correct: true, feedback: "Correct — no one should start work without a signed contract (it's a legal and payroll problem). Reach out today and get it signed before day one." },
          { id: "b", label: "Let him start, sort it later", correct: false, feedback: "Starting unsigned creates legal and liability gaps. Close it before he begins, not after." },
          { id: "c", label: "Cancel his start date", correct: false, feedback: "Overkill — a missing signature is fixable with a quick chase, not a cancelled start." },
        ],
        lesson: "No signed contract, no start. Catch these before day one — it's a legal must.",
      },
      {
        id: "d4-timesheet",
        from: { name: "Kelvin Soo", role: "Contractor" },
        subject: "Timesheet for approval",
        time: "16:30",
        body: [
          "Hi, attaching my timesheet for last week — 45 hours. Please approve for billing.",
        ],
        category: "Payroll",
        points: 14,
        investigate: "Compare the claimed hours with the office badge log.",
        attachments: [
          {
            id: "ts",
            name: "timesheet.xlsx",
            lines: [
              "Kelvin Soo — Week 21",
              "Mon 9h · Tue 9h · Wed 9h",
              "Thu 9h · Fri 9h",
              "Total billable: 45h",
            ],
          },
          {
            id: "badge",
            name: "badge_log.csv (security)",
            lines: [
              "Badge entries — Kelvin Soo, Week 21",
              "Mon: in 09:05, out 18:02",
              "Tue: in 09:00, out 17:55",
              "Wed: NO ENTRY (absent)",
              "Thu: in 09:10, out 18:00",
              "Fri: in 09:02, out 13:30 (half day)",
            ],
          },
        ],
        mode: "action",
        actions: [
          { id: "a", label: "Request info / escalate — hours don't match badge log", correct: true, feedback: "Caught it. He billed 45h, but the badge log shows Wednesday absent and Friday a half-day — closer to ~31h. Query it before approving for billing." },
          { id: "b", label: "Approve 45 hours for billing", correct: false, feedback: "You'd bill a client for hours the access logs say he wasn't here. Always reconcile timesheets against an independent record." },
          { id: "c", label: "Reply: looks fine, thanks", correct: false, feedback: "It doesn't look fine — the evidence contradicts the claim. Don't rubber-stamp billable hours." },
        ],
        lesson: "Cross-check claims against independent data. Two documents that disagree = investigate before you pay.",
      },
    ],
  },

  // ───────────────────────── DAY 5 — the finale ────────────────────────────
  {
    number: 5,
    briefing:
      "Last day of the week. The trickiest mix yet — legal exposure, a whistleblower, a payroll error, and two emails that need a real human touch. Finish strong.",
    cases: [
      {
        id: "d5-legal",
        from: { name: "Messrs. Tan & Partners", role: "Law firm (external)" },
        subject: "Letter of demand — ex-employee dispute",
        time: "09:08",
        body: [
          "We act for a former employee and are writing regarding their dismissal. Please respond with your company's position on the matters set out in the attached letter within 14 days.",
        ],
        category: "Compliance",
        points: 16,
        mode: "action",
        actions: [
          { id: "a", label: "Escalate to Legal immediately — don't respond substantively", correct: true, feedback: "Correct — a letter of demand goes straight to Legal. Anything you say on the merits can be used against the company. Acknowledge receipt only; let Legal craft the response." },
          { id: "b", label: "Reply explaining your side of the story", correct: false, feedback: "Never argue the merits with opposing counsel yourself — you could damage the company's legal position. Route to Legal." },
          { id: "c", label: "Ignore it — it's just a threat", correct: false, feedback: "A 14-day legal deadline is not something to ignore; missing it can mean default. Escalate to Legal now." },
        ],
        lesson: "Legal letters → Legal, immediately. Acknowledge receipt, never argue the substance yourself.",
      },
      {
        id: "d5-whistle",
        from: { name: "Withheld", role: "Operations staff" },
        subject: "Safety issue being ignored",
        time: "10:25",
        body: [
          "I've raised a serious safety hazard on the warehouse floor twice and been told to keep quiet. Someone's going to get hurt. I don't want my name attached for fear of retaliation.",
        ],
        category: "Sensitive",
        points: 16,
        mode: "action",
        actions: [
          { id: "a", label: "Escalate to Compliance/Safety, protect anonymity", correct: true, feedback: "Right — a whistleblower safety report goes to Compliance/Safety urgently, and their identity is protected from retaliation. Confirm to them it's being taken seriously." },
          { id: "b", label: "Ask them to put their name to it first", correct: false, feedback: "Demanding a name before acting can suppress the report and exposes them to retaliation. Act on the substance and protect anonymity." },
          { id: "c", label: "Forward to the warehouse manager", correct: false, feedback: "That's likely the person who told them to keep quiet. Routing it there risks retaliation and buries the hazard." },
        ],
        lesson: "Whistleblower reports: act fast on the risk, protect the reporter, never route to the implicated party.",
      },
      {
        id: "d5-overpay",
        from: { name: "Payroll system", role: "Automated alert" },
        subject: "Overpayment flagged — Liyana Hassan",
        time: "11:40",
        body: [
          "An error overpaid Liyana Hassan RM1,200 this month. Policy requires informing the employee and arranging recovery. Please notify her.",
        ],
        category: "Payroll",
        points: 16,
        mode: "compose",
        compose: {
          placeholder: "Hi Liyana, …",
          check: {
            mustIncludeAnyOf: [
              ["overpaid", "overpayment", "error", "rm1,200", "rm1200", "1,200"],
              ["repay", "recover", "arrange", "plan", "deduct"],
            ],
            mustNotInclude: ["your fault", "immediately or else"],
          },
          exemplar:
            "Hi Liyana, we spotted a payroll error on our side — you were overpaid by RM1,200 this month. Apologies for the confusion. We'll need to recover it, but we can arrange a repayment plan that works for you rather than deducting it all at once. Happy to talk it through — let me know what suits.",
          feedback:
            "Good: own the mistake (it's the company's error), state the amount clearly, and offer a manageable recovery plan instead of a demand. Tone matters when it's someone's money.",
        },
        lesson: "Deliver bad money news with ownership and a plan, not blame. Empathy keeps trust intact.",
      },
      {
        id: "d5-pressure",
        from: { name: "Bobby Aziz", role: "Sales Exec" },
        subject: "APPROVE MY LEAVE NOW please",
        time: "13:12",
        body: [
          "I need leave approved for tomorrow, it's urgent!! I know my balance is basically zero but just approve it this once. Thanks!!",
        ],
        category: "Leave",
        points: 16,
        mode: "action",
        actions: [
          { id: "a", label: "Decline / request info — no balance, explain options", correct: true, feedback: "Right — pressure doesn't override policy. He has no balance; explain calmly and offer options (unpaid leave, manager approval). Firm and kind beats caving." },
          { id: "b", label: "Approve to make it go away", correct: false, feedback: "Caving to urgency and CAPS sets a precedent and breaks policy. Consistency is fairness — don't bend it under pressure." },
          { id: "c", label: "Ignore until he calms down", correct: false, feedback: "Silence reads as disrespect and he'll escalate. Respond promptly — just don't approve what policy doesn't allow." },
        ],
        lesson: "Urgency and pressure aren't reasons to break policy. Respond fast, stay consistent, offer real options.",
      },
      {
        id: "d5-degree",
        from: { name: "Background-check vendor", role: "External" },
        subject: "Verification result — candidate Ethan Roy",
        time: "14:50",
        body: [
          "Completed the pre-employment check for your finalist, Ethan Roy. Please review the attached result before the offer is confirmed.",
        ],
        category: "Compliance",
        points: 16,
        investigate: "Open the check result before deciding on the offer.",
        attachments: [
          {
            id: "bg",
            name: "verification_result.pdf",
            lines: [
              "Pre-Employment Verification — Ethan Roy",
              "Claimed: BSc Computer Science, NUS, 2019",
              "University record: NO MATCHING GRADUATE FOUND",
              "Previous employer 'DataCorp': CONFIRMED",
              "Status: DEGREE UNVERIFIED — possible misrepresentation",
            ],
          },
        ],
        mode: "action",
        actions: [
          { id: "a", label: "Escalate to hiring manager — degree unverified", correct: true, feedback: "Correct — the university can't verify the degree he claimed. That's a material misrepresentation; flag it to the hiring manager and pause the offer pending clarification." },
          { id: "b", label: "Confirm the offer anyway", correct: false, feedback: "Hiring on an unverified (possibly fake) qualification is a serious risk. Don't proceed until it's resolved." },
          { id: "c", label: "Reject him without a word", correct: false, feedback: "There could be an explanation (name change, wrong year). Escalate and let the process clarify — but the offer can't be confirmed as-is." },
        ],
        lesson: "Verify credentials before the offer is final. An unverified degree is a pause-and-escalate, not a rubber stamp.",
      },
      {
        id: "d5-wellbeing",
        from: { name: "Sara Lim", role: "Customer Success" },
        subject: "Struggling a bit",
        time: "16:05",
        body: [
          "I've been having a really hard time with my mental health lately and it's affecting my work. I didn't know who else to tell. I'm not sure what support there is.",
        ],
        category: "Sensitive",
        points: 16,
        mode: "compose",
        compose: {
          placeholder: "Hi Sara, …",
          check: {
            mustIncludeAnyOf: [
              ["thank you for", "thanks for", "sorry", "takes courage", "glad you"],
              ["eap", "employee assistance", "counsel", "support", "leave", "talk", "confidential"],
            ],
            mustNotInclude: ["toughen up", "not my problem", "just relax"],
          },
          exemplar:
            "Hi Sara, thank you for trusting me with this — it takes courage to reach out, and I'm really glad you did. This stays confidential. We have an Employee Assistance Programme with free, confidential counselling, and we can look at flexible arrangements while you get support. Would you like me to set up a private chat to talk through the options?",
          feedback:
            "This is the human core of HR: acknowledge with warmth, reassure confidentiality, and signpost real support (EAP, flexibility) — without overstepping into being their therapist.",
        },
        lesson: "Wellbeing disclosures need empathy first, then concrete signposting (EAP, flexibility), and confidentiality throughout.",
      },
    ],
  },
];

export const hrInboxGame: Game = {
  id: "hr-inbox",
  family: "people",
  role: "HR / People Ops",
  tagline: "Run the HR inbox for a week — triage, decide, and catch what doesn't add up.",
  icon: "🤝",
  minutes: 20,
  intro:
    "You're on the People Ops desk for a full week — Day 1 to Day 5. Each morning the inbox fills with real problems: onboarding hiccups, payslip questions, leave requests, sensitive complaints, and a few emails that aren't what they claim. Read each one, dig into the attachments when something feels off, and decide how to handle it. Friday, you get your review.",
  playSummary: "5-day week · ~22 emails",
  steps: [], // bespoke surface — see components/simulator/bespoke/HrPlayer.tsx
  interestPrompt:
    "That's the People Ops desk: routing, judgment calls, sensitive conversations, and spotting what doesn't add up. Some people find it deeply meaningful, others draining. Which were you?",
};
