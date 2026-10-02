"use client";

import { useMemo, useRef } from "react";
import type { Chapter } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";

const CW = 214; // column width
const RH = 118; // row height
const NW = 184; // node width
const NH = 64; // node height
const FS = 17; // node label size
const FSS = 12.5; // sub-label size (mono)

type Arch = Chapter["architecture"];

/** Architecture as a live circuit: edges draw in on scroll, packets flow along them. */
export function ArchDiagram({ arch, id }: { arch: Arch; id: string }) {
  const root = useRef<HTMLDivElement>(null);
  const digital = useUI((s) => s.world) === "digital";

  const layout = useMemo(() => {
    const cols = Math.max(...arch.nodes.map((n) => n.col)) + 1;
    const rows = Math.max(...arch.nodes.map((n) => n.row)) + 1;
    const pos = new Map(arch.nodes.map((n) => [n.id, { x: n.col * CW + 8, y: n.row * RH + 8, n }]));
    const edges = arch.edges.map(([a, b, label], i) => {
      const A = pos.get(a)!,
        B = pos.get(b)!;
      let d: string;
      let mid: { x: number; y: number };
      const cxA = A.x + NW / 2,
        cxB = B.x + NW / 2;
      if (A.n.col === B.n.col) {
        // vertical hop
        const y1 = B.y > A.y ? A.y + NH : A.y;
        const y2 = B.y > A.y ? B.y : B.y + NH;
        d = `M ${cxA} ${y1} L ${cxA} ${y2}`;
        mid = { x: cxA + 8, y: (y1 + y2) / 2 + 4 };
      } else if (B.x > A.x && A.n.row === B.n.row) {
        const x1 = A.x + NW, y1 = A.y + NH / 2, x2 = B.x, y2 = B.y + NH / 2;
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
        mid = { x: (x1 + x2) / 2, y: y1 - 9 };
      } else if (B.x > A.x) {
        const x1 = A.x + NW, y1 = A.y + NH / 2, x2 = B.x, y2 = B.y + NH / 2;
        const k = (x2 - x1) * 0.6;
        d = `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
        mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 9 };
      } else if (B.n.row > A.n.row) {
        // back and down: leave from the bottom, arrive on top
        const y1 = A.y + NH, y2 = B.y;
        const k = (y2 - y1) * 0.6;
        d = `M ${cxA} ${y1} C ${cxA} ${y1 + k}, ${cxB} ${y2 - k}, ${cxB} ${y2}`;
        mid = { x: (cxA + cxB) / 2, y: (y1 + y2) / 2 };
      } else if (B.n.row < A.n.row) {
        // back and up: leave from the top, arrive underneath
        const y1 = A.y, y2 = B.y + NH;
        const k = (y1 - y2) * 0.6;
        d = `M ${cxA} ${y1} C ${cxA} ${y1 - k}, ${cxB} ${y2 + k}, ${cxB} ${y2}`;
        mid = { x: (cxA + cxB) / 2, y: (y1 + y2) / 2 };
      } else {
        // same row, backwards: a feedback loop underneath
        const y1 = A.y + NH, y2 = B.y + NH;
        const dip = y1 + 40;
        d = `M ${cxA} ${y1} C ${cxA} ${dip}, ${cxB} ${dip}, ${cxB} ${y2}`;
        mid = { x: (cxA + cxB) / 2, y: dip - 2 };
      }
      return { d, label, mid, i, tier: B.n.tier };
    });
    return { w: cols * CW, h: rows * RH + 30, pos, edges };
  }, [arch]);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>(".js-edge");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%" } });
      tl.from(".js-node", { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%", stagger: 0.06, duration: 0.5, ease: "back.out(2)" })
        .to(paths, { strokeDashoffset: 0, duration: 0.7, stagger: 0.07, ease: "power2.inOut" }, 0.2)
        .from(".js-elabel, .js-packet", { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, ">-0.2");
    },
    { scope: root },
  );

  const ink = (t: number) => `var(--t${t})`;
  /* SVG text doesn't wrap: squeeze a label that would overflow its node */
  const fit = (text: string, size: number, em: number) =>
    text.length * size * em > NW - 26 ? { textLength: NW - 26, lengthAdjust: "spacingAndGlyphs" as const } : {};
  return (
    <div ref={root} className="panel p-4 sm:p-6" style={{ ["--panel-accent" as string]: "var(--t2)" }}>
      <div className="label mb-4 flex justify-between text-ink-3">
        <span>{digital ? "SYS.ARCH" : "Fig. — architecture"}</span>
        <span>{arch.nodes.length} nodes · {arch.edges.length} links</span>
      </div>

      {/* wide screens: the live circuit */}
      <svg
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        className="hidden w-full sm:block"
        role="img"
        aria-label={`Architecture: ${arch.nodes.map((n) => n.label).join(", ")}`}
      >
        <defs>
          <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-3)" />
          </marker>
        </defs>
        {layout.edges.map((e) => (
          <g key={e.i}>
            <path
              id={`e-${id}-${e.i}`}
              className="js-edge"
              d={e.d}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth={1.2}
              markerEnd={`url(#arrow-${id})`}
            />
            <circle className="js-packet" r={digital ? 3 : 3.4} fill={ink(e.tier)}>
              <animateMotion dur={`${2.2 + (e.i % 3) * 0.5}s`} begin={`${(e.i * 0.37) % 2}s`} repeatCount="indefinite">
                <mpath href={`#e-${id}-${e.i}`} />
              </animateMotion>
            </circle>
            {e.label && (
              <text
                className="js-elabel mono"
                x={e.mid.x}
                y={e.mid.y}
                textAnchor="middle"
                fontSize={12.5}
                fill="var(--ink-2)"
                style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4 }}
              >
                {e.label}
              </text>
            )}
          </g>
        ))}
        {[...layout.pos.values()].map(({ x, y, n }) => (
          <g key={n.id} className="js-node">
            <rect
              x={x}
              y={y}
              width={NW}
              height={NH}
              fill="var(--paper)"
              stroke={digital ? "var(--rule-strong)" : "var(--ink)"}
              strokeWidth={digital ? 1 : 1.4}
            />
            <rect x={x} y={y} width={4} height={NH} fill={ink(n.tier)} />
            <text x={x + 16} y={y + 27} fontSize={FS} fill="var(--ink)" fontFamily="var(--font-sans)" fontWeight={600} {...fit(n.label, FS, 0.56)}>
              {n.label}
            </text>
            {n.sub && (
              <text x={x + 16} y={y + 48} fontSize={FSS} fill="var(--ink-3)" className="mono" {...fit(n.sub, FSS, 0.6)}>
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* small screens: the same flow as a readable list */}
      <ol className="space-y-2 sm:hidden">
        {arch.edges.map(([a, b, label], i) => {
          const A = layout.pos.get(a)!.n,
            B = layout.pos.get(b)!.n;
          return (
            <li key={i} className="label flex flex-wrap items-center gap-2 text-ink-2">
              <span className="text-ink">{A.label}</span>
              <span aria-hidden className={`t${B.tier}`}>→</span>
              {label && <span className="text-ink-3">{label} →</span>}
              <span className="text-ink">{B.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
