// Process Steps scene — three sequential thinking-log lines.
// Adapted from cko-demo-motion/script.js (applyProcessStepsStateAt + helpers).

const SPARKLE_GLYPH_SRC = 'assets/scenes/sparkle-sf.png';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// Cubic-bezier evaluator (Newton-Raphson). Same shape as the source.
function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX  = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY  = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const cur = sampleX(t) - x;
      if (Math.abs(cur) < 1e-5) break;
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= cur / dx;
    }
    return sampleY(t);
  };
}
const easeEnter      = cubicBezier(0.32, 0.72, 0,    1);
const easeExit       = cubicBezier(0.6,  0,    0.78, 0);
const easePopUp      = cubicBezier(0.34, 1.56, 0.64, 1);
const easePopBack    = cubicBezier(0.4,  0,    0.6,  1);
const easeInOutCubic = cubicBezier(0.4,  0,    0.6,  1);

const clamp01 = (p) => p < 0 ? 0 : p > 1 ? 1 : p;

export default {
  id: 'process-steps',
  name: 'Process Steps',
  description: 'Three sequential thinking-log lines: enter → shimmer → check pop → exit.',
  why: 'Builds trust by exposing the "chain of thought." Users tolerate longer waits if they see what is happening.',
  howToUse: 'When generating a large document, drafting an email, or running a complex workflow.',

  settings: [
    { id: 'enterDur',     label: 'Enter (steps 2–3)', type: 'range', min: 80,  max: 600,  step: 10, default: 220,  unit: 'ms' },
    { id: 'enterDurStep1', label: 'Enter (step 1)',   type: 'range', min: 100, max: 800,  step: 10, default: 340,  unit: 'ms' },
    { id: 'enterTyStep1',  label: 'Step 1 enter slide', type: 'range', min: 0,  max: 160, step: 2,  default: 80,   unit: 'px' },
    { id: 'workingDur',   label: 'Working (shimmer)',  type: 'range', min: 600, max: 4000, step: 50, default: 1800, unit: 'ms' },
    { id: 'settleDur',    label: 'Settle (sparkle→check)', type: 'range', min: 120, max: 800, step: 10, default: 280, unit: 'ms' },
    { id: 'exitDur',      label: 'Exit',               type: 'range', min: 80,  max: 600,  step: 10, default: 220,  unit: 'ms' },
    { id: 'gap',          label: 'Step gap',           type: 'range', min: 0,   max: 600,  step: 10, default: 180,  unit: 'ms' },
    { id: 'tail',         label: 'Tail buffer',        type: 'range', min: 0,   max: 800,  step: 20, default: 200,  unit: 'ms' },
    { id: 'textColor',    label: 'Text color',         type: 'color', default: '--slds-g-color-neutral-base-30' },
    { id: 'shimmerColor', label: 'Shimmer accent',     type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'textColor',    label: 'Text color',         type: 'color', default: '--slds-g-color-neutral-base-30' },
    { id: 'shimmerColor', label: 'Shimmer accent',     type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'sparkleColor', label: 'Sparkle color',      type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'checkColor',   label: 'Check color',        type: 'color', default: '--slds-g-color-success-base-50' },
    { id: 'enterTy',      label: 'Enter TY default',   type: 'range', min: 0,   max: 100, step: 1, default: 14,   unit: 'px' },
    { id: 'exitTy',       label: 'Exit TY default',    type: 'range', min: 0,   max: 100, step: 1, default: 14,   unit: 'px' },
    { id: 'enterScale',   label: 'Enter scale from',   type: 'range', min: 0.5, max: 1.5, step: 0.001, default: 0.985, unit: '' },
    { id: 'exitScale',    label: 'Exit scale to',      type: 'range', min: 0.5, max: 1.5, step: 0.001, default: 1.005, unit: '' },
    { id: 'sparkleScaleAmp',   label: 'Sparkle wobble amp', type: 'range', min: 0, max: 0.2, step: 0.01, default: 0.03, unit: '' },
    { id: 'sparkleWobbleFreq', label: 'Sparkle wobble freq', type: 'range', min: 0, max: 5, step: 0.1, default: 1.2, unit: '' },
    { id: 'sparkleFadeEnd',    label: 'Sparkle fade end', type: 'range', min: 0, max: 1, step: 0.01, default: 0.70, unit: '' },
    { id: 'sparkleMinScale',   label: 'Sparkle min scale', type: 'range', min: 0, max: 2, step: 0.01, default: 0.70, unit: '' },
    { id: 'checkAppearStart',  label: 'Check appear start', type: 'range', min: 0, max: 1, step: 0.01, default: 0.30, unit: '' },
    { id: 'checkPopPeak',      label: 'Check pop peak', type: 'range', min: 0, max: 1, step: 0.01, default: 0.50, unit: '' },
    { id: 'checkPopScale',     label: 'Check pop scale', type: 'range', min: 1, max: 2, step: 0.01, default: 1.08, unit: '' },
  ],

  copy: [
    { id: 'steps', label: 'Steps (1, 2, 3)', type: 'text-list', default: [
      'Reading your knowledge base',
      'Drafting agent personality',
      'Connecting your channels',
    ] },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-process-steps');

    const stage = document.createElement('ol');
    stage.className = 'scene-process-stage';
    host.appendChild(stage);

    function buildRows() {
      clearChildren(stage);
      const v = getValues();
      const steps = Array.isArray(v.steps) ? v.steps : [];
      steps.forEach((text, i) => {
        const row = document.createElement('li');
        row.className = 'scene-process-row';
        row.dataset.step = String(i);
        row.dataset.phase = 'idle';

        // Apply shimmer color via inline CSS variables
        row.style.setProperty('--shimmer-color', `var(${v.shimmerColor}, ${v.shimmerColor})`);

        const glyph = document.createElement('span');
        glyph.className = 'scene-process-glyph';

        const sparkleNS = 'http://www.w3.org/2000/svg';
        const sparkle = document.createElementNS(sparkleNS, 'svg');
        sparkle.setAttribute('class', 'scene-process-sparkle');
        sparkle.setAttribute('viewBox', '0 0 1000 1000');
        const spath = document.createElementNS(sparkleNS, 'path');
        spath.setAttribute('d', 'm611 515-85 42c-25 13-46 34-59 59l-42 85c-6 12-24 12-30 0l-42-85c-13-25-33-46-59-59l-85-42c-12-6-12-24 0-30l85-42c26-13 46-33 59-59l42-85c6-12 24-12 30 0l42 85c13 26 34 46 59 59l85 43c12 6 12 23 0 29m185 189-36-19c-11-5-20-14-26-25l-18-36c-2-5-10-5-12 0l-19 36c-5 11-14 20-25 26l-36 18c-6 2-6 10 0 12l36 19c11 5 20 14 25 25l19 36c2 5 10 5 12 0l18-36c6-11 15-20 26-25l36-19c5-2 5-10 0-12');
        spath.setAttribute('fill', 'currentColor');
        
        sparkle.style.color = `var(${v.sparkleColor}, ${v.sparkleColor})`;
        sparkle.appendChild(spath);

        const checkNS = 'http://www.w3.org/2000/svg';
        const check = document.createElementNS(checkNS, 'svg');
        check.setAttribute('class', 'scene-process-check');
        check.setAttribute('viewBox', '0 0 14 14');
        const path = document.createElementNS(checkNS, 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.6');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('d', 'm3 7.5 2.6 2.6L11 4.4');
        check.appendChild(path);

        check.style.color = `var(${v.checkColor}, ${v.checkColor})`;
        glyph.append(sparkle, check);

        const textEl = document.createElement('span');
        textEl.className = 'scene-process-text';
        textEl.textContent = text;
        textEl.style.color = `var(${v.textColor}, ${v.textColor})`;

        row.append(glyph, textEl);
        stage.appendChild(row);
      });
    }
    buildRows();

    let lastStepsKey = '';

    function stepDur(i, v) {
      const enter = i === 0 ? v.enterDurStep1 : v.enterDur;
      return enter + v.workingDur + v.settleDur + v.exitDur;
    }
    function stepStarts(v, count) {
      const out = [0];
      for (let i = 1; i < count; i++) {
        out.push(out[i - 1] + stepDur(i - 1, v) + v.gap);
      }
      return out;
    }

    function renderAt(t) {
      const v = getValues();
      const steps = Array.isArray(v.steps) ? v.steps : [];

      // Rebuild row DOM if step copy changes.
      const stepsKey = JSON.stringify(steps);
      if (stepsKey !== lastStepsKey) {
        buildRows();
        lastStepsKey = stepsKey;
      }

      const rows = stage.querySelectorAll('.scene-process-row');
      const starts = stepStarts(v, rows.length);

      // Apply colors at the host scope.
      host.style.setProperty('--shiny-base', `var(${v.textColor})`);
      host.style.setProperty('--shiny-shine', `var(${v.shimmerColor})`);

      rows.forEach((row, i) => {
        const dt = t - starts[i];
        const enterDur = i === 0 ? v.enterDurStep1 : v.enterDur;
        const enterTy = i === 0 ? v.enterTyStep1 : v.enterTy;

        let opacity = 0;
        let ty = enterTy;
        let scale = v.enterScale;
        let phase = 'idle';
        let shimmer = false;
        let sparkleOpacity = 1;
        let sparkleScale = 1;
        let checkOpacity = 0;
        let checkScale = 1;

        if (dt < 0) {
          // pre-enter — defaults
        } else if (dt < enterDur) {
          const p = easeEnter(dt / enterDur);
          opacity = p;
          ty = enterTy * (1 - p);
          scale = v.enterScale + (1 - v.enterScale) * p;
          phase = 'enter';
        } else {
          const dt2 = dt - enterDur;
          if (dt2 < v.workingDur) {
            opacity = 1;
            ty = 0;
            scale = 1;
            phase = 'working';
            shimmer = true;
            const wp = dt2 / v.workingDur;
            sparkleScale = 1 + v.sparkleScaleAmp * Math.sin(wp * Math.PI * v.sparkleWobbleFreq);
          } else if (dt2 < v.workingDur + v.settleDur) {
            opacity = 1;
            ty = 0;
            scale = 1;
            phase = 'settle';
            const sp = (dt2 - v.workingDur) / v.settleDur;

            if (sp < v.sparkleFadeEnd) {
              const k = sp / v.sparkleFadeEnd;
              sparkleOpacity = 1 - easeInOutCubic(k);
              sparkleScale = 1 - (1 - v.sparkleMinScale) * k;
            } else {
              sparkleOpacity = 0;
              sparkleScale = v.sparkleMinScale;
            }
            if (sp < v.checkAppearStart) {
              checkOpacity = 0;
            } else {
              const k = (sp - v.checkAppearStart) / (1 - v.checkAppearStart);
              checkOpacity = easeInOutCubic(k);
            }
            if (sp < v.checkPopPeak) {
              const k = sp / v.checkPopPeak;
              checkScale = 1.0 + (v.checkPopScale - 1.0) * easePopUp(k);
            } else {
              const k = (sp - v.checkPopPeak) / (1 - v.checkPopPeak);
              checkScale = v.checkPopScale - (v.checkPopScale - 1.0) * easePopBack(k);
            }
          } else if (dt2 < v.workingDur + v.settleDur + v.exitDur) {
            const ep = (dt2 - v.workingDur - v.settleDur) / v.exitDur;
            const eo = easeExit(ep);
            opacity = 1 - eo;
            ty = -v.exitTy * eo;
            scale = 1 + (v.exitScale - 1) * eo;
            phase = 'exit';
            sparkleOpacity = 0;
            sparkleScale = v.sparkleMinScale;
            checkOpacity = 1 - eo;
            checkScale = 1;
          } else {
            opacity = 0;
            ty = -v.exitTy;
            scale = v.exitScale;
            phase = 'done';
            sparkleOpacity = 0;
            checkOpacity = 0;
            checkScale = 1;
          }
        }

        row.style.opacity = String(opacity);
        row.style.transform = `translateY(${ty}px) scale(${scale})`;
        row.dataset.phase = phase;
        row.classList.toggle('is-shimmer', shimmer);

        const sparkleEl = row.querySelector('.scene-process-sparkle');
        if (sparkleEl) {
          sparkleEl.style.opacity = String(clamp01(sparkleOpacity));
          sparkleEl.style.transform = `scale(${sparkleScale})`;
        }
        const checkEl = row.querySelector('.scene-process-check');
        if (checkEl) {
          checkEl.style.opacity = String(clamp01(checkOpacity));
          checkEl.style.transform = `scale(${checkScale})`;
        }
      });
    }

    function getTotal() {
      const v = getValues();
      const count = Array.isArray(v.steps) ? v.steps.length : 0;
      if (!count) return 1000;
      const starts = stepStarts(v, count);
      return starts[count - 1] + stepDur(count - 1, v) + v.tail;
    }
    function getMarks() {
      const v = getValues();
      const count = Array.isArray(v.steps) ? v.steps.length : 0;
      return stepStarts(v, count);
    }

    function destroy() {
      clearChildren(host);
      host.classList.remove('scene-process-steps');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },
};

function tokenToHex(token, fallback) {
  if (!token) return fallback;
  if (token.startsWith('#')) return token;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v || fallback;
}
