import { UserProfile } from "./types";

// ============================
// Predefined suggestion lists (shared with profile page)
// ============================

export const skillSuggestions = [
  "Python", "JavaScript", "TypeScript", "React", "SQL", "Java", "C++",
  "Figma", "Tableau", "Excel", "Git", "Docker", "AWS", "Machine Learning",
  "Data Visualization", "Public Speaking", "Project Management",
  "Research", "Writing", "Leadership", "Communication", "Agile",
];

export const interestSuggestions = [
  "Product Management", "Data Science", "Software Engineering",
  "UX Design", "Consulting", "Finance", "Climate Technology",
  "Healthcare", "Education", "AI/ML", "Cybersecurity", "Marketing",
  "Entrepreneurship", "Social Impact", "Gaming",
];

export const industrySuggestions = [
  "Technology", "Finance", "Healthcare", "Education", "Consulting",
  "Climate Tech", "E-commerce", "Media", "Government", "Nonprofit",
  "Manufacturing", "Energy", "Retail", "Social Enterprise",
];

// ============================
// Section Extraction
// ============================

interface ResumeSection {
  education: string;
  experience: string;
  skills: string;
  interests: string;
  projects: string;
  summary: string;
}

const headingPatterns: [RegExp, keyof ResumeSection][] = [
  [/^education/i, "education"],
  [/^academic/i, "education"],
  [/^experience/i, "experience"],
  [/^work\s*(experience|history)/i, "experience"],
  [/^professional\s*experience/i, "experience"],
  [/^employment/i, "experience"],
  [/^skills/i, "skills"],
  [/^technical\s*skills/i, "skills"],
  [/^core\s*competencies/i, "skills"],
  [/^interests/i, "interests"],
  [/^hobbies/i, "interests"],
  [/^activities/i, "interests"],
  [/^projects/i, "projects"],
  [/^personal\s*projects/i, "projects"],
  [/^competitions/i, "projects"],
  [/^projects\s*[&]\s*competitions/i, "projects"],
  [/^summary/i, "summary"],
  [/^objective/i, "summary"],
  [/^profile/i, "summary"],
  [/^about\s*me/i, "summary"],
];

function extractSections(text: string): ResumeSection {
  const lines = text.split(/\n/);

  const sectionStarts: { line: number; section: keyof ResumeSection }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    for (const [pattern, section] of headingPatterns) {
      if (pattern.test(trimmed)) {
        sectionStarts.push({ line: i, section });
        break;
      }
    }
  }

  const result: ResumeSection = {
    education: "",
    experience: "",
    skills: "",
    interests: "",
    projects: "",
    summary: "",
  };

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i].line + 1;
    const end =
      i + 1 < sectionStarts.length ? sectionStarts[i + 1].line : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    // Append if the section already has content (e.g. multiple EXPERIENCE sections)
    if (result[sectionStarts[i].section]) {
      result[sectionStarts[i].section] += "\n\n" + content;
    } else {
      result[sectionStarts[i].section] = content;
    }
  }

  return result;
}

// ============================
// Individual Field Extractors
// ============================

