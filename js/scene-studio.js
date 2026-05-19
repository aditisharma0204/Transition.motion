import { scenes } from './scenes/index.js';
import { createPlayback } from './scenes/playback.js';
import { buildControl } from './controls.js';

const STORAGE_KEY = 'transitions-library:scenes:v1';

const state = {
  activeId: scenes[0].id,
  values: {},          // { [sceneId]: { ...settings, ...copy } }
  controller: null,    // current scene controller
  playback: null,      // current playback engine
};

let refreshExportPanel = null;

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function paramsFor(scene) {
  return [...(scene.settings || []), ...(scene.copy || [])];
}

function seedDefaults() {
  for (const scene of scenes) {
    state.values[scene.id] = {};
    for (const p of paramsFor(scene)) state.values[scene.id][p.id] = p.default;
  }
}

function loadFromStorage() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) { return; }
  if (!raw) return;
  let parsed;
  try { parsed = JSON.parse(raw); } catch (_) { return; }
  if (parsed && typeof parsed === 'object') {
    if (parsed.activeId && scenes.find(s => s.id === parsed.activeId)) {
      state.activeId = parsed.activeId;
    }
    if (parsed.values && typeof parsed.values === 'object') {
      for (const scene of scenes) {
        const stored = parsed.values[scene.id];
        if (!stored) continue;
        for (const p of paramsFor(scene)) {
          if (Object.prototype.hasOwnProperty.call(stored, p.id)) {
            state.values[scene.id][p.id] = stored[p.id];
          }
        }
      }
    }
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeId: state.activeId,
      values: state.values,
    }));
  } catch (_) { /* quota exceeded — ignore */ }
}

export function initSceneStudio() {
  seedDefaults();
  loadFromStorage();

  renderPicker();
  mountActive();
  wirePlaybackControls();
}

/* ---------- Top picker ----------------------------------------- */

function renderPicker() {
  const root = document.getElementById('scene-picker');
  if (!root) return;
  clearChildren(root);
  for (const scene of scenes) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scene-chip' + (state.activeId === scene.id ? ' is-active' : '');
    btn.textContent = scene.name;
    if (scene.isStub) btn.classList.add('is-stub');
    btn.addEventListener('click', () => {
      if (state.activeId === scene.id) return;
      state.activeId = scene.id;
      saveToStorage();
      renderPicker();
      mountActive();
    });
    root.appendChild(btn);
  }
}

/* ---------- Mount active scene --------------------------------- */

function activeScene() { return scenes.find(s => s.id === state.activeId); }

function mountActive() {
  const scene = activeScene();
  const stage = document.getElementById('scene-stage');
  if (!stage) return;

  // Tear down previous
  if (state.playback) state.playback.stop();
  if (state.controller && typeof state.controller.destroy === 'function') {
    try { state.controller.destroy(); } catch (_) {}
  }

  // Mount new
  const getValues = () => state.values[scene.id];
  state.controller = scene.mount(stage, getValues);

  state.playback = createPlayback({
    renderAt: (t) => state.controller.renderAt(t),
    getTotal: () => state.controller.getTotal(),
    loop: !!scene.loop,
  });

  state.playback.onTick((t, total) => updatePlaybackUI(t, total));
  state.playback.onComplete(() => updatePlayPauseLabel());

  // Initial paint at t=0
  state.controller.renderAt(0);
  updatePlaybackUI(0, state.controller.getTotal());
  buildScrubberMarks();

  renderSettingsPanel();
  renderCopyPanel();
  updatePlayPauseLabel();
}

/* ---------- Settings (left) and Copy (right) panels ------------ */

function renderSettingsPanel() {
  const root = document.getElementById('settings-panel');
  if (!root) return;
  clearChildren(root);

  const scene = activeScene();
  const settings = scene.settings || [];

  const header = document.createElement('div');
  header.className = 'panel-scene-header';

  const title = document.createElement('h2');
  title.className = 'panel-scene-title';
  title.textContent = scene.name;
  if (scene.usesLottie) {
    const badge = document.createElement('span');
    badge.className = 'lottie-badge';
    badge.textContent = 'Lottie';
    title.appendChild(badge);
  }
  header.appendChild(title);

  if (scene.description) {
    const desc = document.createElement('p');
    desc.className = 'panel-scene-desc';
    desc.textContent = scene.description;
    header.appendChild(desc);
  }
  
  root.appendChild(header);

  const heading = document.createElement('h3');
  heading.className = 'panel-heading';
  heading.textContent = 'Settings';
  root.appendChild(heading);

  if (!settings.length) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = 'No settings exposed for this scene yet.';
    root.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'control-grid';
  
  const setGlobalValue = (key, val) => {
    state.values[scene.id][key] = val;
    saveToStorage();
    state.controller.renderAt(currentT());
    buildScrubberMarks();
    if (refreshExportPanel) refreshExportPanel();
  };

  for (const p of settings) {
    if (p.hidden) continue;
    const row = buildControl(p, state.values[scene.id][p.id], (v) => setGlobalValue(p.id, v), state.values[scene.id], setGlobalValue);
    grid.appendChild(row);
  }
  root.appendChild(grid);

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn btn-ghost panel-reset';
  reset.textContent = 'Reset settings';
  reset.addEventListener('click', () => {
    for (const p of settings) state.values[scene.id][p.id] = p.default;
    saveToStorage();
    renderSettingsPanel();
    renderCopyPanel();
    state.controller.renderAt(currentT());
    buildScrubberMarks();
  });
  root.appendChild(reset);
}

