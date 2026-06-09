import { test, expect } from "@playwright/test";
import {
  emptyProfileForm,
  applyParsedProfileToForm,
  getMissingImportantFields,
  getAishaDemoFormData,
  profileFormToUserProfile,
  type ParsedProfileFormData,
} from "../../lib/profile-form";

/**
 * Pure-logic guard for the data-honesty contract: parsed CV data must only fill
 * fields backed by evidence, never invent the rest, and missing fields must be
 * reported back to the user. (No browser/server needed.)
 */
const emptyParse: ParsedProfileFormData = {
  name: "", email: "", contactNumber: "", currentRole: "", description: "",
  education: [], experience: [],
  skills: [], interests: [], preferredIndustries: [],
  locationPreference: "", salaryExpectation: "",
  availabilityYear: "", availabilityMonth: "", workingStyle: "", resumeText: "",
};

test.describe("Profile form helpers (data honesty)", () => {
  test("an empty CV parse fills nothing and reports every missing field", () => {
    const merged = applyParsedProfileToForm(emptyParse, emptyProfileForm());

    expect(merged.name).toBe("");
    expect(merged.contactNumber).toBe("");
    expect(merged.email).toBe("");
    expect(merged.salaryExpectation).toBe("");
    expect(merged.locations).toEqual([]);
    // No invented education/experience rows.
    expect(merged.education.every((e) => !e.school)).toBe(true);

    expect(getMissingImportantFields(merged)).toEqual([
      "Contact number",
      "Email",
      "Availability",
      "Salary expectation",
      "Preferred locations",
    ]);
  });

  test("only evidenced fields are filled; the rest stay empty", () => {
    const parsed: ParsedProfileFormData = {
      ...emptyParse,
      name: "Jordan Lee",
      currentRole: "Software Engineer",
      skills: ["Python", "SQL"],
      education: [
        { school: "NUS", fieldOfStudy: "Computer Science", qualification: "BSc", startYear: "2019", endYear: "2023" },
      ],
    };
    const merged = applyParsedProfileToForm(parsed, emptyProfileForm());

    expect(merged.name).toBe("Jordan Lee");
    expect(merged.currentRole).toBe("Software Engineer");
    expect(merged.skills).toEqual(["Python", "SQL"]);
    expect(merged.education[0].school).toBe("NUS");

    // Nothing was invented for fields the CV did not contain.
    expect(merged.contactNumber).toBe("");
    expect(merged.email).toBe("");
    expect(merged.salaryExpectation).toBe("");
    expect(merged.availabilityYear).toBe("");
    expect(merged.locations).toEqual([]);

    expect(getMissingImportantFields(merged)).toContain("Contact number");
    expect(getMissingImportantFields(merged)).toContain("Salary expectation");
  });

  test("parsing never overwrites what the user already typed", () => {
    const current = { ...emptyProfileForm(), name: "User Typed", contactNumber: "999" };
    const parsed: ParsedProfileFormData = { ...emptyParse, name: "AI Name", contactNumber: "111" };
    const merged = applyParsedProfileToForm(parsed, current);

    expect(merged.name).toBe("User Typed");
    expect(merged.contactNumber).toBe("999");
  });

  test("the Aisha demo is complete and maps to a valid dashboard UserProfile", () => {
    const demo = getAishaDemoFormData();
    expect(getMissingImportantFields(demo)).toEqual([]);

    const profile = profileFormToUserProfile(demo);
    expect(profile.name).toBe("Aisha Lim");
    expect(profile.education).toContain("University of Melbourne");
    expect(profile.experience).toContain("Deloitte");
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.locationPreference).toContain("Melbourne");
  });
});
