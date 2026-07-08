import { Section } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { ProjectCard } from "../ui/ProjectCard";
import { projects } from "@/data/portfolio";

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section
      id="projects"
      eyebrow="Selected Work"
      title="Projects"
      subtitle="From a three-tier LLM memory engine to an autonomous multi-agent CFO — systems where memory, reasoning, and trust are the hard part."
    >
      {/* Featured — larger cards, two per row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.1} className={i === 0 ? "lg:col-span-2" : ""}>
            <ProjectCard project={p} featured />
          </Reveal>
        ))}
      </div>

      {/* Secondary — compact grid */}
      {rest.length > 0 && (
        <>
          <Reveal>
            <h3 className="mb-6 mt-16 font-mono text-sm uppercase tracking-[0.2em] text-faint">
              More projects
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
