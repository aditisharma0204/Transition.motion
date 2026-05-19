// Sparkle scene — Lottie ignition + headline.
// Adapted from cko-demo-motion/script.js (initSparkleLottie + applySparkleStateAt).
// The star uses a 2-stop gradient. We load the Lottie once and re-tint the
// rendered SVG's <stop> elements live on color change — no destroy/reload.

import { liveTintSVG, tintLottieJSON, tokenToHex } from './lottie-tint.js';

const SPARKLE_LOTTIE_PATH = 'assets/scenes/sparkle.json';

let cachedSourceJSON = null;
async function fetchSourceJSON() {
  if (cachedSourceJSON) return cachedSourceJSON;
  const res = await fetch(SPARKLE_LOTTIE_PATH);
  cachedSourceJSON = await res.json();
  return cachedSourceJSON;
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'sparkle',
  name: 'Sparkle',
  description: 'Lottie sparkle ignition with a headline. Star gradient and timing are scrub-driven.',
  why: '"Ta-da!" moments. Highlighting a successful action, a new feature, or an AI-generated outcome.',
  howToUse: 'Center stage in success modals or zero-state welcome screens.',
  usesLottie: true,
  loop: true,

  settings: [
    { id: 'total',         label: 'Total duration',  type: 'range', min: 1000, max: 8000, step: 100, default: 4400, unit: 'ms' },
    { id: 'lottieIn',      label: 'Lottie in',       type: 'range', min: 0,    max: 4000, step: 50,  default: 400,  unit: 'ms' },
    { id: 'lottieOut',     label: 'Lottie out',      type: 'range', min: 500,  max: 8000, step: 50,  default: 3400, unit: 'ms' },
    { id: 'startFrame',    label: 'Start frame',     type: 'range', min: 0,    max: 181,  step: 1,   default: 0,    unit: '' },
    { id: 'endFrame',      label: 'End frame',       type: 'range', min: 1,    max: 181,  step: 1,   default: 181,  unit: '' },
    { id: 'starColor1',    label: 'Star color · stop 1', type: 'color', default: '--slds-g-color-brand-base-50' },
    { id: 'starColor2',    label: 'Star color · stop 2', type: 'color', default: '--slds-g-color-palette-violet-80' },
    { id: 'headlineSize',  label: 'Headline size',   type: 'range', min: 18,   max: 56,   step: 1,   default: 32,   unit: 'px' },
    { id: 'headlineColor', label: 'Headline color',  type: 'color', default: '--slds-g-color-neutral-base-10' },
  ],

  copy: [
    { id: 'headline', label: 'Headline', type: 'text', default: 'Crafting your help agent' },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-sparkle');

    const overlay = document.createElement('div');
    overlay.className = 'scene-sparkle-overlay';

    const lottieEl = document.createElement('div');
    lottieEl.className = 'scene-sparkle-lottie';

    const title = document.createElement('h1');
    title.className = 'scene-sparkle-title';

    overlay.append(lottieEl, title);
    host.append(overlay);

    let lottieAnim = null;
    let svgRoot = null;
    let lottieReady = false;
    let lastTintKey = null;
    // Cache the source animation's max frame at DOMLoaded.
    // We can't read it from `lottieAnim.totalFrames` later because
    // `playSegments(...)` mutates `totalFrames` to the segment length —
    // which would silently shrink our clamp range on every render tick.
    let sourceMaxFrame = 181;

    if (typeof window.lottie !== 'undefined') {
      try {
        lottieAnim = window.lottie.loadAnimation({
          container: lottieEl,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: SPARKLE_LOTTIE_PATH,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true },
        });
        lottieAnim.addEventListener('DOMLoaded', () => {
          svgRoot = lottieEl.querySelector('svg');
          lottieReady = true;
          if (lottieAnim.animationData && Array.isArray(lottieAnim.animationData.layers)) {
            // op = out point of the comp (frame count); first call to playSegments later
            // will mutate lottieAnim.totalFrames, so capture the source value now.
            sourceMaxFrame = Math.max(1, (lottieAnim.animationData.op || lottieAnim.totalFrames || 182) - 1);
          } else {
            sourceMaxFrame = Math.max(1, lottieAnim.totalFrames - 1);
          }
          applyTintIfChanged();
        });
      } catch (e) {
        console.error('[sparkle lottie load error]', e);
      }
    }

    function applyTintIfChanged() {
      if (!svgRoot) return;
      const v = getValues();
      const colors = [tokenToHex(v.starColor1), tokenToHex(v.starColor2)];
      liveTintSVG(svgRoot, colors);
    }

    function applyStatic() {
      const v = getValues();
      title.textContent = v.headline;
      title.style.color = `var(${v.headlineColor})`;
      title.style.fontSize = `${v.headlineSize}px`;
    }

    function renderAt(t) {
      applyStatic();
      
      if (!lottieReady || !lottieAnim) return;
      
      const v = getValues();
      let progress = 0;
      if (t >= v.lottieIn) {
        const loopDuration = Math.max(1, v.lottieOut - v.lottieIn);
        progress = ((t - v.lottieIn) % loopDuration) / loopDuration;
      }
      
      const startF = Math.max(0, Math.min(sourceMaxFrame, v.startFrame ?? 0));
      const endF   = Math.max(startF, Math.min(sourceMaxFrame, v.endFrame ?? sourceMaxFrame));
      const frame = startF + progress * (endF - startF);
      
      lottieAnim.goToAndStop(frame, true);
      
      // Apply tint after Lottie updates the DOM
      applyTintIfChanged();
    }

    function getTotal() { return getValues().total; }
    function getMarks() {
      const v = getValues();
      return [v.lottieIn, v.lottieOut];
    }

    function destroy() {
      if (lottieAnim) {
        try { lottieAnim.destroy(); } catch (_) {}
        lottieAnim = null;
      }
      svgRoot = null;
      clearChildren(host);
      host.classList.remove('scene-sparkle');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },

  /**
   * Build a self-contained .html bundle for this scene's current values.
   * Inlines the (tinted) Lottie animationData and the Lottie CDN. The
   * animation loops autonomously — no playback chrome. Drag-and-drop
   * into any browser; no other files needed.
   */
  async exportHTML(values) {
    const source = await fetchSourceJSON();
    const colors = [tokenToHex(values.starColor1), tokenToHex(values.starColor2)];
    const tinted = tintLottieJSON(source, colors);
    const headlineHex = tokenToHex(values.headlineColor);
    return buildSparkleStandaloneHTML({
      animationData: tinted,
      startFrame: values.startFrame ?? 0,
      endFrame: values.endFrame ?? 181,
      headline: values.headline,
      headlineColor: headlineHex,
      headlineSize: values.headlineSize,
    });
  },
};

