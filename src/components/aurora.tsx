"use client";

/**
 * Layered aurora background: three slow-drifting radial blobs behind a
 * fine grid, masked so it fades out toward the bottom of the viewport.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ opacity: "var(--aurora-opacity)" }}
    >
      {/* blobs */}
      <div className="absolute -left-[15%] -top-[20%] h-[62vmax] w-[62vmax] animate-drift-a rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--accent)/0.34),transparent_66%)] blur-[70px]" />
      <div className="absolute -right-[18%] top-[6%] h-[56vmax] w-[56vmax] animate-drift-b rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--accent-2)/0.28),transparent_66%)] blur-[80px]" />
      <div className="absolute bottom-[-25%] left-[22%] h-[50vmax] w-[50vmax] animate-drift-c rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--accent-4)/0.18),transparent_66%)] blur-[90px]" />

      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-100"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(var(--line)/0.55) 1px, transparent 1px),
                            linear-gradient(to bottom, rgb(var(--line)/0.55) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 60% at 50% 0%, #000 20%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 60% at 50% 0%, #000 20%, transparent 78%)",
        }}
      />

      {/* vignette toward the page background */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
