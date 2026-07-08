import { Check, ArrowUpRight, Lock } from "lucide-react";
import type { Project } from "@/data/portfolio";

const accentMap = {
  violet: { text: "text-accent", glow: "rgba(124,115,255,0.5)", ring: "group-hover:border-accent/60" },
  cyan: { text: "text-accent-2", glow: "rgba(34,211,238,0.5)", ring: "group-hover:border-accent-2/60" },
  pink: { text: "text-accent-3", glow: "rgba(244,114,182,0.5)", ring: "group-hover:border-accent-3/60" },
} as const;

const statusStyle: Record<Project["status"], string> = {
  Live: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
  Completed: "border-accent/30 text-accent bg-accent/10",
  "In Progress": "border-amber-400/30 text-amber-300 bg-amber-400/10",
  Hackathon: "border-accent-2/30 text-accent-2 bg-accent-2/10",
};

export function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const accent = accentMap[project.accent ?? "violet"];

  return (
    <article className="card-hover glass group relative h-full overflow-hidden rounded-2xl p-6 hover:-translate-y-1 sm:p-8">
      {/* hover glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(400px circle at 30% 0%, ${accent.glow}, transparent 60%)` }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className={`text-xl font-semibold text-text sm:text-2xl`}>{project.name}</h3>
            <p className={`mt-1 text-sm font-medium ${accent.text}`}>{project.tagline}</p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyle[project.status]}`}
          >
            {project.status}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted">{project.description}</p>

        {featured && (
          <ul className="mt-5 grid gap-2.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-muted">
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent.text}`} strokeWidth={2.5} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 text-xs text-faint">
          <span className="font-mono">role:</span> {project.role}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-surface/60 px-2 py-1 font-mono text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {(project.links?.length || project.status === "Completed") && (
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4">
            {project.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 text-sm font-medium ${accent.text} hover:underline`}
              >
                {l.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
            {!project.links?.length && (
              <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                <Lock className="h-3.5 w-3.5" /> Private — walkthrough available on request
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
