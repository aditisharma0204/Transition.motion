import { tokenToHex } from './lottie-tint.js';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

const animationOptions = [
  { value: 'pulse', label: 'Pulse' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'wave', label: 'Wave' },
  { value: 'loading', label: 'Loading' },
  { value: 'growing', label: 'Growing' },
  { value: 'spiral', label: 'Spiral' },
  { value: 'cascade', label: 'Cascade' }
];

export default {
  id: 'morph',
  name: 'Morph',
  description: 'Design multi-step AI loading sequences by chaining Dot Matrix animations.',
  loop: true,

  settings: [
    { id: 'step1', label: 'Step 1', type: 'select', default: 'growing', options: animationOptions },
    { id: 'step2', label: 'Step 2', type: 'select', default: 'pulse', options: animationOptions },
    { id: 'step3', label: 'Step 3', type: 'select', default: 'cascade', options: animationOptions },
    { id: 'stepDuration', label: 'Step Duration (ms)', type: 'range', min: 500, max: 4000, step: 100, default: 2000 },
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

    let matrix = document.createElement('div');
    matrix.className = 'dot-matrix';

    for (let i = 0; i < 9; i++) {
      matrix.appendChild(document.createElement('div'));
    }

    wrapper.appendChild(matrix);
    host.appendChild(wrapper);

    let currentStepIndex = -1;

    function renderAt(t) {
      const v = getValues();
      
      // Update variables
      matrix.style.setProperty('--dot-base', `var(${v.baseColor}, ${v.baseColor})`);
      matrix.style.setProperty('--dot-glow', v.showGlow ? `var(${v.glowColor}, ${v.glowColor})` : `var(${v.baseColor}, ${v.baseColor})`);
      matrix.style.setProperty('--dot-shadow', v.showShadow ? `var(${v.shadowColor}, ${v.shadowColor})` : 'transparent');
      matrix.style.setProperty('--dot-center-bg', `var(${v.centerBg}, ${v.centerBg})`);
      
      const stepDuration = Number(v.stepDuration) || 2000;
      
      // Determine which step we are on based on time t
      let stepIndex = Math.floor(t / stepDuration);
      if (stepIndex > 2) stepIndex = 2;
      if (t >= stepDuration * 3) stepIndex = 0;
      
      if (stepIndex !== currentStepIndex) {
        currentStepIndex = stepIndex;
        let animClass = '';
        if (stepIndex === 0) animClass = v.step1;
        else if (stepIndex === 1) animClass = v.step2;
        else if (stepIndex === 2) animClass = v.step3;
        
        matrix.className = `dot-matrix ${animClass}`;
        
        // Deep clone the matrix to physically replace the DOM node.
        // This is the absolute most reliable way to force CSS animations to restart from 0s.
        const newMatrix = matrix.cloneNode(true);
        wrapper.replaceChild(newMatrix, matrix);
        matrix = newMatrix;
      }
    }

    function getTotal() { 
      const v = getValues();
      const stepDuration = Number(v.stepDuration) || 2000;
      return stepDuration * 3; 
    }
    
    function getMarks() { 
      const v = getValues();
      const stepDuration = Number(v.stepDuration) || 2000;
      return [stepDuration, stepDuration * 2]; 
    }

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
    const stepDuration = Number(values.stepDuration) || 2000;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Morph Sequence — exported</title>
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

  /* 1. PULSE (Staggered) */
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
  .dot-matrix.loading > div:nth-child(5) { animation: none; background-color: var(--dot-center-bg, #1a1a1a); }
  .dot-matrix.loading > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.loading > div:nth-child(2) { animation-delay: 0.15s; }
  .dot-matrix.loading > div:nth-child(3) { animation-delay: 0.3s; }
  .dot-matrix.loading > div:nth-child(6) { animation-delay: 0.45s; }
  .dot-matrix.loading > div:nth-child(9) { animation-delay: 0.6s; }
  .dot-matrix.loading > div:nth-child(8) { animation-delay: 0.75s; }
  .dot-matrix.loading > div:nth-child(7) { animation-delay: 0.9s; }
  .dot-matrix.loading > div:nth-child(4) { animation-delay: 1.05s; }

  /* 5. GROWING (ArrowMove) */
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

  /* 6. SPIRAL */
  @keyframes anim-spiral {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; transform: scale(1); }
    30% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: scale(1.15); }
  }
  .dot-matrix.spiral > div { animation: anim-spiral 1.5s infinite ease-in-out; }
  .dot-matrix.spiral > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.spiral > div:nth-child(2) { animation-delay: 0.1s; }
  .dot-matrix.spiral > div:nth-child(3) { animation-delay: 0.2s; }
  .dot-matrix.spiral > div:nth-child(6) { animation-delay: 0.3s; }
  .dot-matrix.spiral > div:nth-child(9) { animation-delay: 0.4s; }
  .dot-matrix.spiral > div:nth-child(8) { animation-delay: 0.5s; }
  .dot-matrix.spiral > div:nth-child(7) { animation-delay: 0.6s; }
  .dot-matrix.spiral > div:nth-child(4) { animation-delay: 0.7s; }
  .dot-matrix.spiral > div:nth-child(5) { animation-delay: 0.8s; }

  /* 7. CASCADE (Diagonal Wipe) */
  @keyframes anim-cascade {
    0%, 100% { background-color: var(--dot-base); box-shadow: none; transform: translateY(0); }
    50% { background-color: var(--dot-glow); box-shadow: 0 0 10px 0 var(--dot-shadow); transform: translateY(-3px); }
  }
  .dot-matrix.cascade > div { animation: anim-cascade 1.5s infinite ease-in-out; }
  .dot-matrix.cascade > div:nth-child(1) { animation-delay: 0s; }
  .dot-matrix.cascade > div:nth-child(2), .dot-matrix.cascade > div:nth-child(4) { animation-delay: 0.15s; }
  .dot-matrix.cascade > div:nth-child(3), .dot-matrix.cascade > div:nth-child(5), .dot-matrix.cascade > div:nth-child(7) { animation-delay: 0.3s; }
  .dot-matrix.cascade > div:nth-child(6), .dot-matrix.cascade > div:nth-child(8) { animation-delay: 0.45s; }
  .dot-matrix.cascade > div:nth-child(9) { animation-delay: 0.6s; }
</style>
</head>
<body>
  <div class="dot-matrix-wrapper">
    <div class="dot-matrix" id="matrix">
      <div></div><div></div><div></div>
      <div></div><div></div><div></div>
      <div></div><div></div><div></div>
    </div>
  </div>
  <script>
    const steps = [
      '${values.step1}',
      '${values.step2}',
      '${values.step3}'
    ];
    const stepDuration = ${stepDuration};
    const matrix = document.getElementById('matrix');
    
    let currentStep = 0;
    
    function updateStep() {
      matrix.className = 'dot-matrix ' + steps[currentStep];
      
      for (const child of matrix.children) {
        child.style.animation = 'none';
      }
      void matrix.offsetWidth;
      for (const child of matrix.children) {
        child.style.animation = '';
      }
      
      currentStep = (currentStep + 1) % steps.length;
    }
    
    // Initial run
    updateStep();
    
    // Loop
    setInterval(updateStep, stepDuration);
  </script>
</body>
</html>`;
  }
};