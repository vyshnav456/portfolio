"use client";

import { Check } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal3D, TiltCard } from "@/components/motion-primitives";

const accentClass: Record<Project["accent"], string> = {
  violet: "text-accent",
  cyan: "text-accent-2",
  amber: "text-accent-3",
  emerald: "text-accent-4",
};

const glowClass: Record<Project["accent"], string> = {
  violet: "from-accent/25",
  cyan: "from-accent-2/25",
  amber: "from-accent-3/25",
  emerald: "from-accent-4/25",
};

export function Projects() {
  return (
    <section
      id="projects"
      className="mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-32"
    >
      <SectionHeading
        index="03"
        label="Projects"
        title="Selected work."
      >
        Platforms I designed, built, or led — spanning AI-enabled document
        pipelines, multi-tenant enterprise systems, and the automation that
        keeps them shipping.
      </SectionHeading>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal3D
            key={p.title}
            delay={i * 0.06}
            axis="y"
            origin={i % 2 ? "right" : "left"}
          >
            <TiltCard
              max={4}
              className={`group relative h-full overflow-hidden rounded-3xl border border-line bg-elev/40 p-6 backdrop-blur-sm transition-colors duration-500 hover:border-fg/15 sm:p-7 ${
                i === 0 ? "ring-conic" : ""
              }`}
            >
              {/* corner glow */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${glowClass[p.accent]} to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="max-w-[85%] text-[17px] font-semibold leading-snug tracking-tight sm:text-lg">
                  {p.title}
                </h3>
                <span
                  className={`font-mono text-[11px] tabular-nums ${accentClass[p.accent]}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <p className="text-[13.5px] leading-relaxed text-muted">{p.blurb}</p>

              <ul className="mt-5 space-y-2">
                {p.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-[12.5px] leading-snug text-muted"
                  >
                    <Check
                      size={12}
                      className={`mt-[3px] shrink-0 ${accentClass[p.accent]}`}
                    />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-5">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-fg/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </TiltCard>
          </Reveal3D>
        ))}
      </div>
    </section>
  );
}
