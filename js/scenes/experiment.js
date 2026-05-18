import { tokenToHex } from './lottie-tint.js';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'experiment',
  name: 'Experiment',
  description: 'Experimental AI microinteractions with complex CSS keyframes.',
  loop: true,

  settings: [
    { id: 'animType', label: 'Animation Type', type: 'select', default: 'core', options: [
      { value: 'core', label: 'The Core' },
      { value: 'orbital', label: 'Orbital Processing' }
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
<title>Experiment — exported</title>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #000;
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

  /* 9. THE CORE (Structural Implosion/Explosion) */
  @keyframes anim-core {
    0%, 15% { transform: translate(0, 0) scale(1); background-color: var(--dot-base); border-radius: 2px; box-shadow: none; }
    50% { transform: translate(var(--x), var(--y)) scale(1.2); background-color: var(--dot-glow); border-radius: 50%; box-shadow: 0 0 15px 0 var(--dot-shadow); }
    85%, 100% { transform: translate(0, 0) scale(1); background-color: var(--dot-base); border-radius: 2px; box-shadow: none; }
  }
  .dot-matrix.core > div { animation: anim-core 2.5s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55); }
  .dot-matrix.core > div:nth-child(1) { --x: 15px;  --y: 15px;  }
  .dot-matrix.core > div:nth-child(2) { --x: 0px;   --y: 15px;  }
  .dot-matrix.core > div:nth-child(3) { --x: -15px; --y: 15px;  }
  .dot-matrix.core > div:nth-child(4) { --x: 15px;  --y: 0px;   }
  .dot-matrix.core > div:nth-child(5) { --x: 0px;   --y: 0px;   }
  .dot-matrix.core > div:nth-child(6) { --x: -15px; --y: 0px;   }
  .dot-matrix.core > div:nth-child(7) { --x: 15px;  --y: -15px; }
  .dot-matrix.core > div:nth-child(8) { --x: 0px;   --y: -15px; }
  .dot-matrix.core > div:nth-child(9) { --x: -15px; --y: -15px; }

  /* 10. ORBITAL PROCESSING (Rotation + Opacity Flow) */
  @keyframes rotate-grid {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes anim-orbital {
    0%, 100% { transform: scale(0.6); opacity: 0.2; background-color: var(--dot-base); box-shadow: none; }
    50% { transform: scale(1.2); opacity: 1; background-color: var(--dot-glow); box-shadow: 0 0 12px 0 var(--dot-shadow); border-radius: 50%; }
  }
  .dot-matrix.orbital { animation: rotate-grid 6s infinite linear; }
  .dot-matrix.orbital > div { animation: anim-orbital 2s infinite ease-in-out; }
  .dot-matrix.orbital > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.orbital > div:nth-child(2) { animation-delay: 0.2s; }
  .dot-matrix.orbital > div:nth-child(3) { animation-delay: 0.4s; }
  .dot-matrix.orbital > div:nth-child(6) { animation-delay: 0.6s; }
  .dot-matrix.orbital > div:nth-child(9) { animation-delay: 0.8s; }
  .dot-matrix.orbital > div:nth-child(8) { animation-delay: 1.0s; }
  .dot-matrix.orbital > div:nth-child(7) { animation-delay: 1.2s; }
  .dot-matrix.orbital > div:nth-child(4) { animation-delay: 1.4s; }
  .dot-matrix.orbital > div:nth-child(5) { animation: anim-orbital 3s infinite ease-in-out; animation-delay: 0s; }
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