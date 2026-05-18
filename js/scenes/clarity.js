// Clarity scene — Lottie blur + crossfading captions.
// Adapted from cko-demo-motion/script.js (initClarityLottie + applyClarityStateAt).

const CLARITY_LOTTIE_PATH = 'assets/scenes/fixed-blur.json';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'clarity',
  name: 'Clarity',
  description: 'Lottie blur resolves into focus while three lines of copy fade through.',

  settings: [
    { id: 'total',     label: 'Total duration', type: 'range', min: 3000, max: 12000, step: 100, default: 7100, unit: 'ms' },
    { id: 'line1In',   label: 'Line 1 in',      type: 'range', min: 0,    max: 4000,  step: 50,  default: 600,  unit: 'ms' },
    { id: 'line1Out',  label: 'Line 1 out',     type: 'range', min: 200,  max: 4500,  step: 50,  default: 2100, unit: 'ms' },
    { id: 'line2In',   label: 'Line 2 in',      type: 'range', min: 1000, max: 5500,  step: 50,  default: 2500, unit: 'ms' },
    { id: 'line2Out',  label: 'Line 2 out',     type: 'range', min: 1500, max: 6500,  step: 50,  default: 4000, unit: 'ms' },
    { id: 'line3In',   label: 'Line 3 in',      type: 'range', min: 3000, max: 7500,  step: 50,  default: 4400, unit: 'ms' },
    { id: 'line3Out',  label: 'Line 3 out',     type: 'range', min: 4000, max: 9000,  step: 50,  default: 5900, unit: 'ms' },
    { id: 'resolveAt', label: 'Resolve at',     type: 'range', min: 4000, max: 11000, step: 100, default: 6300, unit: 'ms' },
    { id: 'hueRotate', label: 'Hue Rotate',   type: 'range', min: 0, max: 360, step: 1, default: 0, unit: 'deg' },
    { id: 'saturate',  label: 'Saturation',   type: 'range', min: 0, max: 200, step: 1, default: 100, unit: '%' },
    { id: 'captionSize',  label: 'Caption size',  type: 'range', min: 14, max: 36, step: 1, default: 20, unit: 'px' },
    { id: 'captionColor', label: 'Caption color', type: 'color', default: '--slds-g-color-info-base-20' },
  ],

  copy: [
    { id: 'lines', label: 'Lines (in order)', type: 'text-list', default: [
      'Preparing your AI-powered support experience',
      'Your intelligent agent is on its way',
      'Setting the stage for smarter service',
    ] },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-clarity');

    const blurEl = document.createElement('div');
    blurEl.className = 'scene-clarity-blur';

    const captionEl = document.createElement('p');
    captionEl.className = 'scene-clarity-caption';

    host.append(blurEl, captionEl);

    let lottieAnim = null;
    function ensureLottie() {
      if (lottieAnim) return lottieAnim;
      if (typeof window.lottie === 'undefined') return null;
      try {
        lottieAnim = window.lottie.loadAnimation({
          container: blurEl,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: CLARITY_LOTTIE_PATH,
          rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true },
        });
      } catch (e) {
        console.error('[clarity lottie load error]', e);
        lottieAnim = null;
      }
      return lottieAnim;
    }
    ensureLottie();

    function renderAt(t) {
      const v = getValues();
      const total = v.total;

      host.classList.toggle('is-developing', t >= 0);
      host.classList.toggle('is-resolved', t >= v.resolveAt);

      const lines = Array.isArray(v.lines) ? v.lines : [];
      let lineText = '';
      if (t >= v.line1In && t < v.line1Out) lineText = lines[0] || '';
      else if (t >= v.line2In && t < v.line2Out) lineText = lines[1] || '';
      else if (t >= v.line3In && t < v.line3Out) lineText = lines[2] || '';

      if (lineText) {
        if (captionEl.textContent !== lineText) captionEl.textContent = lineText;
        captionEl.classList.add('is-visible');
      } else {
        captionEl.classList.remove('is-visible');
      }
      captionEl.style.color = `var(${v.captionColor})`;
      captionEl.style.fontSize = `${v.captionSize}px`;

      blurEl.style.filter = `hue-rotate(${v.hueRotate}deg) saturate(${v.saturate}%)`;

      const anim = ensureLottie();
      if (anim && anim.totalFrames) {
        const progress = Math.max(0, Math.min(1, t / total));
        const frame = progress * (anim.totalFrames - 1);
        try { anim.goToAndStop(frame, true); } catch (_) {}
      }
    }

    function getTotal() { return getValues().total; }
    function getMarks() {
      const v = getValues();
      return [v.line1In, v.line2In, v.line3In, v.resolveAt];
    }

    function destroy() {
      if (lottieAnim) {
        try { lottieAnim.destroy(); } catch (_) {}
        lottieAnim = null;
      }
      clearChildren(host);
      host.classList.remove('scene-clarity', 'is-developing', 'is-resolved');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },

  async exportHTML(values) {
    const res = await fetch(CLARITY_LOTTIE_PATH);
    const source = await res.json();
    
    // Convert lines to a safe array
    const lines = Array.isArray(values.lines) ? values.lines : [];
    
    // We need to resolve the CSS variable to a hex color for standalone
    const captionColorHex = tokenToHex(values.captionColor, '#0176D3');
    
    return buildClarityStandaloneHTML({
      animationData: source,
      total: values.total,
      line1In: values.line1In,
      line1Out: values.line1Out,
      line2In: values.line2In,
      line2Out: values.line2Out,
      line3In: values.line3In,
      line3Out: values.line3Out,
      resolveAt: values.resolveAt,
      captionSize: values.captionSize,
      captionColor: captionColorHex,
      hueRotate: values.hueRotate,
      saturate: values.saturate,
      lines: lines
    });
  },
};

