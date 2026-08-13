import type { ReactNode } from "react";
import { Reveal } from "@/components/motion-primitives";

export function SectionHeading({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-12 sm:mb-16">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="mono-label">
            {index} / {label}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-4 max-w-2xl text-[clamp(1.8rem,4.4vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
          {title}
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={0.12}>
          <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            {children}
          </div>
        </Reveal>
      )}
    </header>
  );
}
