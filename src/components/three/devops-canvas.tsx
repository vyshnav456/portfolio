"use client";

import { CanvasStage } from "./canvas-stage";
import { DevOpsScene } from "./devops-scene";

// soft edges only — the scene owns this section, so it doesn't need hiding
const MASK =
  "radial-gradient(ellipse 92% 80% at 50% 44%, #000 46%, transparent 92%)";

export default function DevOpsCanvas() {
  return (
    <CanvasStage
      className="pointer-events-none absolute inset-0"
      layerClassName="sticky top-0 h-[100svh] w-full"
      mask={MASK}
      camera={{ position: [8.4, 5.2, 13.5], fov: 46 }}
      dpr={[1, 1.6]}
      scene={<DevOpsScene />}
    />
  );
}
