import { Brain, Workflow, Server, Cloud, Database, Terminal } from "lucide-react";
import { Section } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { skillGroups, type SkillGroup } from "@/data/portfolio";

const icons = {
  brain: Brain,
  workflow: Workflow,
  server: Server,
  cloud: Cloud,
  database: Database,
  terminal: Terminal,
} as const;

function GroupCard({ group, delay }: { group: SkillGroup; delay: number }) {
  const Icon = icons[group.icon];
  return (
    <Reveal delay={delay}>
      <div className="card-hover glass group h-full rounded-2xl p-6 hover:-translate-y-1 hover:border-border-strong">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-accent-2 transition-colors group-hover:border-accent group-hover:text-accent">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="text-base font-semibold text-text">{group.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-text"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills & Stack"
      title="The tools I build with"
      subtitle="A working stack spanning agent orchestration, LLM platforms, backend systems, and the data infrastructure that makes memory possible."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <GroupCard key={group.title} group={group} delay={(i % 3) * 0.08} />
        ))}
      </div>
    </Section>
  );
}
