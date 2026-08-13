import { Award, GraduationCap, Sparkles } from "lucide-react";
import { achievements, education, profile } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        index="01"
        label="About"
        title={
          <>
            Five years turning product requirements into{" "}
            <span className="text-gradient">systems that hold up</span> in
            production.
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5 text-[15px] leading-[1.75] text-muted">
          <Reveal>
            <p>{profile.summary}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <p>{profile.summary2}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="border-l-2 border-accent/60 pl-4 text-fg/90">
              What I care about: APIs that stay legible as they grow, interfaces
              that feel fast on ordinary hardware, and AI features that are
              measured against real outcomes rather than demos.
            </p>
          </Reveal>
        </div>

        <div className="space-y-4">
          <Stagger className="space-y-4">
            <StaggerItem>
              <div className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium">
                  <Award size={15} className="text-accent-3" />
                  Recognition
                </div>
                <ul className="space-y-3">
                  {achievements.map((a) => (
                    <li key={a.title}>
                      <div className="text-[13.5px] font-medium">{a.title}</div>
                      <div className="mt-0.5 text-[12.5px] leading-snug text-muted">
                        {a.detail}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium">
                  <GraduationCap size={15} className="text-accent-2" />
                  Education &amp; certifications
                </div>
                <ul className="space-y-3">
                  {education.map((e) => (
                    <li key={e.title}>
                      <div className="text-[13.5px] font-medium leading-snug">
                        {e.title}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-muted">{e.org}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass flex items-start gap-3 rounded-2xl p-5">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Currently deepening work on RAG evaluation, agentic tool use,
                  and cost-aware LLM architecture.
                </p>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
