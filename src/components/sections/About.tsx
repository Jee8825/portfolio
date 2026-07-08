import { Section } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { about } from "@/data/portfolio";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Building AI that can be trusted">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="text-base leading-relaxed text-muted sm:text-lg">{p}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 self-start">
          {about.stats.map((s, i) => (
            <Reveal key={s.label} delay={0.1 + i * 0.08}>
              <div className="card-hover glass h-full rounded-2xl p-5 hover:border-border-strong">
                <div className="bg-gradient-to-br from-text to-muted bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm leading-snug text-faint">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