function tokenToHex(token, fallback) {
  if (!token) return fallback;
  if (token.startsWith('#')) return token;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v || fallback;
}

function buildClarityStandaloneHTML(cfg) {
  const animationDataJSON = JSON.stringify(cfg.animationData);
  const safeLines = cfg.lines.map(l => String(l || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Clarity — exported</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #000;
    color: #ededed;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }
  .stage {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .blur-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
    filter: blur(20px);
    transition: filter 1s ease-out;
  }
  .stage.is-resolved .blur-container {
    filter: blur(0);
  }
  .lottie { 
    width: 120%; 
    height: 120%; 
    filter: hue-rotate(${cfg.hueRotate}deg) saturate(${cfg.saturate}%);
  }
  .lottie svg { width: 100% !important; height: 100% !important; }
  .caption {
    position: relative;
    z-index: 2;
    margin: 0;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: ${cfg.captionColor};
    font-size: ${cfg.captionSize}px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    text-align: center;
  }
  .caption.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
</head>
<body>
  <div class="stage" id="stage">
    <div class="blur-container">
      <div id="lottie" class="lottie" aria-hidden="true"></div>
    </div>
    <p class="caption" id="caption"></p>
  </div>
<script>
  const CFG = {
    total: ${cfg.total},
    line1In: ${cfg.line1In},
    line1Out: ${cfg.line1Out},
    line2In: ${cfg.line2In},
    line2Out: ${cfg.line2Out},
    line3In: ${cfg.line3In},
    line3Out: ${cfg.line3Out},
    resolveAt: ${cfg.resolveAt},
    lines: ${JSON.stringify(safeLines)}
  };
  const ANIMATION_DATA = ${animationDataJSON};

  const anim = lottie.loadAnimation({
    container: document.getElementById('lottie'),
    renderer: 'svg', loop: true, autoplay: true,
    animationData: ANIMATION_DATA,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true },
  });

  const stage = document.getElementById('stage');
  const caption = document.getElementById('caption');
  
  // We recreate the playback loop to handle the captions and blur classes, 
  // but since we want the Lottie to loop, we just tie the captions/classes to the Lottie timeline.
  // Wait, Clarity is meant to be a full sequence driven by time. 
  
  let startedAt = performance.now();
  function tick() {
    const elapsed = (performance.now() - startedAt) % CFG.total;
    
    stage.classList.toggle('is-resolved', elapsed >= CFG.resolveAt);
    
    let lineText = '';
    if (elapsed >= CFG.line1In && elapsed < CFG.line1Out) lineText = CFG.lines[0] || '';
    else if (elapsed >= CFG.line2In && elapsed < CFG.line2Out) lineText = CFG.lines[1] || '';
    else if (elapsed >= CFG.line3In && elapsed < CFG.line3Out) lineText = CFG.lines[2] || '';
    
    if (lineText) {
      if (caption.textContent !== lineText) caption.innerHTML = lineText;
      caption.classList.add('is-visible');
    } else {
      caption.classList.remove('is-visible');
    }
    
    requestAnimationFrame(tick);
  }
  
  requestAnimationFrame(tick);
</script>
</body>
</html>`;
}
