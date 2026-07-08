import { ArrowUpRight, Mail } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { profile, socials } from "@/data/portfolio";
import { SocialIcon } from "../ui/SocialIcon";

export function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(600px circle at 50% 0%, rgba(124,115,255,0.18), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-2">
                Contact
              </div>
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Let&apos;s build something that <span className="text-gradient">remembers</span>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
                I&apos;m open to AI / ML engineering roles, internships, and collaborations. The
                fastest way to reach me is email.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
                >
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </a>
                <a
                  href={profile.resumeUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface/50 px-6 py-3 text-sm font-semibold text-text backdrop-blur transition-colors hover:border-accent hover:text-accent-2"
                >
                  Download résumé
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="text-muted transition-colors hover:text-accent-2"
                  >
                    <SocialIcon icon={s.icon} className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
