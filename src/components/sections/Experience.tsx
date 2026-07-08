import { Section } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { experience } from "@/data/portfolio";

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="What I've been doing">
      <div className="relative">
        {/* timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-accent-2/50 to-transparent sm:left-[9px]" />

        <div className="space-y-10">
          {experience.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="relative pl-8 sm:pl-10">
                <span className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full border border-accent bg-bg sm:h-5 sm:w-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />
                </span>

                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                  <span className="font-mono text-xs text-faint">{item.period}</span>
                </div>
                <p className="mt-0.5 text-sm text-accent-2">{item.org}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>

                <ul className="mt-4 space-y-2">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5 text-sm text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border bg-surface/60 px-2 py-1 font-mono text-[11px] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
