import { easings } from './motion-tokens.js';
import { sldsColors } from './slds-tokens.js';

/**
 * Build a control row for one parameter. Returns a DocumentFragment ready to
 * append to the controls grid. The onChange callback fires with the new value.
 */
export function buildControl(param, currentValue, onChange, allValues = {}, setGlobalValue = null) {
  const frag = document.createDocumentFragment();
  const label = el('div', 'control-label', param.label);

  if (param.toggleId && setGlobalValue) {
    label.style.display = 'flex';
    label.style.justifyContent = 'space-between';
    label.style.alignItems = 'center';
    
    const labelEl = el('label', 'control-toggle');
    const input = el('input', 'control-toggle-input');
    input.type = 'checkbox';
    input.checked = !!allValues[param.toggleId];
    input.addEventListener('change', () => setGlobalValue(param.toggleId, input.checked));
    
    const slider = el('span', 'control-toggle-slider');
    
    labelEl.append(input, slider);
    label.appendChild(labelEl);
  }

  if (param.type === 'range') {
    const input = el('input', 'control-input');
    input.type = 'range';
    input.min = param.min;
    input.max = param.max;
    input.step = param.step;
    input.value = currentValue;
    const value = el('div', 'control-value', formatValue(currentValue, param));
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      value.textContent = formatValue(v, param);
      onChange(v);
    });
    frag.append(label, input, value);
    return frag;
  }

  if (param.type === 'select') {
    const select = el('select', 'control-input');
    const opts = param.options || easings;
    for (const opt of opts) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === currentValue) o.selected = true;
      select.appendChild(o);
    }
    select.addEventListener('change', () => onChange(select.value));
    select.style.gridColumn = 'span 2';
    frag.append(label, select);
    return frag;
  }

  if (param.type === 'text') {
    const input = el('input', 'control-input control-input-text');
    input.type = 'text';
    input.value = currentValue ?? '';
    input.placeholder = param.placeholder || '';
    input.style.gridColumn = 'span 2';
    input.addEventListener('input', () => onChange(input.value));
    frag.append(label, input);
    return frag;
  }

  if (param.type === 'text-list') {
    // Editable list of strings (captions, words). One row per item with
    // a remove button; an "Add" button appends a new empty row.
    const wrap = el('div', 'control-list');
    wrap.style.gridColumn = 'span 2';

    function rerender() {
      while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
      const items = Array.isArray(currentValue) ? currentValue : [];
      items.forEach((text, i) => {
        const row = el('div', 'control-list-row');
        const input = el('input', 'control-input');
        input.type = 'text';
        input.value = text;
        input.addEventListener('input', () => {
          items[i] = input.value;
          onChange([...items]);
        });
        const remove = el('button', 'btn btn-ghost', '×');
        remove.type = 'button';
        remove.addEventListener('click', () => {
          items.splice(i, 1);
          onChange([...items]);
          currentValue = [...items];
          rerender();
        });
        row.append(input, remove);
        wrap.appendChild(row);
      });
      const add = el('button', 'btn btn-ghost', '+ Add');
      add.type = 'button';
      add.addEventListener('click', () => {
        const next = [...items, ''];
        onChange(next);
        currentValue = next;
        rerender();
      });
      wrap.appendChild(add);
    }
    rerender();
    frag.append(label, wrap);
    return frag;
  }

  if (param.type === 'boolean') {
    const wrap = el('div', '');
    wrap.style.gridColumn = 'span 2';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.paddingTop = '8px';
    
    const labelEl = el('label', 'control-toggle');
    
    const input = el('input', 'control-toggle-input');
    input.type = 'checkbox';
    input.checked = !!currentValue;
    input.addEventListener('change', () => onChange(input.checked));
    
    const slider = el('span', 'control-toggle-slider');
    
    labelEl.append(input, slider);
    wrap.appendChild(labelEl);
    
    frag.append(label, wrap);
    return frag;
  }

  if (param.type === 'color') {
    // Grouped, scrollable picker for the full SLDS 2 palette.
    // The current selection's hex is shown next to the label so the
    // user sees what's selected without scrolling.
    const wrap = el('div', 'color-picker');
    wrap.style.gridColumn = 'span 2';

    const current = sldsColors.find(c => c.token === currentValue);
    const selected = el('div', 'color-picker-current');
    const dot = el('span', 'color-picker-dot');
    if (current) dot.style.background = current.hex;
    const tokenLabel = el('span', 'color-picker-token mono');
    tokenLabel.textContent = current ? current.token.replace('--slds-g-color-', '') : (currentValue || '—');
    selected.append(dot, tokenLabel);

    const grid = el('div', 'color-picker-grid');

    // Group swatches by `group` field, preserving array order.
    const groups = [];
    const byGroup = new Map();
    for (const c of sldsColors) {
      if (!byGroup.has(c.group)) {
        byGroup.set(c.group, []);
        groups.push(c.group);
      }
      byGroup.get(c.group).push(c);
    }

    for (const groupName of groups) {
      const groupHeader = el('div', 'color-picker-group-name', groupName);
      const row = el('div', 'color-picker-row');
      for (const c of byGroup.get(groupName)) {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'color-swatch';
        sw.style.background = c.hex;
        sw.title = `${c.token}\n${c.hex}`;
        sw.dataset.token = c.token;
        if (c.token === currentValue) sw.classList.add('is-active');
        sw.addEventListener('click', () => {
          grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-active'));
          sw.classList.add('is-active');
          dot.style.background = c.hex;
          tokenLabel.textContent = c.token.replace('--slds-g-color-', '');
          onChange(c.token);
        });
        row.appendChild(sw);
      }
      grid.append(groupHeader, row);
    }

    wrap.append(selected, grid);
    frag.append(label, wrap);
    return frag;
  }

  return frag;
}

function formatValue(v, param) {
  if (param.unit) return `${v}${param.unit}`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}
