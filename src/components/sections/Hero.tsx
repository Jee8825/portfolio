"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { profile, socials } from "@/data/portfolio";
import { SocialIcon } from "../ui/SocialIcon";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh items-center pt-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Left: copy */}
        <motion.div variants={container} initial="hidden" animate="show">
          {profile.available && (
            <motion.div
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {profile.availabilityText}
            </motion.div>
          )}

          <motion.p
            variants={item}
            className="mb-4 font-mono text-sm text-accent-2"
          >
            {profile.degree}
          </motion.p>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Hi, I&apos;m <span className="text-gradient">{profile.name}</span>.
            <br className="hidden sm:block" /> {profile.headline}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            {profile.subheadline}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
            >
              View my work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface/50 px-5 py-3 text-sm font-semibold text-text backdrop-blur transition-colors hover:border-accent hover:text-accent-2"
            >
              Get in touch
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="text-muted transition-colors hover:text-accent-2"
              >
                <SocialIcon icon={s.icon} />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: decorative "memory engine" terminal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <div className="animate-float glass glow-ring rounded-2xl p-1">
            <div className="rounded-xl bg-bg-soft/80 p-5">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                <span className="ml-3 font-mono text-xs text-faint">recall · memory.py</span>
              </div>
              <pre className="overflow-x-auto font-mono text-[12.5px] leading-relaxed">
                <code>
                  <span className="text-accent-3">class</span>{" "}
                  <span className="text-accent-2">MemoryEngine</span>:
                  {"\n"}    tiers = [<span className="text-emerald-300">&quot;short&quot;</span>,{" "}
                  <span className="text-emerald-300">&quot;working&quot;</span>,{" "}
                  <span className="text-emerald-300">&quot;long&quot;</span>]
                  {"\n"}
                  {"\n"}    <span className="text-accent-3">def</span>{" "}
                  <span className="text-accent-2">recall</span>(self, q):
                  {"\n"}        m = self.<span className="text-accent">graph</span>.search(q)
                  {"\n"}        m.<span className="text-accent">confidence</span> *= decay(m.age)
                  {"\n"}        <span className="text-accent-3">if</span> conflict(m):
                  {"\n"}            <span className="text-accent-3">return</span> resolve(m)
                  {"\n"}        <span className="text-accent-3">return</span> m{"  "}
                  <span className="text-faint"># provenance-tracked</span>
                </code>
              </pre>
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2">
                <Sparkles className="h-4 w-4 text-accent-2" />
                <span className="font-mono text-xs text-muted">
                  confidence <span className="text-emerald-300">0.94</span> · decay active · 0 conflicts
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
