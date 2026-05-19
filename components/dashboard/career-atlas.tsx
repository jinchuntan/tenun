"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Briefcase, ExternalLink, Building2, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/lib/types";

interface LocationMatch {
  city: string;
  country: string;
  countryEmoji: string;
  region: string;
  reason: string;
  jobs: AtlasJob[];
}

interface AtlasJob {
  title: string;
  company: string;
  salary: string;
  level: string;
  type: string;
  link: string;
}

const institutionLocationMap: Record<string, { city: string; country: string; countryEmoji: string; region: string }> = {
  "university of malaya": { city: "Kuala Lumpur", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "universiti malaya": { city: "Kuala Lumpur", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "universiti teknologi malaysia": { city: "Johor Bahru", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "utm": { city: "Johor Bahru", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "universiti putra malaysia": { city: "Serdang", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "upm": { city: "Serdang", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "universiti teknologi mara": { city: "Shah Alam", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "uitm": { city: "Shah Alam", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "taylor's university": { city: "Subang Jaya", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "sunway university": { city: "Subang Jaya", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "ucsi university": { city: "Kuala Lumpur", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
  "michigan state university": { city: "East Lansing / Detroit", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "msu michigan": { city: "East Lansing / Detroit", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "university of michigan": { city: "Ann Arbor / Detroit", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "stanford university": { city: "San Francisco Bay Area", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "stanford": { city: "San Francisco Bay Area", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "mit": { city: "Boston / Cambridge", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "massachusetts institute of technology": { city: "Boston / Cambridge", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "harvard university": { city: "Boston / Cambridge", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "harvard": { city: "Boston / Cambridge", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
  "university of toronto": { city: "Toronto", country: "Canada", countryEmoji: "🇨🇦", region: "North America" },
  "university of british columbia": { city: "Vancouver", country: "Canada", countryEmoji: "🇨🇦", region: "North America" },
  "ubc": { city: "Vancouver", country: "Canada", countryEmoji: "🇨🇦", region: "North America" },
  "national university of singapore": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "nus": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "nanyang technological university": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "ntu": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "singapore management university": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "smu": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
  "university of melbourne": { city: "Melbourne", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
  "monash university": { city: "Melbourne", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
  "university of sydney": { city: "Sydney", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
  "unsw": { city: "Sydney", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
  "imperial college london": { city: "London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
  "university college london": { city: "London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
  "ucl": { city: "London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
  "university of oxford": { city: "Oxford", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
  "oxford": { city: "Oxford / London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
  "cambridge": { city: "Cambridge / London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
};

const jobsByLocation: Record<string, AtlasJob[]> = {
  "Kuala Lumpur": [
    { title: "Data Analyst", company: "Grab", salary: "MYR 5,000–8,000/mo", level: "Entry–Mid", type: "Full-time", link: "https://www.jobstreet.com.my/en/job-search/data-analyst-jobs/" },
    { title: "Product Manager", company: "Axiata Digital", salary: "MYR 8,000–12,000/mo", level: "Mid", type: "Full-time", link: "https://www.jobstreet.com.my/en/job-search/product-manager-jobs/" },
    { title: "Software Engineer", company: "Fusionex", salary: "MYR 4,500–7,000/mo", level: "Entry", type: "Full-time", link: "https://www.jobstreet.com.my/en/job-search/software-engineer-jobs/" },
    { title: "Business Intelligence Analyst", company: "CIMB Bank", salary: "MYR 5,500–8,500/mo", level: "Entry–Mid", type: "Full-time", link: "https://www.jobstreet.com.my/en/job-search/business-intelligence-jobs/" },
  ],
  "Singapore": [
    { title: "Product Analyst", company: "Shopee", salary: "SGD 4,500–6,500/mo", level: "Entry", type: "Full-time", link: "https://www.jobstreet.com.sg/en/job-search/product-analyst-jobs/" },
    { title: "Data Scientist", company: "DBS Bank", salary: "SGD 6,000–9,000/mo", level: "Mid", type: "Full-time", link: "https://www.jobstreet.com.sg/en/job-search/data-scientist-jobs/" },
    { title: "UX Researcher", company: "Sea Group", salary: "SGD 5,000–7,500/mo", level: "Entry–Mid", type: "Full-time", link: "https://www.jobstreet.com.sg/en/job-search/ux-researcher-jobs/" },
    { title: "Associate PM", company: "Carousell", salary: "SGD 4,000–6,000/mo", level: "Entry", type: "Full-time", link: "https://www.jobstreet.com.sg/en/job-search/product-manager-jobs/" },
  ],
  "East Lansing / Detroit": [
    { title: "Data Analyst", company: "Ford Motor Company", salary: "$65,000–$85,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=data+analyst&l=Detroit%2C+MI" },
    { title: "Product Manager", company: "Rocket Companies", salary: "$90,000–$130,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=product+manager&l=Detroit%2C+MI" },
    { title: "Machine Learning Engineer", company: "General Motors", salary: "$100,000–$130,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://www.indeed.com/jobs?q=machine+learning+engineer&l=Detroit%2C+MI" },
    { title: "Business Analyst", company: "Quicken Loans", salary: "$60,000–$80,000/yr", level: "Entry", type: "Full-time", link: "https://www.indeed.com/jobs?q=business+analyst&l=Detroit%2C+MI" },
  ],
  "Ann Arbor / Detroit": [
    { title: "Software Engineer", company: "Duo Security (Cisco)", salary: "$100,000–$140,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=software+engineer&l=Ann+Arbor%2C+MI" },
    { title: "Data Scientist", company: "Ford Autonomous Vehicles", salary: "$95,000–$125,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=data+scientist&l=Ann+Arbor%2C+MI" },
    { title: "Product Manager", company: "StockX", salary: "$85,000–$115,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=product+manager&l=Ann+Arbor%2C+MI" },
    { title: "UX Designer", company: "University of Michigan Health", salary: "$70,000–$90,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=ux+designer&l=Ann+Arbor%2C+MI" },
  ],
  "San Francisco Bay Area": [
    { title: "Associate PM", company: "Google", salary: "$140,000–$180,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=associate+product+manager&l=San+Francisco%2C+CA" },
    { title: "Data Engineer", company: "Airbnb", salary: "$130,000–$175,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=data+engineer&l=San+Francisco%2C+CA" },
    { title: "ML Researcher", company: "OpenAI", salary: "$150,000–$250,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://www.indeed.com/jobs?q=machine+learning+researcher&l=San+Francisco%2C+CA" },
    { title: "Growth Analyst", company: "Stripe", salary: "$110,000–$150,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=growth+analyst&l=San+Francisco%2C+CA" },
  ],
  "Melbourne": [
    { title: "Data Analyst", company: "ANZ Bank", salary: "AUD $70,000–$90,000/yr", level: "Entry", type: "Full-time", link: "https://www.seek.com.au/data-analyst-jobs/in-Melbourne-VIC-3000" },
    { title: "Product Manager", company: "MYOB", salary: "AUD $100,000–$130,000/yr", level: "Mid", type: "Full-time", link: "https://www.seek.com.au/product-manager-jobs/in-Melbourne-VIC-3000" },
    { title: "Software Engineer", company: "Envato", salary: "AUD $90,000–$120,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.seek.com.au/software-engineer-jobs/in-Melbourne-VIC-3000" },
    { title: "UX Designer", company: "Seek", salary: "AUD $85,000–$110,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://www.seek.com.au/ux-designer-jobs/in-Melbourne-VIC-3000" },
  ],
  "Sydney": [
    { title: "Associate PM", company: "Canva", salary: "AUD $90,000–$115,000/yr", level: "Entry", type: "Full-time", link: "https://www.seek.com.au/product-manager-jobs/in-Sydney-NSW-2000" },
    { title: "Data Scientist", company: "Commonwealth Bank", salary: "AUD $95,000–$130,000/yr", level: "Mid", type: "Full-time", link: "https://www.seek.com.au/data-scientist-jobs/in-Sydney-NSW-2000" },
    { title: "Product Analyst", company: "Atlassian", salary: "AUD $85,000–$110,000/yr", level: "Entry", type: "Full-time", link: "https://www.seek.com.au/product-analyst-jobs/in-Sydney-NSW-2000" },
    { title: "ML Engineer", company: "Afterpay", salary: "AUD $110,000–$145,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://www.seek.com.au/machine-learning-jobs/in-Sydney-NSW-2000" },
  ],
  "London": [
    { title: "Data Analyst", company: "HSBC", salary: "£45,000–£65,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://uk.indeed.com/jobs?q=data+analyst&l=London" },
    { title: "Product Manager", company: "Monzo", salary: "£70,000–£100,000/yr", level: "Mid", type: "Full-time", link: "https://uk.indeed.com/jobs?q=product+manager&l=London" },
    { title: "Software Engineer", company: "DeepMind", salary: "£80,000–£130,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://uk.indeed.com/jobs?q=software+engineer&l=London" },
    { title: "UX Researcher", company: "Deliveroo", salary: "£50,000–£75,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://uk.indeed.com/jobs?q=ux+researcher&l=London" },
  ],
  "Boston / Cambridge": [
    { title: "Data Scientist", company: "HubSpot", salary: "$110,000–$150,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=data+scientist&l=Boston%2C+MA" },
    { title: "Product Manager", company: "Wayfair", salary: "$100,000–$140,000/yr", level: "Mid", type: "Full-time", link: "https://www.indeed.com/jobs?q=product+manager&l=Boston%2C+MA" },
    { title: "Software Engineer", company: "Akamai Technologies", salary: "$120,000–$160,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://www.indeed.com/jobs?q=software+engineer&l=Boston%2C+MA" },
    { title: "ML Researcher", company: "MIT CSAIL / Startups", salary: "$100,000–$180,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://www.indeed.com/jobs?q=machine+learning&l=Cambridge%2C+MA" },
  ],
  "Toronto": [
    { title: "Data Analyst", company: "Shopify", salary: "CAD $70,000–$90,000/yr", level: "Entry", type: "Full-time", link: "https://ca.indeed.com/jobs?q=data+analyst&l=Toronto%2C+ON" },
    { title: "Product Manager", company: "RBC", salary: "CAD $90,000–$120,000/yr", level: "Mid", type: "Full-time", link: "https://ca.indeed.com/jobs?q=product+manager&l=Toronto%2C+ON" },
    { title: "ML Engineer", company: "Vector Institute", salary: "CAD $100,000–$140,000/yr", level: "Mid–Senior", type: "Full-time", link: "https://ca.indeed.com/jobs?q=machine+learning&l=Toronto%2C+ON" },
    { title: "UX Designer", company: "Wealthsimple", salary: "CAD $75,000–$100,000/yr", level: "Entry–Mid", type: "Full-time", link: "https://ca.indeed.com/jobs?q=ux+designer&l=Toronto%2C+ON" },
  ],
};

function getDefaultJobs(city: string): AtlasJob[] {
  return [
    { title: "Data Analyst", company: "Top companies in " + city, salary: "Competitive", level: "Entry–Mid", type: "Full-time", link: `https://www.indeed.com/jobs?q=data+analyst&l=${encodeURIComponent(city)}` },
    { title: "Product Manager", company: "Tech companies in " + city, salary: "Competitive", level: "Mid", type: "Full-time", link: `https://www.indeed.com/jobs?q=product+manager&l=${encodeURIComponent(city)}` },
    { title: "Software Engineer", company: "Engineering firms in " + city, salary: "Competitive", level: "Entry–Mid", type: "Full-time", link: `https://www.indeed.com/jobs?q=software+engineer&l=${encodeURIComponent(city)}` },
  ];
}

function detectLocations(profile: UserProfile): LocationMatch[] {
  const textToSearch = `${profile.education} ${profile.experience} ${profile.locationPreference}`.toLowerCase();
  const found = new Map<string, LocationMatch>();

  for (const [keyword, location] of Object.entries(institutionLocationMap)) {
    if (textToSearch.includes(keyword)) {
      if (!found.has(location.city)) {
        const reason = profile.education.toLowerCase().includes(keyword)
          ? `Based on your studies — ${keyword.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`
          : `Based on your work experience in the ${location.city} area`;

        const jobs = jobsByLocation[location.city] || getDefaultJobs(location.city);

        found.set(location.city, {
          ...location,
          reason,
          jobs,
        });
      }
    }
  }

  if (profile.locationPreference) {
    const pref = profile.locationPreference.toLowerCase();
    const cityMatches: Record<string, { city: string; country: string; countryEmoji: string; region: string }> = {
      "kuala lumpur": { city: "Kuala Lumpur", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
      "kl": { city: "Kuala Lumpur", country: "Malaysia", countryEmoji: "🇲🇾", region: "Southeast Asia" },
      "singapore": { city: "Singapore", country: "Singapore", countryEmoji: "🇸🇬", region: "Southeast Asia" },
      "sydney": { city: "Sydney", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
      "melbourne": { city: "Melbourne", country: "Australia", countryEmoji: "🇦🇺", region: "Asia-Pacific" },
      "london": { city: "London", country: "United Kingdom", countryEmoji: "🇬🇧", region: "Europe" },
      "san francisco": { city: "San Francisco Bay Area", country: "United States", countryEmoji: "🇺🇸", region: "North America" },
      "toronto": { city: "Toronto", country: "Canada", countryEmoji: "🇨🇦", region: "North America" },
    };

    for (const [key, loc] of Object.entries(cityMatches)) {
      if (pref.includes(key) && !found.has(loc.city)) {
        found.set(loc.city, {
          ...loc,
          reason: `Your preferred location`,
          jobs: jobsByLocation[loc.city] || getDefaultJobs(loc.city),
        });
      }
    }
  }

  return Array.from(found.values()).slice(0, 3);
}

export function CareerAtlas({ profile }: { profile: UserProfile }) {
  const locations = detectLocations(profile);

  if (locations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Global Career Atlas</h2>
          <p className="text-sm text-navy-500 mt-1">
            Jobs suggested based on where you studied and worked
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-navy-500 text-sm">
            <MapPin className="w-8 h-8 text-navy-300 mx-auto mb-3" />
            Add your university or past work locations to your profile to see location-specific job suggestions.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Global Career Atlas</h2>
        <p className="text-sm text-navy-500 mt-1">
          Opportunities near where you studied and worked — your network is already here
        </p>
      </div>

      <div className="space-y-6">
        {locations.map((loc, idx) => (
          <motion.div
            key={loc.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{loc.countryEmoji}</span>
              <div>
                <h3 className="font-bold text-navy-900 text-base">{loc.city}</h3>
                <p className="text-xs text-navy-500">{loc.country} · {loc.region} · {loc.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loc.jobs.map((job, i) => (
                <motion.a
                  key={i}
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 + i * 0.05 }}
                  className="group block"
                >
                  <Card className="card-hover h-full group-hover:shadow-md transition-all">
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-navy-900 text-sm truncate">{job.title}</h4>
                          <p className="text-xs text-navy-500 mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {job.company}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-navy-300 group-hover:text-navy-600 transition-colors shrink-0 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <DollarSign className="w-2.5 h-2.5" />
                          {job.salary}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {job.level}
                        </Badge>
                        <span className="text-[10px] text-navy-400">{job.type}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>

            <div className="mt-2 text-right">
              <a
                href={`https://www.jobstreet.com.${loc.country === "Malaysia" ? "my" : loc.country === "Australia" ? "com.au" : "com"}/en/job-search/?location=${encodeURIComponent(loc.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-navy-500 hover:text-navy-700 underline"
              >
                See all jobs in {loc.city} on JobStreet →
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
