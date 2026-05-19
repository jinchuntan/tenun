"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Cpu,
  Sun,
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CVUpload } from "@/components/cv-upload";
import { UserProfile } from "@/lib/types";
import { demoProfile } from "@/lib/demo-data";
import {
  skillSuggestions,
  interestSuggestions,
  industrySuggestions,
} from "@/lib/resume-parser";


function TagInput({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer group">
            {v}
            <button
              onClick={() => removeTag(v)}
              className="ml-1 opacity-60 group-hover:opacity-100"
            >
              &times;
            </button>
          </Badge>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input.trim()) addTag(input);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
      />
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-navy-100 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-navy-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    currentRole: "",
    education: "",
    experience: "",
    skills: [],
    interests: [],
    preferredIndustries: [],
    salaryExpectation: "",
    riskAppetite: "medium",
    lifestylePreference: "flexibility",
    locationPreference: "",
    resumeText: "",
  });

  const update = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const loadDemo = () => {
    setProfile(demoProfile);
  };

  const applyParsedProfile = (parsed: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev };
      if (parsed.name && !prev.name) merged.name = parsed.name;
      if (parsed.currentRole && !prev.currentRole)
        merged.currentRole = parsed.currentRole;
      if (parsed.education && !prev.education)
        merged.education = parsed.education;
      if (parsed.experience && !prev.experience)
        merged.experience = parsed.experience;
      if (parsed.locationPreference && !prev.locationPreference)
        merged.locationPreference = parsed.locationPreference;
      // Merge arrays (union with existing)
      if (parsed.skills)
        merged.skills = [...new Set([...prev.skills, ...parsed.skills])];
      if (parsed.interests)
        merged.interests = [
          ...new Set([...prev.interests, ...parsed.interests]),
        ];
      if (parsed.preferredIndustries)
        merged.preferredIndustries = [
          ...new Set([
            ...prev.preferredIndustries,
            ...parsed.preferredIndustries,
          ]),
        ];
      if (parsed.resumeText) merged.resumeText = parsed.resumeText;
      return merged;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Store profile in sessionStorage for dashboard to pick up
    sessionStorage.setItem("tenun-profile", JSON.stringify(profile));
    // Simulate processing delay for UX
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all";
  const labelCls = "block text-sm font-medium text-navy-800 mb-1.5";

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
            Build Your Career Profile
          </h1>
          <p className="text-navy-500 max-w-xl mx-auto">
            Share your background and preferences. Tenun will extract your
            career threads and generate personalized pathways.
          </p>
          <button
            onClick={loadDemo}
            className="mt-4 inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load demo profile (Aisha Lim)
          </button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* CV Upload */}
          <CVUpload onProfileExtracted={applyParsedProfile} />

          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-navy-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Aisha Lim"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Current Role / Background *</label>
                  <input
                    type="text"
                    required
                    value={profile.currentRole}
                    onChange={(e) => update("currentRole", e.target.value)}
                    placeholder="e.g. Final-year CS Student"
                    className={inputCls}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-navy-600" />
                Education & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>Education</label>
                <textarea
                  value={profile.education}
                  onChange={(e) => update("education", e.target.value)}
                  placeholder="e.g. BSc Computer Science, University of Melbourne"
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </div>
              <div>
                <label className={labelCls}>Work / Project Experience</label>
                <textarea
                  value={profile.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  placeholder="Describe your internships, projects, and relevant experience..."
                  rows={4}
                  className={inputCls + " resize-none"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-navy-600" />
                Skills & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>Skills</label>
                <TagInput
                  values={profile.skills}
                  onChange={(v) => update("skills", v)}
                  suggestions={skillSuggestions}
                  placeholder="Type a skill and press Enter..."
                />
              </div>
              <div>
                <label className={labelCls}>Interests</label>
                <TagInput
                  values={profile.interests}
                  onChange={(v) => update("interests", v)}
                  suggestions={interestSuggestions}
                  placeholder="Type an interest and press Enter..."
                />
              </div>
              <div>
                <label className={labelCls}>Preferred Industries</label>
                <TagInput
                  values={profile.preferredIndustries}
                  onChange={(v) => update("preferredIndustries", v)}
                  suggestions={industrySuggestions}
                  placeholder="Type an industry and press Enter..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="w-5 h-5 text-navy-600" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Salary Expectation</label>
                  <input
                    type="text"
                    value={profile.salaryExpectation}
                    onChange={(e) => update("salaryExpectation", e.target.value)}
                    placeholder="e.g. $70,000 - $90,000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Location Preference</label>
                  <input
                    type="text"
                    value={profile.locationPreference}
                    onChange={(e) =>
                      update("locationPreference", e.target.value)
                    }
                    placeholder="e.g. Melbourne, Remote"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Risk Appetite</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => update("riskAppetite", r)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                          profile.riskAppetite === r
                            ? "border-navy-700 bg-navy-700 text-white"
                            : "border-navy-200 text-navy-600 hover:border-navy-400"
                        }`}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Lifestyle Preference</label>
                  <select
                    value={profile.lifestylePreference}
                    onChange={(e) =>
                      update(
                        "lifestylePreference",
                        e.target.value as UserProfile["lifestylePreference"]
                      )
                    }
                    className={inputCls}
                  >
                    <option value="stability">Stability</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="fast-growth">Fast Growth</option>
                    <option value="purpose-driven">Purpose-driven</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume paste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-navy-600" />
                Resume Text (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={profile.resumeText || ""}
                onChange={(e) => update("resumeText", e.target.value)}
                placeholder="Paste your resume text here for enhanced analysis..."
                rows={8}
                className={inputCls + " resize-none font-mono text-xs"}
              />
              <p className="text-xs text-navy-400 mt-2">
                Pasting your resume helps Tenun extract richer career threads.
                This data is processed locally and never stored.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="xl"
              disabled={loading || !profile.name || !profile.currentRole}
              className="w-full sm:w-auto min-w-[280px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Weaving your career threads...
                </>
              ) : (
                <>
                  Generate My Career Weave
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
}