function buildSparkleStandaloneHTML(cfg) {
  const animationDataJSON = JSON.stringify(cfg.animationData);
  const safeHeadline = String(cfg.headline || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sparkle — exported</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #1a1a1e;
    color: #ededed;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }
  .stage {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px; padding: 32px; text-align: center;
    box-sizing: border-box;
    background: radial-gradient(ellipse 90% 70% at 50% 35%, rgba(255,255,255,0.04) 0%, transparent 65%), #1a1a1e;
  }
  .lottie { width: 220px; height: 220px; pointer-events: none; }
  .lottie svg { width: 100% !important; height: 100% !important; }
  h1.headline {
    margin: 0;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${cfg.headlineColor};
    font-size: ${cfg.headlineSize}px;
  }
</style>
</head>
<body>
  <div class="stage">
    <div id="lottie" class="lottie" aria-hidden="true"></div>
    <h1 class="headline">${safeHeadline}</h1>
  </div>
<script>
  const CFG = {
    startFrame: ${cfg.startFrame},
    endFrame: ${cfg.endFrame},
  };
  const ANIMATION_DATA = ${animationDataJSON};

  const anim = lottie.loadAnimation({
    container: document.getElementById('lottie'),
    renderer: 'svg', loop: true, autoplay: true,
    animationData: ANIMATION_DATA,
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true },
  });

  // One-shot segment apply. playSegments(..., true) mutates totalFrames,
  // so we capture the source max from animationData.op before calling it
  // and only invoke it once — Lottie's own loop:true keeps it cycling.
  anim.addEventListener('DOMLoaded', () => {
    const srcMax = Math.max(1, ((ANIMATION_DATA && ANIMATION_DATA.op) || anim.totalFrames || 182) - 1);
    const sF = Math.max(0, Math.min(srcMax, CFG.startFrame));
    const eF = Math.max(sF, Math.min(srcMax, CFG.endFrame));
    try { anim.playSegments([sF, eF], true); } catch (_) {}
  });
</script>
</body>
</html>`;
}