function renderCopyPanel() {
  const root = document.getElementById('copy-panel');
  if (!root) return;
  clearChildren(root);

  const scene = activeScene();
  const copy = scene.copy || [];

  const heading = document.createElement('h2');
  heading.className = 'panel-heading';
  heading.textContent = 'Copy';
  root.appendChild(heading);

  if (copy.length) {
    const grid = document.createElement('div');
    grid.className = 'control-grid';
    
    const setGlobalValue = (key, val) => {
      state.values[scene.id][key] = val;
      saveToStorage();
      state.controller.renderAt(currentT());
      if (refreshExportPanel) refreshExportPanel();
    };

    for (const p of copy) {
      if (p.hidden) continue;
      const row = buildControl(p, state.values[scene.id][p.id], (v) => setGlobalValue(p.id, v), state.values[scene.id], setGlobalValue);
      grid.appendChild(row);
    }
    root.appendChild(grid);
  } else {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = 'No copy params for this scene.';
    root.appendChild(empty);
  }

  // Export section — tabbed (JSON / CSS / JS) so the user picks one.
  const exportHeading = document.createElement('h2');
  exportHeading.className = 'panel-heading';
  exportHeading.textContent = 'Export';
  root.appendChild(exportHeading);

  root.appendChild(buildExportTabs());
}

function buildExportTabs() {
  const wrap = document.createElement('div');
  wrap.className = 'export-tabs-wrap';

  const tabs = document.createElement('div');
  tabs.className = 'export-tabs';

  const head = document.createElement('div');
  head.className = 'export-block-head';
  const label = document.createElement('span');
  label.className = 'export-block-label mono';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn-ghost';
  copyBtn.textContent = 'Copy';

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'btn btn-ghost';
  downloadBtn.textContent = 'Download .html';
  const scene = activeScene();
  if (typeof scene.exportHTML !== 'function') {
    downloadBtn.disabled = true;
    downloadBtn.title = 'Standalone .html export not available for this scene yet';
  }
  downloadBtn.addEventListener('click', async () => {
    const s = activeScene();
    if (typeof s.exportHTML !== 'function') return;
    downloadBtn.textContent = 'Building…';
    try {
      const html = await s.exportHTML(state.values[s.id]);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${s.id}-${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      downloadBtn.textContent = 'Downloaded';
      setTimeout(() => { downloadBtn.textContent = 'Download .html'; }, 1500);
    } catch (e) {
      console.error('[exportHTML]', e);
      downloadBtn.textContent = 'Failed';
      setTimeout(() => { downloadBtn.textContent = 'Download .html'; }, 2000);
    }
  });
  head.append(label, downloadBtn, copyBtn);

  if (typeof scene.exportHTML === 'function') {
    const explain = document.createElement('p');
    explain.className = 'export-html-explainer';
    explain.textContent = 'This scene contains a custom Lottie file. Download the standalone .html bundle to embed and use this animation directly in your own projects.';
    wrap.appendChild(explain);
  }

  const pre = document.createElement('pre');
  pre.className = 'export-block-body';

  let active = 'json';
  function refresh() {
    label.textContent = active.toUpperCase();
    pre.textContent = formatExport(active);
    tabs.querySelectorAll('.export-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.fmt === active);
    });
  }
  refreshExportPanel = refresh;

  for (const fmt of ['json', 'css', 'js']) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'export-tab';
    tab.dataset.fmt = fmt;
    tab.textContent = fmt.toUpperCase();
    tab.addEventListener('click', () => { active = fmt; refresh(); });
    tabs.appendChild(tab);
  }

  copyBtn.addEventListener('click', async () => {
    refresh();
    try {
      await navigator.clipboard.writeText(pre.textContent);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = original; }, 1200);
    } catch (_) { copyBtn.textContent = 'Copy failed'; }
  });

  pre.addEventListener('mouseenter', refresh);

  refresh();
  wrap.append(tabs, head, pre);
  return wrap;
}

