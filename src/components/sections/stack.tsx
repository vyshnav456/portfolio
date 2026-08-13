import { skills } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal3D } from "@/components/motion-primitives";

const marqueeItems = [
  "React.js",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express.js",
  "MongoDB",
  "PostgreSQL",
  "GraphQL",
  "Redis",
  "Docker",
  "AWS",
  "RAG",
  "Embeddings",
  "Vector Search",
  "LangChain",
  "Tailwind CSS",
  "WebSocket",
  "CI/CD",
];

export function Stack() {
  return (
    <section id="stack" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <SectionHeading index="05" label="Stack" title="Tools of the trade.">
          The stack I reach for day to day, grouped by where it sits in the
          system.
        </SectionHeading>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal3D key={group.group} delay={i * 0.05} angle={18}>
              <div className="glass h-full rounded-2xl p-5">
                <h3 className="mono-label mb-3.5">{group.group}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-line bg-fg/[0.03] px-2.5 py-1 text-[12px] text-muted transition-colors hover:border-accent/40 hover:text-fg"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal3D>
          ))}
        </div>
      </div>

      {/* edge-to-edge marquee */}
      <div
        aria-hidden
        className="relative mt-16 flex overflow-hidden border-y border-line py-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={item + i}
              className="whitespace-nowrap font-mono text-[13px] text-faint"
            >
              {item}
              <span className="ml-10 text-accent/40">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
