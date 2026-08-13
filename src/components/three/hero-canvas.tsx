"use client";

import { CanvasStage } from "./canvas-stage";
import { HeroScene } from "./hero-scene";

const MASK =
  "radial-gradient(ellipse 62% 62% at 68% 46%, #000 26%, transparent 72%)";

export default function HeroCanvas() {
  return (
    <CanvasStage
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-[5] w-screen -translate-x-1/2"
      mask={MASK}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      scene={<HeroScene />}
    />
  );
}
