"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ Reveal
   Fades + lifts children into view once, honouring reduced motion.         */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- Reveal3D
   Swings children in on a hinge, in depth — the DOM counterpart to the
   camera moves in the WebGL scenes.                                        */
export function Reveal3D({
  children,
  delay = 0,
  className = "",
  axis = "x",
  angle = 15,
  depth = 90,
  origin,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** "x" hinges from the bottom edge, "y" from a side edge */
  axis?: "x" | "y";
  angle?: number;
  depth?: number;
  /** flips the hinge side — handy for alternating a grid left/right */
  origin?: "left" | "right";
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const hinge =
    axis === "y" ? `${origin === "right" ? "right" : "left"} center` : "center bottom";

  return (
    <div className={className} style={{ perspective: 1200 }}>
      <motion.div
        className="h-full"
        initial={{
          opacity: 0,
          y: 26,
          z: -depth,
          rotateX: axis === "x" ? -angle : 0,
          rotateY: axis === "y" ? (origin === "right" ? -angle : angle) : 0,
        }}
        whileInView={{ opacity: 1, y: 0, z: 0, rotateX: 0, rotateY: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d", transformOrigin: hinge }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------- Stagger */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? {} : { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Magnetic
   Button wrapper that leans toward the cursor.                             */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  if (reduce) return <span className={className}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-block" }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* ----------------------------------------------------------------- Counter
   Counts up to `value` when scrolled into view.                            */
export function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const decimals = Number.isInteger(value) ? 0 : 1;
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let frame = 0;
    const duration = 1400;
    let start: number | null = null;

    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setShown(Number((value * eased).toFixed(decimals)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, decimals, reduce]);

  return (
    <span ref={ref} className={className}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------- TiltCard
   3D tilt + pointer-tracked sheen (the .sheen class reads --mx/--my).      */
export function TiltCard({
  children,
  className = "",
  max = 6,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  max?: number;
} & Omit<ComponentPropsWithoutRef<typeof motion.div>, "children">) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX: MotionValue<number> = useSpring(
    useTransform(py, [0, 1], [max, -max]),
    { stiffness: 200, damping: 20 },
  );
  const rotateY: MotionValue<number> = useSpring(
    useTransform(px, [0, 1], [-max, max]),
    { stiffness: 200, damping: 20 },
  );

  return (
    <motion.div
      ref={ref}
      className={`sheen ${className}`}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
      }
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        px.set(nx);
        py.set(ny);
        el.style.setProperty("--mx", `${nx * 100}%`);
        el.style.setProperty("--my", `${ny * 100}%`);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------- ScrollProgress */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-px bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-accent to-accent-2 transition-transform duration-150"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}
