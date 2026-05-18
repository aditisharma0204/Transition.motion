// Per-card playback engine. One instance per scene card so multiple
// scenes can play and scrub independently on the same page.
//
// Adapted from cko-demo-motion/script.js — the original used a single
// global `playback` object; we wrap it in a factory so each card has
// its own time clock and RAF loop.

export function createPlayback({ renderAt, getTotal, loop = false }) {
  const state = {
    active: false,
    paused: false,
    startedAt: 0,
    pausedAt: 0,
    totalPaused: 0,
    rafId: null,
    onTick: null,
    onComplete: null,
  };

  function effectiveElapsed() {
    if (!state.active) return 0;
    if (state.paused) return state.pausedAt - state.startedAt - state.totalPaused;
    return performance.now() - state.startedAt - state.totalPaused;
  }

  function tick() {
    if (!state.active || state.paused) return;
    const total = getTotal();
    const t = effectiveElapsed();
    if (t >= total) {
      if (loop) {
        // Wrap time so the timeline loops without ever stopping.
        state.startedAt = performance.now() - (t % Math.max(1, total));
        state.totalPaused = 0;
        const wrapped = effectiveElapsed();
        renderAt(wrapped);
        if (state.onTick) state.onTick(wrapped, total);
        state.rafId = requestAnimationFrame(tick);
        return;
      }
      renderAt(total);
      if (state.onTick) state.onTick(total, total);
      state.active = false;
      state.rafId = null;
      if (state.onComplete) state.onComplete();
      return;
    }
    renderAt(t);
    if (state.onTick) state.onTick(t, total);
    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    state.active = true;
    state.paused = false;
    state.startedAt = performance.now();
    state.totalPaused = 0;
    renderAt(0);
    if (state.onTick) state.onTick(0, getTotal());
    tick();
  }

  function pause() {
    if (!state.active || state.paused) return;
    state.paused = true;
    state.pausedAt = performance.now();
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  function resume() {
    if (!state.active || !state.paused) return;
    state.totalPaused += performance.now() - state.pausedAt;
    state.paused = false;
    tick();
  }

  function toggle() {
    if (!state.active && state.rafId === null) { play(); return; }
    if (state.paused) resume(); else pause();
  }

  function restart() { play(); }

  function scrubTo(targetMs) {
    const total = getTotal();
    const t = Math.max(0, Math.min(targetMs, total));
    state.startedAt = performance.now() - t;
    state.totalPaused = 0;
    renderAt(t);
    if (state.onTick) state.onTick(t, total);
  }

  function stop() {
    state.active = false;
    state.paused = false;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  return {
    play, pause, resume, toggle, restart, scrubTo, stop,
    isPaused: () => state.paused,
    isActive: () => state.active,
    onTick(fn) { state.onTick = fn; },
    onComplete(fn) { state.onComplete = fn; },
  };
}