function extractName(text: string): string {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";

  const firstLine = lines[0];
  // Name: 1-5 words, mostly letters, possibly hyphens/apostrophes/periods
  const namePattern = /^[A-Za-z][A-Za-z.\-' ]{1,60}$/;
  if (namePattern.test(firstLine) && firstLine.split(/\s+/).length <= 5) {
    return firstLine;
  }
  return "";
}

function extractCurrentRole(text: string): string {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return "";

  const secondLine = lines[1];
  const rolePatterns = [
    /student/i, /engineer/i, /developer/i, /manager/i, /analyst/i,
    /designer/i, /consultant/i, /intern/i, /researcher/i, /specialist/i,
    /director/i, /coordinator/i, /associate/i, /lead/i, /aspiring/i,
    /final.year/i, /graduate/i, /senior/i, /junior/i, /architect/i,
    /scientist/i, /administrator/i, /officer/i, /executive/i,
  ];

  if (
    rolePatterns.some((p) => p.test(secondLine)) ||
    (secondLine.length < 120 && secondLine.includes("|"))
  ) {
    return secondLine
      .replace(/\|/g, ",")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

// Aliases map common resume terms to predefined tags
const skillAliases: Record<string, string> = {
  "team leadership": "Leadership",
  "agile methodology": "Agile",
  "agile methodologies": "Agile",
  "amazon web services": "AWS",
  "react.js": "React",
  "reactjs": "React",
  "node.js": "JavaScript",
  "nodejs": "JavaScript",
  "c/c++": "C++",
  "microsoft excel": "Excel",
  "ms excel": "Excel",
  "data viz": "Data Visualization",
};

const interestAliases: Record<string, string> = {
  "data analytics": "Data Science",
  "data analysis": "Data Science",
  "ux research": "UX Design",
  "ui/ux": "UX Design",
  "user experience": "UX Design",
  "machine learning": "AI/ML",
  "artificial intelligence": "AI/ML",
  "deep learning": "AI/ML",
  "startup": "Entrepreneurship",
  "startups": "Entrepreneurship",
};

const industryAliases: Record<string, string> = {
  "climate tech": "Climate Tech",
  "climate-tech": "Climate Tech",
  "climate technology": "Climate Tech",
  "greentech": "Climate Tech",
  "green technology": "Climate Tech",
  "e-commerce": "E-commerce",
  "ecommerce": "E-commerce",
  "social enterprise": "Social Enterprise",
  "non-profit": "Nonprofit",
  "non profit": "Nonprofit",
  "fintech": "Finance",
  "edtech": "Education",
  "healthtech": "Healthcare",
  "health tech": "Healthcare",
  "medtech": "Healthcare",
};

function matchTags(
  text: string,
  suggestions: string[],
  aliases: Record<string, string>
): string[] {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  for (const suggestion of suggestions) {
    if (lowerText.includes(suggestion.toLowerCase())) {
      if (!matched.includes(suggestion)) {
        matched.push(suggestion);
      }
    }
  }

  for (const [alias, canonical] of Object.entries(aliases)) {
    if (lowerText.includes(alias.toLowerCase())) {
      const target = suggestions.find((s) => s === canonical);
      if (target && !matched.includes(target)) {
        matched.push(target);
      }
    }
  }

  return matched;
}

function extractLocation(text: string): string {
  const locationPatterns = [
    /(?:based\s+in|located\s+in|location[:\s]+)([^\n,]{2,40})/i,
    /(\w[\w\s]{1,25}),\s*(Australia|USA|UK|Singapore|Canada|India|Germany|Remote)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // Look for standalone known city names near contextual keywords
  const cities =
    /\b(Melbourne|Sydney|Brisbane|Perth|Auckland|Singapore|London|New York|San Francisco|Toronto|Berlin|Tokyo|Hong Kong|Dubai|Remote)\b/i;
  const cityMatch = text.match(cities);
  if (cityMatch) {
    return cityMatch[0];
  }

  return "";
}

// ============================
// Main Parse Function
// ============================

export interface ParseResult {
  profile: Partial<UserProfile>;
  confidence: {
    name: boolean;
    currentRole: boolean;
    education: boolean;
    experience: boolean;
    skills: boolean;
    interests: boolean;
    industries: boolean;
    location: boolean;
  };
}

export function parseResumeText(rawText: string): ParseResult {
  const sections = extractSections(rawText);

  const name = extractName(rawText);
  const currentRole = extractCurrentRole(rawText);
  const education = sections.education || "";

  const experience = [sections.experience, sections.projects]
    .filter(Boolean)
    .join("\n\n");

  // Match skills from the skills section primarily, fall back to full text
  const skillsText = sections.skills || rawText;
  const skills = matchTags(skillsText, skillSuggestions, skillAliases);

  // Match interests from interests section or full text
  const interestsText = sections.interests || rawText;
  const interests = matchTags(interestsText, interestSuggestions, interestAliases);

  // Match industries from full text
  const industries = matchTags(rawText, industrySuggestions, industryAliases);

  const location = extractLocation(rawText);

  const profile: Partial<UserProfile> = {
    ...(name && { name }),
    ...(currentRole && { currentRole }),
    ...(education && { education }),
    ...(experience && { experience }),
    ...(skills.length > 0 && { skills }),
    ...(interests.length > 0 && { interests }),
    ...(industries.length > 0 && { preferredIndustries: industries }),
    ...(location && { locationPreference: location }),
    resumeText: rawText,
  };

  return {
    profile,
    confidence: {
      name: !!name,
      currentRole: !!currentRole,
      education: !!education,
      experience: !!experience,
      skills: skills.length > 0,
      interests: interests.length > 0,
      industries: industries.length > 0,
      location: !!location,
    },
  };
}
