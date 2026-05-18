# Transitions Library

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
