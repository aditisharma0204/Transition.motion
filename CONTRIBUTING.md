# Contributing to tiny motion.

Thank you for your interest in contributing! This project is designed to be as accessible as possible. There is **no build step** required.

## Getting Started

1.  Clone the repository.
2.  Serve the root directory using a local web server to prevent CORS issues with ES modules. For example:
    ```bash
    python3 -m http.server 5174
    ```
    or use the provided script:
    ```bash
    python3 dev-server.py
    ```
3.  Open `http://localhost:5174` (or `5175` if using the script) in your browser.

## Adding a New Primitive

The studio automatically reads and renders primitives from the `js/scenes/index.js` registry. To add a new one:

1.  **Create your animation logic**: Create a new file in `js/scenes/` (e.g., `my-new-motion.js`). 
2.  **Define the module**: Export an object containing:
    *   `id`: A unique string ID.
    *   `name`: The display name for the gallery.
    *   `description`: A short explanation of the effect.
    *   `settings`: An array of control definitions (sliders, toggles, color pickers) that drive your animation.
    *   `mount(host, getValues)`: A function to set up your DOM structure and return an object with a `renderAt(t)` function for playback.
    *   `exportHTML(values)`: An async function that returns a fully self-contained HTML string of your animation.
3.  **Register it**: Open `js/scenes/index.js`, import your new module, and add it to the `scenes` array.
4.  **Add styles**: If your primitive relies on CSS, add its base classes to `styles/scenes.css` (or `motions.css`). Ensure you use CSS custom properties to hook into the variables passed by the `renderAt` function!

## Working with Lottie

If you are adding a primitive that requires a complex shape or animation path that is too difficult for raw CSS/SVG:
*   Place your raw `.lottie` or `.json` source files in an appropriate directory (e.g., `assets/scenes/`).
*   Ensure that your `exportHTML` function **bundles the Lottie data inline** and imports a lightweight Lottie player from a CDN. Users should be able to drag-and-drop the exported HTML file without needing any local assets or a Lottie subscription.

## Dependencies

We use `package.json` purely to track versions of external libraries (like `motion`) that are fetched via import maps in `index.html`. Do not introduce Node.js build dependencies (like Webpack, Vite, or Babel) to the core project. Keep it vanilla!