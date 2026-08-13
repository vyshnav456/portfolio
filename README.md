# Vyshnav K Kumar — Portfolio

Personal portfolio built with Next.js 16 (App Router), React 19, TypeScript,
Tailwind CSS v4, and Motion.

## Running it

One script does everything — it checks your Node version, installs
dependencies only when they're stale, stops any earlier dev server still
running for this project, and starts the app:

```bash
./start.sh              # dev server with hot reload → http://localhost:3000
./start.sh prod         # production build, then serve it
./start.sh -p 4000      # any port
./start.sh prod -p 8080 # both
./start.sh --help
```

Or use the npm scripts directly:

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the build
npm run lint
```

## Editing content

Everything on the page comes from **`src/lib/data.ts`** — profile, stats,
experience, projects, skills, education, achievements, nav links. Change the
copy there and every section updates; no component edits needed.

Your résumé is served from `public/Vyshnav_K_Kumar_Resume.pdf`. Replace that
file to update the download button (or change `profile.resume` if you rename it).

## Structure

```
src/
  app/
    layout.tsx      root layout, fonts, SEO metadata, theme provider
    page.tsx        composes the six sections
    actions.ts      "use server" contact form action (zod-validated)
    globals.css     design tokens, utilities, keyframes
    icon.svg        favicon
  components/
    aurora.tsx              drifting gradient background + grid
    three/
      hero-canvas.tsx       WebGL wrapper — feature detect, theme colours,
                            pauses rendering when off-screen or tab hidden
      hero-scene.tsx        particle sphere + wireframe core
      shaders.ts            GLSL (simplex-noise displacement)
    nav.tsx                 sticky nav, scroll-spy, mobile menu
    theme.tsx               next-themes provider + toggle
    section-heading.tsx     shared numbered section header
    motion-primitives.tsx   Reveal, Stagger, Magnetic, Counter, TiltCard,
                            ScrollProgress
    footer.tsx
    sections/               hero, about, experience, projects, stack, contact
  lib/data.ts       all site content
```

## Design system

Colour, spacing, and motion are driven by CSS custom properties in
`globals.css`. Light and dark are both fully defined — `:root` holds the light
values, `.dark` overrides them, and Tailwind maps them to utilities
(`bg-bg`, `text-muted`, `border-line`, `text-accent`, …) via `@theme inline`.

To rebrand, change `--accent` / `--accent-2` in both blocks. Everything —
gradient text, aurora blobs, card glow, focus rings, scroll progress bar —
follows.

Custom utilities: `glass`, `text-gradient`, `mono-label`, plus `.sheen`
(pointer-tracked card glow) and `.ring-conic` (animated gradient border).

## The 3D hero

A three.js / react-three-fiber point cloud: ~5,200 points distributed on a
sphere with a golden-angle spiral, displaced in the vertex shader by two
octaves of simplex noise, additively blended and tinted between `--accent` and
`--accent-2`. It drifts on its own and leans toward the cursor.

It's built to stay out of the way:

- loaded with `dynamic(..., { ssr: false })`, so it never blocks first paint
  and the hero is fully readable before (and without) it
- skipped entirely when WebGL is unavailable — the CSS aurora carries the hero
- `frameloop` switches to `"never"` when scrolled past or the tab is hidden, so
  it burns no GPU while you read the rest of the page
- device pixel ratio capped at 1.75, antialiasing off
- holds a single still frame under `prefers-reduced-motion`

To tune it, see the constants at the top of `hero-scene.tsx` (`COUNT`,
`RADIUS`) and the `uSize` / `uAmp` uniforms.

## Motion

All animation lives behind `prefers-reduced-motion` — the primitives check
`useReducedMotion()`, the 3D scene holds still, and `globals.css` collapses
every animation and transition for users who've asked for less movement.

## Contact form

A React Server Action in `src/app/actions.ts`, validated with zod and protected
by a honeypot field. Delivery is via Resend over plain `fetch` — no SDK
dependency.

Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` to send real email.
**Without a key the form still works end to end** and logs submissions to the
server console, so you can develop against it immediately.

## Deploying

Push to a Git host and import on Vercel — no configuration needed. Add the
`RESEND_API_KEY` and `CONTACT_TO_EMAIL` environment variables in the project
settings if you want the form to deliver.

Before going live, add `metadataBase: new URL("https://your-domain.com")` to the
metadata in `src/app/layout.tsx` so Open Graph URLs resolve absolutely, and drop
an `opengraph-image.png` into `src/app/` for link previews.
