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

`entrance` · `latency` · `attention` · `text` — extend in `js/motions/index.js`.

## Export formats

- **JSON** — flat config of all current values; for handoff or programmatic use.
- **CSS** — `:root { --motion-<id>-<param>: <value>; }` for any project that drives motion via CSS variables.
- **JS** — ES module exporting the same config as a JS object.

Export the whole library (header → "Export library") or a single motion (per-card "Export").