function formatExport(fmt) {
  const scene = activeScene();
  const values = state.values[scene.id];
  if (fmt === 'json') {
    return JSON.stringify({ scene: scene.id, values }, null, 2);
  }
  if (fmt === 'css') {
    const lines = [`:root {`];
    for (const [k, v] of Object.entries(values)) {
      lines.push(`  --scene-${scene.id}-${k}: ${cssValue(v)};`);
    }
    lines.push('}');
    return lines.join('\n');
  }
  if (fmt === 'js') {
    return `export const ${camel(scene.id)}Config = ${JSON.stringify(values, null, 2)};`;
  }
  return '';
}

function cssValue(v) {
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'string' && v.startsWith('--')) return `var(${v})`;
  return String(v);
}
function camel(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

/* ---------- Scrubber + transport ------------------------------- */

function currentT() {
  // Read from progress UI — single source of truth lives in playback engine,
  // but for re-paints triggered by control changes we use the last known t.
  const fill = document.getElementById('scene-playback-fill');
  if (!fill || !state.controller) return 0;
  const pct = parseFloat(fill.dataset.t || '0');
  return pct;
}

function updatePlaybackUI(t, total) {
  const fill = document.getElementById('scene-playback-fill');
  if (fill) {
    fill.style.width = `${Math.min(100, (t / total) * 100)}%`;
    fill.dataset.t = String(t);
  }
  updateRestartEnabled(t);
}

// Restart is redundant when playback is fresh (t=0 AND engine not active).
// We use aria-disabled + an .is-disabled class instead of the disabled
// attribute so the button stays in the tab order and screen readers
// announce it as a disabled control.
function updateRestartEnabled(t) {
  const btn = document.getElementById('scene-restart');
  if (!btn) return;
  const time = typeof t === 'number' ? t : currentT();
  const isActive = state.playback ? state.playback.isActive() === true : false;
  const enabled = isActive || time > 0;
  btn.classList.toggle('is-disabled', !enabled);
  btn.setAttribute('aria-disabled', String(!enabled));
}

function buildScrubberMarks() {
  const marks = document.getElementById('scene-playback-marks');
  if (!marks || !state.controller) return;
  clearChildren(marks);
  const total = state.controller.getTotal();
  const list = state.controller.getMarks ? state.controller.getMarks() : [];
  for (const m of list) {
    const node = document.createElement('span');
    node.className = 'scene-playback-mark';
    node.style.left = `${(m / total) * 100}%`;
    marks.appendChild(node);
  }
}

function updatePlayPauseLabel() {
  const btn = document.getElementById('scene-play');
  if (!btn || !state.playback) return;
  if (!state.playback.isActive()) {
    btn.textContent = 'Play';
  } else {
    btn.textContent = state.playback.isPaused() ? 'Resume' : 'Pause';
  }
  updateRestartEnabled();
}

function wirePlaybackControls() {
  const play = document.getElementById('scene-play');
  const restart = document.getElementById('scene-restart');
  const track = document.getElementById('scene-playback-track');

  if (play) {
    play.addEventListener('click', () => {
      if (!state.playback) return;
      state.playback.toggle();
      updatePlayPauseLabel();
    });
  }
  if (restart) {
    restart.addEventListener('click', () => {
      if (!state.playback) return;
      // Aria-disabled buttons stay focusable/clickable, so enforce the
      // disabled semantics here instead of relying on the disabled attribute.
      if (restart.getAttribute('aria-disabled') === 'true') return;
      state.playback.restart();
      updatePlayPauseLabel();
    });
  }
  if (track) {
    function ratioFromEvent(e) {
      const r = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    }
    track.addEventListener('click', (e) => {
      if (!state.playback || !state.controller) return;
      const wasActive = state.playback.isActive() && !state.playback.isPaused();
      state.playback.scrubTo(ratioFromEvent(e) * state.controller.getTotal());
      if (!wasActive) state.playback.pause();
      updatePlayPauseLabel();
    });

    let dragging = false;
    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      track.setPointerCapture(e.pointerId);
      if (state.playback) state.playback.pause();
      updatePlayPauseLabel();
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging || !state.playback || !state.controller) return;
      state.playback.scrubTo(ratioFromEvent(e) * state.controller.getTotal());
    });
    track.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      try { track.releasePointerCapture(e.pointerId); } catch (_) {}
    });
  }
}
