# tiny motion.

A library of motion presets for demos and product vision work, inspired by CKO motion experiments.
A studio for building, tweaking, and exporting motion primitives for Salesforce experiences. Vanilla HTML / CSS / JS — no build step.

## Run locally

```sh
python3 -m http.server 5174
# then open http://localhost:5174
```

## Layout

```
index.html              Studio shell
styles/
  tokens.css            SLDS color + motion tokens (CSS custom properties)
  motions.css           @keyframes + base classes for every motion
  studio.css            Gallery / controls UI
js/
  studio.js             Entry point
  gallery.js            Renders motion cards
  controls.js           Slider / select / color-swatch builders
  export.js             JSON / CSS / JS export
  motion-tokens.js      Easing presets, duration presets
  slds-tokens.js        Curated SLDS color palette
  motions/
    index.js            Registry
    reveal.js           One file per motion primitive
    pop.js
    shimmer.js
    glow.js
    blur-reveal.js
```

## Project Context
- **Vanilla HTML/CSS/JS**: There is no build step required to run or edit this project. Just serve the files over a local server.
- **Why `package.json` exists**: The `package.json` and `package-lock.json` files are included purely for tracking external dependencies (like the `motion` library) and locking their versions. The browser fetches these packages directly from a CDN (`esm.sh`) via import maps in `index.html`. You do not need to run `npm install` or use Node.js to build the project.
- **Lottie Strategy**: We use Lottie animations for complex shapes (like the Sparkle or Clarity effects). The raw `.lottie` or `.json` source files live in the repository (e.g., in `assets/` or `reference/`) for contributors. However, **users do not need a Lottie subscription**. When a user clicks "Export" in the studio, the application bundles a lightweight Lottie player and the required animation data directly into a self-contained `.html` file. The complexity stays on our side, not theirs.

## Adding a new motion

1. Add `@keyframes` and a base class to `styles/motions.css`. Drive every parameter from a CSS custom property with a default.
2. Create `js/motions/<id>.js` exporting a spec — `id`, `name`, `category`, `className`, `loop`, `preview`, `params[]`. Each param maps to a CSS custom property via `cssVar`.
3. Register it in `js/motions/index.js`.

The gallery renders cards automatically from the registry.

## Categories

We organize our primitives into conceptual buckets depending on their role in the user journey. Here is a breakdown of the current library:

### 1. Transition & reveal animations
*Page-to-page transitions, panel slide-ins, and modal entrances.*

- **Clarity**
  - *Why?* A beautiful, premium way to introduce a completely new section or heavy panel without a jarring cut.
  - *How to use:* Full-screen or full-panel transitions where copy needs to be read sequentially before the UI resolves.
  - *Default Duration:* 7.1s (7100ms)
- **Expressive Card**
  - *Why?* Demonstrates Material Design 3 spring physics for interactive elements.
  - *How to use:* Apply these spatial and effect springs to cards, modals, and list items that expand or elevate on hover/focus.
  - *Default Duration:* Interactive (driven by hover state)
- **Sparkle & Astro Sparkle**
  - *Why?* "Ta-da!" moments. Highlighting a successful action, a new feature, or an AI-generated outcome.
  - *How to use:* Center stage in success modals or zero-state welcome screens.
  - *Default Duration:* 4.4s (Sparkle) / 5.0s (Astro Sparkle)
- **Text Gradient**
  - *Why?* Draws the eye to a specific, short headline without changing the page layout.
  - *How to use:* Hero banners or empty-state titles that need a splash of dynamic color.
  - *Default Duration:* 3.0s loop (3000ms)
- **Gesture**
  - *Why?* Highly cinematic, word-by-word reveal over a WebGL grainient background.
  - *How to use:* High-fidelity vision demos or splash screens where storytelling and pacing are critical.
  - *Default Duration:* Dynamic (scales with the number of text lines provided)

### 2. AI "thinking" states
*Ambient indicators, reasoning logs, and deep processing states.*

- **Dot Matrix**
  - *Why?* The quintessential lightweight AI indicator. It feels systematic and precise.
  - *How to use:* Drop this next to a chat input, inside a loading pill, or anywhere an AI agent is "typing" or "listening."
  - *Default Duration:* 1.5s - 2.0s infinite CSS loop
- **Morph**
  - *Why?* Shows that the AI is moving through *phases* of work (e.g., listening -> reasoning -> generating), rather than just hanging.
  - *How to use:* Full-screen loading states or heavy inference blockers.
  - *Default Duration:* 6.0s (3 chained steps, 2.0s each)
- **Process Steps**
  - *Why?* Builds trust by exposing the "chain of thought." Users tolerate longer waits if they see what is happening.
  - *How to use:* When generating a large document, drafting an email, or running a complex workflow.
  - *Default Duration:* Dynamic (default ~5.2s based on 3 steps)
- **Experiment (The Core)**
  - *Why?* A deeply ambient, organic glowing orb that feels alive.
  - *How to use:* Voice-agent listening states or central dashboard hubs for agentic AI.
  - *Default Duration:* Infinite CSS loop

## Export formats

- **JSON** — flat config of all current values; for handoff or programmatic use.
- **CSS** — `:root { --motion-<id>-<param>: <value>; }` for any project that drives motion via CSS variables.
- **JS** — ES module exporting the same config as a JS object.

Export the whole library (header → "Export library") or a single motion (per-card "Export").
