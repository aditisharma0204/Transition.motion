# Quick Build Motion Primitive

A specialized skill for rapidly generating new vanilla HTML/CSS/JS motion primitives for the tiny motion library.

Use this skill whenever the user says "Quick Build: [description]" or asks to "build a new motion scene for [description]".

## Workflow

When triggered, instantly create the new primitive by following these exact steps:

1. **Understand the Goal**: Read the user's prompt (e.g., "Quick Build: A streaming text cursor that blinks").
2. **Create the Scene File (`js/scenes/<id>.js`)**:
   - Use the standard ES Module export format for a scene.
   - Include `id`, `name`, `description`, `why`, `howToUse`, `settings` (array), and `mount(host, getValues)`.
   - Ensure `mount` returns `{ renderAt(t), getTotal(), getMarks(), destroy() }`.
   - Ensure an `exportHTML(values)` function is included to export the standalone HTML/CSS snippet.
3. **Register the Scene (`js/scenes/index.js`)**:
   - Import the new module.
   - Add it to the exported `scenes` array.
4. **Add CSS (if needed)**:
   - Add any custom `@keyframes` or wrapper CSS to `styles/scenes.css` (or inline it if it's very specific and small).
   - *Crucially*, drive the CSS using CSS custom properties (variables) hooked up inside the `renderAt(t)` function so the studio controls work.

## Core Rules for Primitives
- **No Build Step**: Only use vanilla JS, CSS, and HTML. No React, no Vite, no Webpack.
- **Dependencies**: You may use the `motion` library (already available globally or via import map) or `lottie` if it's a complex SVG shape, but prefer pure CSS/JS when possible.
- **Exports**: The `exportHTML` function must return a string of HTML that works as a completely self-contained file (inlining CSS and JS logic).

Acknowledge the creation and immediately mount the new scene for the user to preview on `http://localhost:5175`.