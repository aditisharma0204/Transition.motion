import { motions } from './motions/index.js';

let currentPayload = null;
let currentFormat = 'json';

export function openExport(payload) {
  currentPayload = payload;
  currentFormat = 'json';
  const dialog = document.getElementById('export-dialog');
  document.getElementById('export-title').textContent =
    payload.scope === 'motion' ? `Export — ${payload.motionId}` : 'Export library';
  setActiveTab('json');
  renderOutput();
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function setActiveTab(format) {
  currentFormat = format;
  document.querySelectorAll('.export-tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.format === format);
  });
}

function renderOutput() {
  const out = document.getElementById('export-output');
  out.textContent = serialize(currentPayload, currentFormat);
}

function serialize(payload, format) {
  if (format === 'json') return JSON.stringify(payload.values, null, 2);
  if (format === 'css') return toCSS(payload.values);
  if (format === 'js') return toJS(payload.values);
  return '';
}

function toCSS(values) {
  const lines = [':root {'];
  for (const [motionId, params] of Object.entries(values)) {
    for (const [paramId, value] of Object.entries(params)) {
      const motion = motions.find(m => m.id === motionId);
      const param = motion?.params.find(p => p.id === paramId);
      if (!param) continue;
      const cssValue = formatCSSValue(param, value);
      lines.push(`  --motion-${motionId}-${paramId}: ${cssValue};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

function toJS(values) {
  const obj = {};
  for (const [motionId, params] of Object.entries(values)) {
    obj[motionId] = {};
    for (const [paramId, value] of Object.entries(params)) {
      const motion = motions.find(m => m.id === motionId);
      const param = motion?.params.find(p => p.id === paramId);
      if (!param) continue;
      obj[motionId][paramId] = formatJSValue(param, value);
    }
  }
  return `export const motionConfig = ${JSON.stringify(obj, null, 2)};\n`;
}

function formatCSSValue(param, value) {
  if (param.type === 'range') return param.unit ? `${value}${param.unit}` : String(value);
  if (param.type === 'select') return value;
  if (param.type === 'color') return `var(${value})`;
  return String(value);
}

function formatJSValue(param, value) {
  if (param.type === 'range') return param.unit ? `${value}${param.unit}` : value;
  return value;
}

function downloadCurrent() {
  const filename = currentPayload.scope === 'motion'
    ? `motion-${currentPayload.motionId}.${extFor(currentFormat)}`
    : `motion-library.${extFor(currentFormat)}`;
  const blob = new Blob([serialize(currentPayload, currentFormat)], {
    type: mimeFor(currentFormat),
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function extFor(f) { return f === 'json' ? 'json' : f === 'css' ? 'css' : 'js'; }
function mimeFor(f) { return f === 'json' ? 'application/json' : f === 'css' ? 'text/css' : 'text/javascript'; }

async function copyCurrent() {
  await navigator.clipboard.writeText(serialize(currentPayload, currentFormat));
  const btn = document.getElementById('export-copy');
  const prev = btn.textContent;
  btn.textContent = 'Copied';
  setTimeout(() => (btn.textContent = prev), 1200);
}

export function wireExportDialog() {
  const dialog = document.getElementById('export-dialog');

  document.querySelectorAll('.export-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveTab(tab.dataset.format);
      renderOutput();
    });
  });

  document.getElementById('export-copy').addEventListener('click', copyCurrent);
  document.getElementById('export-download').addEventListener('click', downloadCurrent);

  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    // Click on backdrop closes (the dialog element itself is the backdrop hit area)
    if (e.target === dialog) dialog.close();
  });
}
