"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Layers,
  Target,
  BarChart3,
  Compass,
  Users,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  GitBranch,
  TrendingUp,
  Briefcase,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThreadVisual } from "@/components/thread-visual";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none hidden lg:block">
          <ThreadVisual variant="hero" className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-navy-700 font-medium">
                Career OS Hackathon 2025
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-navy-900 mb-4"
            >
              <span className="gradient-text">Tenun</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl font-semibold text-navy-700 mb-4"
            >
              The Career Weaving OS
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-navy-500 mb-8 max-w-2xl leading-relaxed"
            >
              Weave your skills, experience, goals, and opportunities into
              realistic career pathways. Compare paths, understand trade-offs,
              identify skill gaps, and discover your next move.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/profile">
                <Button size="xl" className="w-full sm:w-auto group">
                  Start Career Weave
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard?demo=true">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto group"
                >
                  <Play className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Abstract thread decoration - mobile */}
        <div className="lg:hidden mt-10 px-4">
          <ThreadVisual variant="small" className="w-full h-16 opacity-40" />
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 md:py-24 bg-beige-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4"
            >
              Careers are not ladders. They are woven patterns.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-navy-500 leading-relaxed"
            >
              Traditional career advice assumes a straight path. But real
              careers are complex — shaped by skills, interests, market shifts,
              personal values, and timing. Without clarity, talented people
              end up lost, stuck, or chasing the wrong goals.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Compass,
                title: "No clear direction",
                description:
                  "Graduates face 100+ career options with no structured way to compare them.",
              },
              {
                icon: GitBranch,
                title: "Hidden trade-offs",
                description:
                  "Every career choice involves trade-offs between salary, growth, lifestyle, and meaning — but these aren't visible.",
              },
              {
                icon: Target,
                title: "Skill-opportunity gap",
                description:
                  "People don't know which skills unlock which opportunities, leading to wasted effort and missed chances.",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2}>
                <Card className="card-hover h-full border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-navy-700" />
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-2 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-navy-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4"
            >
              How Tenun Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-navy-500"
            >
              Three steps to go from confusion to clarity.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                icon: Layers,
                title: "Enter your profile",
                description:
                  "Share your skills, experience, education, interests, and preferences. Paste your resume or fill in the form — Tenun extracts your career threads automatically.",
              },
              {
                step: "02",
                icon: Map,
                title: "Explore pathways",
                description:
                  "Tenun generates multiple realistic career pathways tailored to your profile — each with timelines, trade-offs, skills needed, and concrete next steps.",
              },
              {
                step: "03",
                icon: Briefcase,
                title: "Match & act",
                description:
                  "Discover matching jobs, internships, courses, projects, mentors, and portfolio challenges. See your skill gaps and get an actionable growth plan.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i + 2}
                className="relative"
              >
                <div className="text-6xl font-bold text-navy-100 mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-2 text-xl">
                  {item.title}
                </h3>
                <p className="text-navy-500 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Key Features
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-navy-300"
            >
              Everything you need to make informed career decisions.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Layers,
                title: "Career Thread Map",
                description:
                  "See your profile broken down into 8 career threads — skills, experience, education, interests, market demand, salary, lifestyle, and employer fit.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: GitBranch,
                title: "Pathway Simulator",
                description:
                  "Compare 5 distinct career pathways side by side — each with timelines, roles, trade-offs, risks, and next actions.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: BarChart3,
                title: "Visual Comparisons",
                description:
                  "Radar charts and bar graphs let you compare pathways across multiple dimensions at a glance.",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Target,
                title: "Skill Gap Analysis",
                description:
                  "Identify exactly which skills you need to develop, with priority levels and recommended resources.",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: Briefcase,
                title: "Opportunity Marketplace",
                description:
                  "Matching jobs, internships, courses, projects, mentors, and portfolio challenges — ranked by fit.",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Reasoning",
                description:
                  "Intelligent analysis explains why each pathway fits — using careful, non-deterministic language that respects your agency.",
                color: "from-amber-500 to-amber-600",
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2}>
                <Card className="card-hover h-full bg-navy-800 border-navy-700">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-navy-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4"
            >
              Why Tenun Is Different
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-navy-500"
            >
              We are not a job board. We are not a quiz. We are a career
              decision-support platform.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Globe,
                title: "Multi-pathway, not single-answer",
                description:
                  "We show you five different pathways instead of one prediction. Real careers have options.",
              },
              {
                icon: Shield,
                title: "Honest about trade-offs",
                description:
                  "Every pathway comes with trade-offs, risks, and timeline estimates. No false promises.",
              },
              {
                icon: TrendingUp,
                title: "Actionable next steps",
                description:
                  "Every pathway includes three concrete actions you can take this week — not vague advice.",
              },
              {
                icon: Users,
                title: "Respects your agency",
                description:
                  "We use language like 'appears suitable' not 'you will become'. Your future is yours to shape.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i + 2}
                className="flex gap-4 p-6 rounded-xl border border-navy-100 card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-navy-800 to-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ThreadVisual variant="background" className="w-full h-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Ready to weave your career?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-navy-300 mb-8"
            >
              Start with your profile. Tenun will do the rest.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/profile">
                <Button size="xl" variant="secondary" className="w-full sm:w-auto group">
                  Start Career Weave
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard?demo=true">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto border-navy-500 text-white hover:bg-navy-700 hover:text-white"
                >
                  <Play className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
