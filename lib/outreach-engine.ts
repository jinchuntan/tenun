import {
  UserProfile,
  OutreachMessageType,
  OutreachDraft,
  PersonalizedMentor,
  PathwayCard,
  PersonalizedHub,
} from "./types";

export interface OutreachContext {
  profile: UserProfile;
  messageType: OutreachMessageType;
  targetMentor?: PersonalizedMentor;
  targetPathway?: PathwayCard;
  targetHub?: PersonalizedHub;
  targetRole?: string;
  targetCompany?: string;
}

function topSkills(profile: UserProfile, count = 3): string {
  return profile.skills.slice(0, count).join(", ");
}

function experienceBrief(profile: UserProfile): string {
  const exp = profile.experience.trim();
  if (!exp) return "my academic and project work";
  // Take first sentence or first 120 chars
  const firstSentence = exp.split(/[.!]\s/)[0];
  return firstSentence.length > 120
    ? firstSentence.slice(0, 117) + "..."
    : firstSentence;
}

function generateId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateOutreachDraft(context: OutreachContext): OutreachDraft {
  const { profile, messageType, targetMentor, targetPathway, targetHub, targetRole, targetCompany } = context;

  const name = profile.name || "there";
  const role = profile.currentRole || "early-career professional";
  const skills = topSkills(profile);
  const experience = experienceBrief(profile);

  const mentorName = targetMentor?.name || "[Mentor Name]";
  const mentorRole = targetMentor ? `${targetMentor.role} at ${targetMentor.company}` : "[Their Role]";
  const companyName = targetCompany || targetMentor?.company || "[Company Name]";
  const roleName = targetRole || targetPathway?.roles?.[0] || "[Role Title]";
  const cityName = targetHub?.city || "[City]";
  const pathwayName = targetPathway?.name || "career growth";

  switch (messageType) {
    case "cold-email":
      return {
        id: generateId(),
        type: "cold-email",
        subject: `${role} interested in ${roleName} at ${companyName}`,
        recipientContext: `Recruiter at ${companyName}`,
        body: `Hi,

My name is ${name}, and I'm a ${role}. I'm reaching out because I'm genuinely excited about the ${roleName} opportunity at ${companyName}.

${experience ? `Through ${experience}, I developed skills in ${skills}.` : `I have skills in ${skills} that I'm eager to apply in a professional setting.`}${targetPathway ? ` I'm particularly drawn to ${pathwayName}-oriented roles because they align with both my skill set and where I want to grow.` : ""}${targetHub ? ` I'm also very interested in opportunities in ${cityName}, which is a strong fit for my career goals.` : ""}

I'd welcome the chance to learn more about the role and share how my background might contribute to your team. Would you have 15 minutes for a brief conversation?

Thank you for your time,
${name}`,
      };

    case "linkedin-message":
      return {
        id: generateId(),
        type: "linkedin-message",
        recipientContext: `Alumni / Professional at ${companyName}`,
        body: `Hi [Name],

I came across your profile and was inspired by your work${targetMentor ? ` as a ${mentorRole}` : ` at ${companyName}`}. I'm a ${role} with experience in ${skills}, and I'm currently exploring ${pathwayName} opportunities.

I'd love to hear about your journey${targetHub ? ` in ${cityName}` : ""} and any advice you might have for someone starting out in this field. Would you be open to a quick virtual coffee chat?

Thank you for considering,
${name}`,
      };

    case "mentorship-request":
      return {
        id: generateId(),
        type: "mentorship-request",
        subject: `Mentorship request from ${name} — ${role}`,
        recipientContext: `Mentor: ${mentorName}`,
        body: `Dear ${mentorName},

My name is ${name}, and I'm a ${role}. I've been following your work${targetMentor ? ` as a ${mentorRole}` : ""}, and I'm deeply inspired by your career journey.

I'm currently exploring a path in ${pathwayName}, and I believe your expertise${targetMentor?.expertise ? ` in ${targetMentor.expertise.slice(0, 2).join(" and ")}` : ""} could provide invaluable guidance. Through ${experience}, I've built a foundation in ${skills}, but I recognize there's so much more to learn.

I would be truly grateful if you'd consider a short mentorship conversation — even 20-30 minutes of your time would mean a lot to me. I'm happy to work around your schedule and come prepared with specific questions.

Thank you for your time and generosity,
${name}`,
      };

    case "follow-up":
      return {
        id: generateId(),
        type: "follow-up",
        subject: `Following up — ${name}`,
        recipientContext: `Previous contact at ${companyName}`,
        body: `Hi [Name],

I hope this message finds you well. I wanted to follow up on our previous conversation about ${roleName} at ${companyName}.

Since we last spoke, I've been actively working on strengthening my skills in ${skills}${targetPathway ? ` as part of my ${pathwayName} career development` : ""}. I remain very interested in the opportunity and would love to continue our conversation.

Please let me know if there's a good time to reconnect. I'm flexible and happy to work around your availability.

Best regards,
${name}`,
      };

    case "self-intro":
      return {
        id: generateId(),
        type: "self-intro",
        recipientContext: "General introduction",
        body: `Hi, I'm ${name} — a ${role} with skills in ${skills}.

${experience ? `${experience}.` : ""}

I'm passionate about ${profile.interests.slice(0, 2).join(" and ") || "building impactful solutions"}, and I'm currently exploring ${pathwayName} opportunities${targetHub ? ` in ${cityName}` : ""}. I bring a combination of ${profile.skills.length > 5 ? "broad technical skills" : "focused expertise"} and genuine curiosity for the field.

What excites me most is the chance to apply my background to real-world challenges while continuing to learn and grow. I'm always open to connecting with like-minded professionals.

Let's connect!
${name}`,
      };

    case "why-good-fit":
      return {
        id: generateId(),
        type: "why-good-fit",
        recipientContext: `Application for ${roleName} at ${companyName}`,
        body: `Why I'm a strong fit for ${roleName} at ${companyName}:

1. Relevant Skills: I bring hands-on experience with ${skills}, which directly applies to the core requirements of this role.

2. Proven Track Record: ${experience || "Through my academic and project work, I've consistently delivered results in team settings"}.

3. Growth Mindset: I'm actively investing in my development${targetPathway ? ` along a ${pathwayName} trajectory` : ""}, which means I'll continue to grow and contribute more over time.

4. Cultural Alignment: ${profile.interests.length > 0 ? `My interests in ${profile.interests.slice(0, 2).join(" and ")} align with ${companyName}'s mission` : `I'm genuinely excited about ${companyName}'s work`}, and I'm motivated to contribute to meaningful outcomes.

${targetHub ? `5. Location Fit: I'm enthusiastic about working in ${cityName} and am ready to contribute to the local ${targetHub.industries?.[0] || "tech"} ecosystem.` : ""}

I'm eager to bring my energy, skills, and curiosity to ${companyName}.`,
      };
  }
}
