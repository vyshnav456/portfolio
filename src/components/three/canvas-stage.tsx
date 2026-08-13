"use client";

import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Shared plumbing for every WebGL scene on the page: feature detection, the
 * theme palette, a scroll-progress signal the scenes drive their cameras from,
 * and a frameloop that stops the moment the stage leaves the viewport.
 */

export type Palette = { a: string; b: string; c: string; d: string };

type Stage = {
  palette: Palette;
  /** 0 → 1 as the stage travels past the top of the viewport. Read in useFrame. */
  progress: RefObject<number>;
  /** false when the visitor asked for reduced motion */
  animate: boolean;
  /** additive glows only read against a dark ground — scenes branch on this */
  dark: boolean;
};

const FALLBACK: Palette = {
  a: "rgb(167,139,250)",
  b: "rgb(34,211,238)",
  c: "rgb(251,191,36)",
  d: "rgb(52,211,153)",
};

const StageContext = createContext<Stage | null>(null);

export function useStage(): Stage {
  const stage = useContext(StageContext);
  if (!stage) throw new Error("useStage() must be called inside <CanvasStage>");
  return stage;
}

/** Reads an `--accent`-style token ("167 139 250") as a CSS rgb() string. */
function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw ? `rgb(${raw.replace(/\s+/g, ",")})` : fallback;
}

function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function CanvasStage({
  scene,
  children,
  className = "",
  layerClassName = "absolute inset-0",
  mask,
  camera = { position: [0, 0, 14], fov: 45 },
  dpr = [1, 1.75],
}: {
  /** the r3f tree */
  scene: ReactNode;
  /** DOM rendered after the canvas layer (the stage doubles as its wrapper) */
  children?: ReactNode;
  className?: string;
  layerClassName?: string;
  mask?: string;
  camera?: { position: [number, number, number]; fov: number };
  dpr?: [number, number];
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();

  // stages are loaded with `ssr: false`, so the browser check is safe to run
  // during the initial render — no effect, no extra pass.
  const [supported] = useState(hasWebGL);
  const [visible, setVisible] = useState(true);
  const [palette, setPalette] = useState<Palette>(FALLBACK);

  // re-read the palette whenever the theme flips
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setPalette({
        a: readToken("--accent", FALLBACK.a),
        b: readToken("--accent-2", FALLBACK.b),
        c: readToken("--accent-3", FALLBACK.c),
        d: readToken("--accent-4", FALLBACK.d),
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  // sample the wrapper's position once per frame while scrolling
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      // tall stages are scroll scenes and map to their pinned range; short
      // ones just report how much of themselves has passed the top edge
      const denom = span > window.innerHeight * 0.25 ? span : rect.height;
      progress.current = Math.min(Math.max(-rect.top / Math.max(denom, 1), 0), 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // stop rendering when scrolled away or the tab is hidden
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    observer.observe(el);

    const onVisibility = () => {
      const rect = el.getBoundingClientRect();
      setVisible(
        !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight,
      );
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // no WebGL — the CSS aurora already carries the page on its own
  if (!supported) return children ?? null;

  return (
    <>
      <div ref={wrapper} aria-hidden className={className}>
        <div
          ref={layer}
          className={`${layerClassName} opacity-0 transition-opacity duration-1000 [&.ready]:opacity-100`}
          style={
            mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined
          }
        >
          <Canvas
            camera={camera}
            dpr={dpr}
            frameloop={visible ? "always" : "never"}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
              gl.setClearAlpha(0);
              layer.current?.classList.add("ready");
            }}
          >
            <StageContext.Provider
              value={{
                palette,
                progress,
                animate: !reduce,
                dark: resolvedTheme !== "light",
              }}
            >
              {scene}
            </StageContext.Provider>
          </Canvas>
        </div>
      </div>
      {children}
    </>
  );
}
