// Gesture scene — WebGL grainient backdrop + word-by-word reveal.
// Adapted from cko-demo-motion/script.js (ensureGestureGrainient + applyGestureStateAt).

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function buildSchedule(lines, intro, stagger, hold, exit, breath) {
  let cursor = intro;
  return lines.map((text) => {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lineIn = cursor;
    const wordTimes = words.map((_, i) => lineIn + i * stagger);
    const lastWordIn = wordTimes[wordTimes.length - 1] ?? lineIn;
    const holdEnd = lastWordIn + hold;
    const lineExit = holdEnd + exit;
    cursor = lineExit + breath;
    return { text, words, lineIn, wordTimes, holdEnd, lineExit };
  });
}

export default {
  id: 'gesture',
  name: 'Gesture',
  description: 'WebGL grainient backdrop with a word-by-word reveal across multiple lines.',

  settings: [
    { id: 'intro',   label: 'Intro delay',  type: 'range', min: 0,   max: 2000, step: 50,  default: 600, unit: 'ms' },
    { id: 'stagger', label: 'Word stagger', type: 'range', min: 60,  max: 500,  step: 10,  default: 220, unit: 'ms' },
    { id: 'hold',    label: 'Line hold',    type: 'range', min: 200, max: 2400, step: 50,  default: 900, unit: 'ms' },
    { id: 'exit',    label: 'Line exit',    type: 'range', min: 100, max: 1500, step: 50,  default: 500, unit: 'ms' },
    { id: 'breath',  label: 'Line breath',  type: 'range', min: 0,   max: 800,  step: 20,  default: 180, unit: 'ms' },
    { id: 'outro',   label: 'Outro',        type: 'range', min: 0,   max: 2000, step: 50,  default: 600, unit: 'ms' },
    { id: 'gradientSpeed', label: 'Gradient speed', type: 'range', min: 0, max: 200, step: 5, default: 35, unit: '%' },
    { id: 'color1', label: 'Gradient color 1', type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'color2', label: 'Gradient color 2', type: 'color', default: '--slds-g-color-palette-violet-80' },
    { id: 'color3', label: 'Gradient color 3', type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'colorBalance', label: 'Color balance', type: 'range', min: -1, max: 1, step: 0.01, default: -0.05, unit: '' },
    { id: 'warpStrength', label: 'Warp strength', type: 'range', min: 0, max: 5, step: 0.1, default: 1, unit: '' },
    { id: 'warpFrequency', label: 'Warp frequency', type: 'range', min: 0, max: 20, step: 0.1, default: 4, unit: '' },
    { id: 'warpSpeed', label: 'Warp speed', type: 'range', min: 0, max: 5, step: 0.1, default: 0.8, unit: '' },
    { id: 'warpAmplitude', label: 'Warp amplitude', type: 'range', min: 0, max: 200, step: 1, default: 50, unit: '' },
    { id: 'blendAngle', label: 'Blend angle', type: 'range', min: -3.14, max: 3.14, step: 0.01, default: 0, unit: 'rad' },
    { id: 'blendSoftness', label: 'Blend softness', type: 'range', min: 0, max: 1, step: 0.01, default: 0.05, unit: '' },
    { id: 'rotationAmount', label: 'Rotation amount', type: 'range', min: 0, max: 1000, step: 10, default: 500, unit: '' },
    { id: 'noiseScale', label: 'Noise scale', type: 'range', min: 0, max: 5, step: 0.1, default: 0.8, unit: '' },
    { id: 'grainAmount', label: 'Grain amount', type: 'range', min: 0, max: 1, step: 0.01, default: 0, unit: '' },
    { id: 'grainScale', label: 'Grain scale', type: 'range', min: 0, max: 2, step: 0.01, default: 0.2, unit: '' },
    { id: 'grainAnimated', label: 'Grain animated', type: 'toggle', default: false },
    { id: 'contrast', label: 'Contrast', type: 'range', min: 0.5, max: 2, step: 0.01, default: 1.1, unit: '' },
    { id: 'gamma', label: 'Gamma', type: 'range', min: 0.5, max: 2, step: 0.01, default: 1.1, unit: '' },
    { id: 'saturation', label: 'Saturation', type: 'range', min: 0, max: 2, step: 0.01, default: 1, unit: '' },
    { id: 'centerX', label: 'Center X', type: 'range', min: -1, max: 1, step: 0.01, default: 0, unit: '' },
    { id: 'centerY', label: 'Center Y', type: 'range', min: -1, max: 1, step: 0.01, default: 0, unit: '' },
    { id: 'zoom', label: 'Zoom', type: 'range', min: 0.1, max: 5, step: 0.01, default: 0.9, unit: '' },
  ],

  copy: [
    { id: 'lines', label: 'Lines (one per row)', type: 'text-list', default: [
      'Composing the experience',
      'Wiring your channels',
      'Tuning the tone of voice',
      'Indexing your knowledge',
      'Almost ready',
    ] },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-gesture');

    const bg = document.createElement('div');
    bg.className = 'scene-gesture-bg';

    const overlay = document.createElement('div');
    overlay.className = 'scene-gesture-overlay';

    const title = document.createElement('h1');
    title.className = 'scene-gesture-title';

    overlay.appendChild(title);
    host.append(bg, overlay);

    let grainient = null;
    function tokenToHex(token) {
      const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
      return v || '#0176D3';
    }
    function hexToRgbUnit(hex) {
      const m = (hex || '').match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (!m) return [1, 1, 1];
      return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
    }
    function setUniformColor(uniformName, hex) {
      const u = grainient && grainient.program && grainient.program.uniforms[uniformName];
      if (!u || !u.value) return;
      const [r, g, b] = hexToRgbUnit(hex);
      u.value[0] = r; u.value[1] = g; u.value[2] = b;
    }
    function ensureGrainient() {
      if (grainient) return grainient;
      if (!window.Grainient) return null;
      const v = getValues();
      grainient = new window.Grainient(bg, {
        color1: tokenToHex(v.color1),
        color2: tokenToHex(v.color2),
        color3: tokenToHex(v.color3),
        timeSpeed: v.gradientSpeed / 100,
        colorBalance: v.colorBalance,
        warpStrength: v.warpStrength,
        warpFrequency: v.warpFrequency,
        warpSpeed: v.warpSpeed,
        warpAmplitude: v.warpAmplitude,
        blendAngle: v.blendAngle,
        blendSoftness: v.blendSoftness,
        rotationAmount: v.rotationAmount,
        noiseScale: v.noiseScale,
        grainAmount: v.grainAmount,
        grainScale: v.grainScale,
        grainAnimated: v.grainAnimated,
        contrast: v.contrast,
        gamma: v.gamma,
        saturation: v.saturation,
        centerX: v.centerX,
        centerY: v.centerY,
        zoom: v.zoom,
      });
      grainient.start();
      return grainient;
    }
    // Defer grainient until first renderAt — by then ogl module has loaded.

    let lastSchedule = null;
    let lastLinesKey = null;

    function renderAt(t) {
      ensureGrainient();
      const v = getValues();

      // Re-apply grainient colors / speed by patching the WebGL uniforms in
      // place — assigning to grainient.colorN doesn't touch the shader.
      if (grainient && grainient.program) {
        setUniformColor('uColor1', tokenToHex(v.color1));
        setUniformColor('uColor2', tokenToHex(v.color2));
        setUniformColor('uColor3', tokenToHex(v.color3));
        const speedU = grainient.program.uniforms.uTimeSpeed;
        if (speedU) speedU.value = v.gradientSpeed / 100;
      }

      const lines = Array.isArray(v.lines) ? v.lines : [];
      const linesKey = JSON.stringify([lines, v.intro, v.stagger, v.hold, v.exit, v.breath]);
      if (linesKey !== lastLinesKey) {
        lastSchedule = buildSchedule(lines, v.intro, v.stagger, v.hold, v.exit, v.breath);
        lastLinesKey = linesKey;
      }

      let active = null;
      let revealed = false;
      for (const line of lastSchedule) {
        if (t >= line.lineIn && t < line.lineExit) {
          active = line;
          revealed = t < line.holdEnd;
          break;
        }
      }

      const currentText = title.dataset.line || '';
      if (active) {
        if (currentText !== active.text) {
          clearChildren(title);
          for (const w of active.words) {
            const span = document.createElement('span');
            span.className = 'scene-gesture-word';
            span.textContent = w;
            title.appendChild(span);
          }
          title.dataset.line = active.text;
        }
        const spans = title.querySelectorAll('.scene-gesture-word');
        active.wordTimes.forEach((wt, i) => {
          const shouldReveal = revealed && t >= wt;
          if (spans[i]) spans[i].classList.toggle('is-revealed', shouldReveal);
        });
      } else if (currentText) {
        clearChildren(title);
        title.dataset.line = '';
      }
    }

    function getTotal() {
      const v = getValues();
      const lines = Array.isArray(v.lines) ? v.lines : [];
      const sched = buildSchedule(lines, v.intro, v.stagger, v.hold, v.exit, v.breath);
      const last = sched[sched.length - 1];
      return (last ? last.lineExit : 0) + v.outro;
    }
    function getMarks() {
      const v = getValues();
      const lines = Array.isArray(v.lines) ? v.lines : [];
      return buildSchedule(lines, v.intro, v.stagger, v.hold, v.exit, v.breath).map((l) => l.lineIn);
    }

    function destroy() {
      if (grainient && grainient.stop) {
        try { grainient.stop(); } catch (_) {}
      }
      grainient = null;
      clearChildren(host);
      host.classList.remove('scene-gesture');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },
};
