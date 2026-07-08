"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, PhoneCall } from "lucide-react";

interface PricingTier {
  name: string;
  batchSize: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    batchSize: "Up to 200 students",
    description: "For single-branch coaching centers getting started with AI exams.",
    features: [
      "AI-generated question banks",
      "Basic proctoring (tab-switch alerts)",
      "Standard result dashboards",
      "Email support",
    ],
    cta: "Request Live Demo",
  },
  {
    name: "Growth",
    batchSize: "Up to 2,000 students",
    description: "For multi-batch institutes that need branding and automation.",
    features: [
      "Everything in Starter",
      "Full white-label portal & branding",
      "AI proctoring & anti-cheat engine",
      "Automated WhatsApp report cards",
      "Weakness analytics for teachers",
    ],
    cta: "Request Live Demo",
    featured: true,
  },
  {
    name: "Enterprise",
    batchSize: "Unlimited students, multi-campus",
    description: "For school groups and large institutes with offline + online needs.",
    features: [
      "Everything in Growth",
      "One-click OMR & print-ready PDFs",
      "Multi-campus admin controls",
      "Dedicated onboarding & support",
      "Custom integrations & SLA",
    ],
    cta: "Talk to Sales",
  },
];

export function InstitutionPricing() {
  return (
    <section id="pricing" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            For schools & coaching institutes
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Plans built around your batch size
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Every plan includes the core AI exam engine. Book a live demo and
            we&apos;ll tailor a quote to your institute&apos;s scale.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`relative flex flex-col rounded-2xl border p-7 backdrop-blur-md ${
                tier.featured
                  ? "card-glow border-cyan-500/50 bg-slate-900/70"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-1 text-sm font-medium text-cyan-400">
                {tier.batchSize}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {tier.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact-sales"
                className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  tier.featured
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)]"
                    : "border border-slate-700 bg-white/5 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          id="contact-sales"
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-8 py-8 text-center backdrop-blur-md sm:flex-row sm:text-left"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <PhoneCall className="h-6 w-6 text-cyan-400" />
          </span>
          <div className="flex-1">
            <p className="text-base font-semibold text-white">
              Not sure which plan fits your institute?
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Talk to our team for a walkthrough tailored to your batch size and workflow.
            </p>
          </div>
          <a
            href="mailto:sales@testpulse.ai"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400"
          >
            Request Live Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
