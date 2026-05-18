import { motions, categories } from './motions/index.js';
import { buildControl } from './controls.js';
import { openExport } from './export.js';

const STORAGE_KEY = 'transitions-library:values:v1';

const state = {
  values: {}, // { [motionId]: { [paramId]: value } }
  filter: 'all',
};

export function initGallery() {
  // Seed defaults
  for (const m of motions) {
    state.values[m.id] = {};
    for (const p of m.params) state.values[m.id][p.id] = p.default;
  }
  // Restore overrides from previous session
  loadFromStorage();

  renderFilters();
  renderGallery();

  document.getElementById('export-all').addEventListener('click', () => {
    openExport({ scope: 'library', values: state.values });
  });
}

function renderFilters() {
  const root = document.getElementById('filters');
  clear(root);
  for (const c of categories) {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (state.filter === c.id ? ' is-active' : '');
    btn.textContent = c.label;
    btn.addEventListener('click', () => {
      state.filter = c.id;
      renderFilters();
      renderGallery();
    });
    root.appendChild(btn);
  }
}

function renderGallery() {
  const root = document.getElementById('gallery');
  clear(root);
  const visible = motions.filter(m => state.filter === 'all' || m.category === state.filter);
  for (const m of visible) root.appendChild(renderCard(m));
}

function renderCard(motion) {
  const card = document.createElement('article');
  card.className = 'motion-card';

  const header = document.createElement('div');
  header.className = 'motion-card-header';
  const title = document.createElement('h2');
  title.className = 'motion-card-title';
  title.textContent = motion.name;
  const category = document.createElement('span');
  category.className = 'motion-card-category';
  category.textContent = motion.category;
  header.append(title, category);
  card.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'motion-card-desc';
  desc.textContent = motion.description;
  card.appendChild(desc);

  const preview = document.createElement('div');
  preview.className = 'motion-preview';
  const target = buildPreviewTarget(motion);
  preview.appendChild(target);
  card.appendChild(preview);

  const controls = document.createElement('div');
  controls.className = 'motion-controls';
  for (const param of motion.params) {
    const row = buildControl(param, state.values[motion.id][param.id], (newVal) => {
      state.values[motion.id][param.id] = newVal;
      saveToStorage();
      applyAll(target, motion);
      if (!motion.loop) replay(target, motion);
    });
    controls.appendChild(row);
  }
  card.appendChild(controls);

  const actions = document.createElement('div');
  actions.className = 'motion-actions';

  const replayBtn = document.createElement('button');
  replayBtn.className = 'btn';
  replayBtn.textContent = 'Replay';
  replayBtn.addEventListener('click', () => replay(target, motion));

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    for (const p of motion.params) state.values[motion.id][p.id] = p.default;
    saveToStorage();
    renderGallery();
  });

  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn';
  exportBtn.textContent = 'Export';
  exportBtn.addEventListener('click', () => openExport({
    scope: 'motion',
    motionId: motion.id,
    values: { [motion.id]: state.values[motion.id] },
  }));

  actions.append(replayBtn, resetBtn, exportBtn);
  card.appendChild(actions);

  applyAll(target, motion);
  return card;
}

function buildPreviewTarget(motion) {
  const t = document.createElement('div');
  t.classList.add(motion.className);
  switch (motion.preview.type) {
    case 'bar':
      t.classList.add('preview-target-bar');
      break;
    case 'text':
      t.classList.add('preview-target-text');
      t.textContent = motion.preview.content || 'Sample';
      break;
    case 'box':
    default:
      t.classList.add('preview-target-box');
  }
  return t;
}

/**
 * Apply every param value to the preview target as CSS custom properties.
 * If the motion exports a `compute(values)` function, its returned map of
 * css-var → string is used; otherwise we fall back to the per-param mapping.
 */
function applyAll(target, motion) {
  const values = state.values[motion.id];

  // Default per-param mapping
  for (const p of motion.params) {
    if (!p.cssVar) continue;
    target.style.setProperty(p.cssVar, formatCSSValue(p, values[p.id]));
  }

  // Motion-level override (e.g. slide combines distance + direction → tx/ty)
  if (typeof motion.compute === 'function') {
    const extras = motion.compute(values) || {};
    for (const [k, v] of Object.entries(extras)) target.style.setProperty(k, v);
  }
}

function formatCSSValue(param, value) {
  if (param.type === 'range') return param.unit ? `${value}${param.unit}` : String(value);
  if (param.type === 'select') return value;
  if (param.type === 'color')  return `var(${value})`;
  return String(value);
}

function replay(target, motion) {
  target.classList.remove(motion.className);
  void target.offsetWidth;
  target.classList.add(motion.className);
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.values));
  } catch (_) {
    // Quota exceeded or storage disabled — silently ignore.
  }
}

function loadFromStorage() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) { return; }
  if (!raw) return;
  let parsed;
  try { parsed = JSON.parse(raw); } catch (_) { return; }

  // Merge stored values over defaults; ignore unknown motions/params so the
  // schema can evolve without breaking saved sessions.
  for (const m of motions) {
    const stored = parsed[m.id];
    if (!stored) continue;
    for (const p of m.params) {
      if (Object.prototype.hasOwnProperty.call(stored, p.id)) {
        state.values[m.id][p.id] = stored[p.id];
      }
    }
  }
}
