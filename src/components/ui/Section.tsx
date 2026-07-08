import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/** Standard section shell: consistent spacing + heading treatment. */
export function Section({ id, eyebrow, title, subtitle, children, className }: SectionProps) {
  return (
    <section id={id} className={`relative scroll-mt-24 py-24 sm:py-28 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mb-14 max-w-2xl">
            {eyebrow && (
              <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-2">
                <span className="h-px w-8 bg-gradient-to-r from-accent to-accent-2" />
                {eyebrow}
              </div>
            )}
            <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {title}
            </h2>
            {subtitle && <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
