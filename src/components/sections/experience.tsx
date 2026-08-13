import { Building2 } from "lucide-react";
import { experience } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal3D, Stagger, StaggerItem } from "@/components/motion-primitives";

export function Experience() {
  return (
    <section id="work" className="mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        index="02"
        label="Experience"
        title="Where I've been building."
      >
        Shipping enterprise MERN products at Infinite Open Source Solutions —
        first as a developer, now leading the technical direction of a
        nine-person team.
      </SectionHeading>

      <div className="relative">
        {/* rail */}
        <div
          aria-hidden
          className="absolute left-[7px] top-2 hidden h-full w-px bg-gradient-to-b from-accent/60 via-line to-transparent sm:block"
        />

        <div className="space-y-14">
          {experience.map((job, i) => (
            <div key={job.role + job.period} className="relative sm:pl-10">
              {/* node */}
              <span
                aria-hidden
                className={`absolute left-0 top-2 hidden h-[15px] w-[15px] items-center justify-center rounded-full border sm:flex ${
                  job.current
                    ? "border-accent/60 bg-accent/20"
                    : "border-line bg-elev"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    job.current ? "bg-accent" : "bg-faint"
                  }`}
                />
              </span>

              <Reveal3D axis="y" origin="left" angle={12}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {job.role}
                    {job.current && (
                      <span className="ml-2.5 align-middle rounded-full border border-accent-4/40 bg-accent-4/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-4">
                        Current
                      </span>
                    )}
                  </h3>
                  <span className="font-mono text-[12px] text-faint">
                    {job.period}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-muted">
                  <Building2 size={13} className="shrink-0" />
                  {job.company}
                  <span className="text-faint">· {job.location}</span>
                </div>
              </Reveal3D>

              <Stagger className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2" gap={0.05}>
                {job.points.map((p) => (
                  <StaggerItem key={p}>
                    <div className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                      <span
                        aria-hidden
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/70"
                      />
                      <span>{p}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              {i < experience.length - 1 && (
                <div className="mt-14 h-px bg-line sm:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
