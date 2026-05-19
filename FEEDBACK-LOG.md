# Feedback Log

## May 19, 2026 - Slack Review

### What's working well :white_check_mark:
- The registry pattern (`js/motions/index.js`) is highly scalable.
- CSS custom properties driving every parameter.
- Three export formats (JSON / CSS / JS) covering every handoff scenario.
- Category taxonomy (entrance / latency / attention / text) is a great mental model.
- No build step is highly appreciated.

### Things to address :warning:
- [x] **Remove `node_modules` from repo**: It bloats the repo and confuses the vanilla HTML/CSS/JS positioning.
- [x] **Clarify `package.json`**: If truly no-build-step, explain why it's there (for local dev/CDN version tracking).
- [x] **Clean scratch files**: Remove `dump.js`, `test-gradients.js`, `test-tint.js`.
- [x] **Move `Fixed Blur.lottie`**: Move to a `/reference` or `/experiments` folder to avoid contradicting "no Lottie dependency".
- [x] **Tag v0.1.0 release**: Create a stable tag.

### Gaps to fill next :soon:
- [ ] **Live preview in README**: Add a GIF/video of the studio in action.
- [ ] **Review Text category**: Populate it or hide it. (Note: We added 'Gradient Text' recently, need to verify).
- [ ] **Add Latency primitives**: Shimmer is the only one. Needs more love.
- [x] **Add `CONTRIBUTING.md`**: Lower the barrier for adding primitives.

### UX Thoughts :bulb:
- [ ] **Timeline/Sequencer UX**: Simplify the UI (0.0s / 0.0s) if a sequencer is not in v1 scope.

### Lottie Strategy
- [x] **Clarify Lottie workflow in README**: Explicitly state that Lottie source files live in the repo for contributors, but users never need a subscription because the export is a self-contained HTML bundle.
- [ ] **Add "Lottie" badge**: Add a UI indicator for primitives powered by a `.lottie` file so users know what's under the hood.
