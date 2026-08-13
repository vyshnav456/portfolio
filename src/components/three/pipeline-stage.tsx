"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

// WebGL is browser-only and shouldn't block first paint — the captions read
// on their own and the canvas fades in once loaded.
const DevOpsCanvas = dynamic(() => import("./devops-canvas"), { ssr: false });

/** Each caption owns a slice of the scroll, matched to the scene's formations. */
const STAGES = [
  {
    index: "01",
    label: "Containers",
    title: "Built once, promoted everywhere.",
    body: "Services ship as images and move through environments unchanged — Dockerised deployments that behave the same in dev, staging, and production.",
    // in almost immediately — the section shouldn't pin on an unlabelled scene
    window: [0, 0.02, 0.24, 0.32],
  },
  {
    index: "02",
    label: "Service mesh",
    title: "Then they find each other.",
    body: "Internal APIs, queues, retries, and health checks resolve into one topology — the part that decides whether 99.9% availability is a claim or a habit.",
    window: [0.32, 0.42, 0.6, 0.68],
  },
  {
    index: "03",
    label: "Delivery",
    title: "Every commit takes the same road.",
    body: "Build, test, and release gates run without hand-holding. Automated provisioning cut environment setup from 90 seconds to 15, and 10+ engineering hours a week with it.",
    // ends before the track does — a duplicate keyframe at 1 would pop the
    // caption out rather than fade it
    window: [0.68, 0.78, 0.93, 1],
  },
] as const;

function Caption({
  stage,
  scroll,
}: {
  stage: (typeof STAGES)[number];
  scroll: MotionValue<number>;
}) {
  const [a, b, c, d] = stage.window;
  const opacity = useTransform(scroll, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(scroll, [a, b, c, d], [26, 0, 0, -26]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-14 mx-auto max-w-5xl px-5 sm:bottom-16 sm:px-6"
    >
      <div className="max-w-md">
        <span className="mono-label">
          {stage.index} / {stage.label}
        </span>
        <h3 className="mt-3 text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
          {stage.title}
        </h3>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
          {stage.body}
        </p>
      </div>
    </motion.div>
  );
}

/** Three dots down the left gutter, marking which formation is on screen. */
function Rail({ scroll }: { scroll: MotionValue<number> }) {
  return (
    <div
      className="absolute top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
      style={{ left: "max(1.5rem, calc(50% - 34rem))" }}
    >
      {STAGES.map((stage) => (
        <RailDot key={stage.index} scroll={scroll} window={stage.window} />
      ))}
    </div>
  );
}

function RailDot({
  scroll,
  window: range,
}: {
  scroll: MotionValue<number>;
  window: readonly number[];
}) {
  const opacity = useTransform(scroll, [...range], [0.22, 1, 1, 0.22]);
  const scale = useTransform(scroll, [...range], [1, 1.7, 1.7, 1]);
  return (
    <motion.span
      style={{ opacity, scale }}
      className="block h-1.5 w-1.5 rounded-full bg-accent"
    />
  );
}

export function PipelineStage() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // The pinned layer only unsticks once scrollYProgress has already saturated,
  // so the exit rides a second range covering that last screen of travel — the
  // scene dissolves on its way out instead of sliding up under the nav.
  const { scrollYProgress: release } = useScroll({
    target: track,
    offset: ["end end", "end start"],
  });
  const exit = useTransform(release, [0, 0.55], [1, 0]);

  return (
    <div ref={track} className="relative h-[300svh]">
      <motion.div style={{ opacity: exit }} className="absolute inset-0">
        <DevOpsCanvas />
      </motion.div>

      {/* pinned overlay — the scene keeps the middle, the copy takes the base */}
      <motion.div
        style={{ opacity: exit }}
        className="pointer-events-none sticky top-0 h-[100svh]"
      >
        {/* scrim, so the captions never have to compete with the wireframes */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-bg via-bg/92 to-transparent"
        />
        <Rail scroll={scrollYProgress} />
        {STAGES.map((stage) => (
          <Caption key={stage.index} stage={stage} scroll={scrollYProgress} />
        ))}
      </motion.div>
    </div>
  );
}
