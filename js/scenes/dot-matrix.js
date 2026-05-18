// Dot Matrix Animation scene
// Pure CSS animations adapted into the studio

import { tokenToHex } from './lottie-tint.js';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'dot-matrix',
  name: 'Dot Matrix',
  description: 'AI-first microinteractions using a 3x3 dot matrix grid.',
  loop: true,

  settings: [
    { id: 'animType', label: 'Animation Type', type: 'select', default: 'pulse', options: [
      { value: 'pulse', label: 'Pulse' },
      { value: 'ripple', label: 'Ripple' },
      { value: 'wave', label: 'Wave' },
      { value: 'loading', label: 'Loading' },
      { value: 'growing', label: 'Growing' }
    ] },
    { id: 'baseColor',   label: 'Dot Base',      type: 'color', default: '--slds-g-color-neutral-base-20' },
    { id: 'showGlow',    label: 'Show Dot Glow', type: 'boolean', default: true, hidden: true },
    { id: 'glowColor',   label: 'Dot Glow',      type: 'color', default: '--slds-g-color-palette-pink-50', toggleId: 'showGlow' },
    { id: 'showShadow',  label: 'Show Glow Shadow', type: 'boolean', default: true, hidden: true },
    { id: 'shadowColor', label: 'Glow Shadow',   type: 'color', default: '--slds-g-color-palette-pink-65', toggleId: 'showShadow' },
    { id: 'centerBg',    label: 'Center bg (Loading)', type: 'color', default: '--slds-g-color-neutral-base-15' },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-dot-matrix');

    const wrapper = document.createElement('div');
    wrapper.className = 'dot-matrix-wrapper';

    const matrix = document.createElement('div');
    matrix.className = 'dot-matrix';

    for (let i = 0; i < 9; i++) {
      matrix.appendChild(document.createElement('div'));
    }

    wrapper.appendChild(matrix);
    host.appendChild(wrapper);

    function renderAt(t) {
      const v = getValues();
      
      // Update variables
      matrix.style.setProperty('--dot-base', `var(${v.baseColor}, ${v.baseColor})`);
      matrix.style.setProperty('--dot-glow', v.showGlow ? `var(${v.glowColor}, ${v.glowColor})` : `var(${v.baseColor}, ${v.baseColor})`);
      matrix.style.setProperty('--dot-shadow', v.showShadow ? `var(${v.shadowColor}, ${v.shadowColor})` : 'transparent');
      matrix.style.setProperty('--dot-center-bg', `var(${v.centerBg}, ${v.centerBg})`);
      
      // Update animation class
      matrix.className = `dot-matrix ${v.animType}`;
    }

    function getTotal() { return 2000; } // Arbitrary loop duration since it's CSS
    function getMarks() { return [0]; }

    function destroy() {
      clearChildren(host);
      host.classList.remove('scene-dot-matrix');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },

  async exportHTML(values) {
    const baseHex = tokenToHex(values.baseColor, '#333333');
    const glowHex = values.showGlow ? tokenToHex(values.glowColor, '#ff14cc') : baseHex;
    const shadowHex = values.showShadow ? tokenToHex(values.shadowColor, '#ffa3eb') : 'transparent';
    const centerBgHex = tokenToHex(values.centerBg, '#1a1a1a');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dot Matrix — exported</title>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #E5E5E5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dot-matrix-wrapper {
    padding: 32px;
    border-radius: 16px;
    display: inline-block;
    margin: 10px;
  }
  .dot-matrix {
    display: grid;
    grid-template-columns: repeat(3, 13px);
    grid-template-rows: repeat(3, 13px);
    gap: 2px;
    width: fit-content;
    --dot-base: ${baseHex};
    --dot-glow: ${glowHex};
    --dot-shadow: ${shadowHex};
    --dot-center-bg: ${centerBgHex};
  }
  .dot-matrix > div {
    width: 13px;
    height: 13px;
    background-color: var(--dot-base);
    border-radius: 2px;
  }

  /* 1. PULSE */
  @keyframes anim-pulse {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
    50% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1.2); }
  }
  .dot-matrix.pulse > div { animation: anim-pulse 1.5s infinite ease-in-out; }
  .dot-matrix.pulse > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.pulse > div:nth-child(2) { animation-delay: 0.1s; }
  .dot-matrix.pulse > div:nth-child(3) { animation-delay: 0.2s; }
  .dot-matrix.pulse > div:nth-child(6) { animation-delay: 0.3s; }
  .dot-matrix.pulse > div:nth-child(9) { animation-delay: 0.4s; }
  .dot-matrix.pulse > div:nth-child(8) { animation-delay: 0.5s; }
  .dot-matrix.pulse > div:nth-child(7) { animation-delay: 0.6s; }
  .dot-matrix.pulse > div:nth-child(4) { animation-delay: 0.7s; }
  .dot-matrix.pulse > div:nth-child(5) { animation-delay: 0.8s; }

  /* 2. RIPPLE */
  @keyframes anim-ripple {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; }
    30% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); }
  }
  .dot-matrix.ripple > div { animation: anim-ripple 1.5s infinite ease-in-out; }
  .dot-matrix.ripple > div:nth-child(5) { animation-delay: 0s; }
  .dot-matrix.ripple > div:nth-child(2), .dot-matrix.ripple > div:nth-child(4), 
  .dot-matrix.ripple > div:nth-child(6), .dot-matrix.ripple > div:nth-child(8) { animation-delay: 0.15s; }
  .dot-matrix.ripple > div:nth-child(1), .dot-matrix.ripple > div:nth-child(3), 
  .dot-matrix.ripple > div:nth-child(7), .dot-matrix.ripple > div:nth-child(9) { animation-delay: 0.3s; }

  /* 3. WAVE */
  @keyframes anim-wave {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; }
    30% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); }
  }
  .dot-matrix.wave > div { animation: anim-wave 1.5s infinite ease-in-out; }
  .dot-matrix.wave > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.wave > div:nth-child(2), .dot-matrix.wave > div:nth-child(4) { animation-delay: 0.1s; }
  .dot-matrix.wave > div:nth-child(3), .dot-matrix.wave > div:nth-child(5), .dot-matrix.wave > div:nth-child(7) { animation-delay: 0.2s; }
  .dot-matrix.wave > div:nth-child(6), .dot-matrix.wave > div:nth-child(8) { animation-delay: 0.3s; }
  .dot-matrix.wave > div:nth-child(9) { animation-delay: 0.4s; }

  /* 4. LOADING */
  @keyframes anim-loading {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; opacity: 0.4; }
    20% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); opacity: 1; }
  }
  .dot-matrix.loading > div { animation: anim-loading 1.2s infinite linear; }
  .dot-matrix.loading > div:nth-child(5) { animation: none; background-color: var(--dot-center-bg); }
  .dot-matrix.loading > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.loading > div:nth-child(2) { animation-delay: 0.15s; }
  .dot-matrix.loading > div:nth-child(3) { animation-delay: 0.3s; }
  .dot-matrix.loading > div:nth-child(6) { animation-delay: 0.45s; }
  .dot-matrix.loading > div:nth-child(9) { animation-delay: 0.6s; }
  .dot-matrix.loading > div:nth-child(8) { animation-delay: 0.75s; }
  .dot-matrix.loading > div:nth-child(7) { animation-delay: 0.9s; }
  .dot-matrix.loading > div:nth-child(4) { animation-delay: 1.05s; }

  /* 5. GROWING */
  @keyframes dot-1-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    22.86% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    57.14% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    71.43% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-2-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    28.57% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    37.14% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    71.43% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-3-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    28.57% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    42.86% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    51.43% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-4-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    7.50% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    37.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    45.00% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    75.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    87.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-5-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    12.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    20.00% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    50.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    57.50% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    87.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-6-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    12.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    25.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    32.50% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    62.50% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    70.00% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-7-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    22.86% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    57.14% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    71.43% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-8-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    28.57% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    37.14% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    71.43% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  @keyframes dot-9-arrowmove {
    0.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    14.29% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    28.57% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    42.86% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: ease-in; }
    51.43% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1); animation-timing-function: ease-out; }
    85.71% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); animation-timing-function: linear; }
    100.00% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
  }
  .dot-matrix.growing > div {
    animation-duration: 1750ms;
    animation-iteration-count: infinite;
  }
  .dot-matrix.growing > div:nth-child(1) { animation-name: dot-1-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(2) { animation-name: dot-2-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(3) { animation-name: dot-3-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(4) { animation-name: dot-4-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(5) { animation-name: dot-5-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(6) { animation-name: dot-6-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(7) { animation-name: dot-7-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(8) { animation-name: dot-8-arrowmove; animation-delay: 0s; }
  .dot-matrix.growing > div:nth-child(9) { animation-name: dot-9-arrowmove; animation-delay: 0s; }
</style>
</head>
<body>
  <div class="dot-matrix-wrapper">
    <div class="dot-matrix ${values.animType}">
      <div></div><div></div><div></div>
      <div></div><div></div><div></div>
      <div></div><div></div><div></div>
    </div>
  </div>
</body>
</html>`;
  }
};