"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, Download, Mail, MapPin } from "lucide-react";
import { profile, stats } from "@/lib/data";
import { Counter, Magnetic, TiltCard } from "@/components/motion-primitives";

// WebGL is browser-only and shouldn't block first paint — the hero renders
// fully without it and the canvas fades in once loaded.
const HeroCanvas = dynamic(() => import("@/components/three/hero-canvas"), {
  ssr: false,
});

const words = profile.name.split(" ");

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col justify-center px-5 pb-20 pt-32 sm:px-6"
    >
      <HeroCanvas />

      {/* availability chip */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-7 flex"
      >
        <span className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-4 text-[12.5px] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-4" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-4" />
          </span>
          Open to full stack &amp; AI engineering roles
        </span>
      </motion.div>

      {/* name */}
      <h1 className="text-[clamp(2.75rem,9vw,6.25rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
        {words.map((word, i) => (
          <span key={word + i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.06em]">
            <motion.span
              className="inline-block text-gradient"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.08 + i * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h1>

      {/* role line */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-base sm:text-lg"
      >
        <span className="font-medium">{profile.role}</span>
        {/* hidden when the line wraps, so the dot never dangles */}
        <span className="hidden h-1 w-1 rounded-full bg-faint sm:block" />
        <span className="font-mono text-[13px] text-accent-2 sm:text-sm">
          {profile.tagline}
        </span>
      </motion.div>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted"
      >
        I build and scale enterprise web applications end to end — and bring
        LLM-powered retrieval, structured extraction, and agentic workflows into
        products that people actually use in production.
      </motion.p>

      {/* actions */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9 flex flex-wrap items-center gap-3"
      >
        <Magnetic>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Mail size={15} />
            Get in touch
          </a>
        </Magnetic>
        <Magnetic>
          <a
            href={profile.resume}
            download
            className="inline-flex items-center gap-2 rounded-full border border-line bg-elev/50 px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Download size={15} />
            Download résumé
          </a>
        </Magnetic>
        <span className="ml-1 inline-flex items-center gap-1.5 text-[13px] text-faint">
          <MapPin size={13} />
          {profile.location}
        </span>
      </motion.div>

      {/* stat tiles */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <TiltCard
            key={s.label}
            max={5}
            className="glass rounded-2xl p-4 sm:p-5"
          >
            <div className="font-mono text-[clamp(1.4rem,3.2vw,2rem)] font-medium tracking-tight text-fg">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-1.5 text-[12.5px] leading-snug text-muted">
              {s.label}
            </div>
          </TiltCard>
        ))}
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to about"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint transition-colors hover:text-fg lg:block"
      >
        <motion.span
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ArrowDown size={16} />
        </motion.span>
      </motion.a>
    </section>
  );
}
