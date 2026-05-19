// Astro Sparkle scene — Astro mascot Lottie + scrubbable timeline.
// Adapted from cko-demo-motion/script.js (initAstroSparkleLottie + applyAstroSparkleStateAt).

const ASTRO_LOTTIE_PATH = 'assets/scenes/astro-sparkle/a/Main Scene.json';
const ASTRO_ASSETS_PATH = 'assets/scenes/astro-sparkle/i/';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'astro-sparkle',
  name: 'Astro Sparkle',
  description: 'Astro mascot framed by orbiting sparkle keyframes — hand-edited Lottie.',
  why: '"Ta-da!" moments. Highlighting a successful action, a new feature, or an AI-generated outcome.',
  howToUse: 'Center stage in success modals or zero-state welcome screens.',
  usesLottie: true,

  settings: [
    { id: 'total',         label: 'Total duration',   type: 'range', min: 1500, max: 10000, step: 100, default: 5000, unit: 'ms' },
    { id: 'lottieIn',      label: 'Lottie in',        type: 'range', min: 0,    max: 4000,  step: 50,  default: 400,  unit: 'ms' },
    { id: 'lottieOut',     label: 'Lottie out',       type: 'range', min: 1000, max: 9000,  step: 50,  default: 4000, unit: 'ms' },
    { id: 'mascotScale',   label: 'Mascot scale',     type: 'range', min: 50,   max: 150,   step: 1,   default: 100,  unit: '%' },
    { id: 'headlineSize',  label: 'Headline size',    type: 'range', min: 18,   max: 56,    step: 1,   default: 32,   unit: 'px' },
    { id: 'headlineColor', label: 'Headline color',   type: 'color', default: '--slds-g-color-neutral-base-10' },
  ],

  copy: [
    { id: 'headline', label: 'Headline', type: 'text', default: 'Crafting your help agent' },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-astro-sparkle');

    const overlay = document.createElement('div');
    overlay.className = 'scene-astro-sparkle-overlay';

    const lottieEl = document.createElement('div');
    lottieEl.className = 'scene-astro-sparkle-lottie';

    const title = document.createElement('h1');
    title.className = 'scene-astro-sparkle-title';

    overlay.append(lottieEl, title);
    host.append(overlay);

    let lottieAnim = null;
    function ensureLottie() {
      if (lottieAnim) return lottieAnim;
      if (typeof window.lottie === 'undefined') return null;
      try {
        lottieAnim = window.lottie.loadAnimation({
          container: lottieEl,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: ASTRO_LOTTIE_PATH,
          assetsPath: ASTRO_ASSETS_PATH,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true },
        });
      } catch (e) {
        console.error('[astro-sparkle lottie load error]', e);
        lottieAnim = null;
      }
      return lottieAnim;
    }
    ensureLottie();

    function applyStatic() {
      const v = getValues();
      title.textContent = v.headline;
      title.style.color = `var(${v.headlineColor})`;
      title.style.fontSize = `${v.headlineSize}px`;
      lottieEl.style.transform = `scale(${v.mascotScale / 100})`;
    }

    function renderAt(t) {
      applyStatic();
      const v = getValues();
      const anim = ensureLottie();
      if (anim && anim.totalFrames) {
        const { lottieIn, lottieOut } = v;
        let progress;
        if (t < lottieIn) progress = 0;
        else if (t > lottieOut) progress = 1;
        else progress = (t - lottieIn) / Math.max(1, lottieOut - lottieIn);
        const frame = progress * (anim.totalFrames - 1);
        try { anim.goToAndStop(frame, true); } catch (_) {}
      }
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
      clearChildren(host);
      host.classList.remove('scene-astro-sparkle');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },

  async exportHTML(values) {
    const res = await fetch(ASTRO_LOTTIE_PATH);
    const source = await res.json();
    
    // We need to resolve the CSS variable to a hex color for standalone
    const headlineColorHex = tokenToHex(values.headlineColor, '#0176D3');
    
    return buildAstroStandaloneHTML({
      animationData: source,
      total: values.total,
      lottieIn: values.lottieIn,
      lottieOut: values.lottieOut,
      mascotScale: values.mascotScale,
      headlineSize: values.headlineSize,
      headlineColor: headlineColorHex,
      headline: values.headline
    });
  },
};

function tokenToHex(token, fallback) {
  if (!token) return fallback;
  if (token.startsWith('#')) return token;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v || fallback;
}

function buildAstroStandaloneHTML(cfg) {
  const animationDataJSON = JSON.stringify(cfg.animationData);
  const safeHeadline = String(cfg.headline || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Astro Sparkle — exported</title>
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
  .lottie { 
    width: 300px; 
    height: 300px; 
    pointer-events: none; 
    transform: scale(${cfg.mascotScale / 100});
  }
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
    total: ${cfg.total},
    lottieIn: ${cfg.lottieIn},
    lottieOut: ${cfg.lottieOut}
  };
  const ANIMATION_DATA = ${animationDataJSON};

  // We need to resolve images properly since we are standalone.
  // We'll point assetsPath to a relative path but it might break if the user runs the HTML somewhere else.
  // A better way is just pointing it to the absolute path of the assets if we knew it.
  // For now, we will leave it as the local path but it assumes it runs near the root or they host it with the assets.
  const ASTRO_ASSETS_PATH = 'assets/scenes/astro-sparkle/i/';

  const anim = lottie.loadAnimation({
    container: document.getElementById('lottie'),
    renderer: 'svg', loop: true, autoplay: true,
    animationData: ANIMATION_DATA,
    assetsPath: ASTRO_ASSETS_PATH,
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true },
  });

  // To simulate the timeline behavior, since Astro Sparkle uses progress based on lottieIn and lottieOut
  // we actually need to drive it manually because loop: true will just play the whole file.
  // Wait, if we want it to loop autonomously over the *entire* duration, and only play the Lottie 
  // between lottieIn and lottieOut...
  anim.autoplay = false;
  anim.loop = false;
  
  let startedAt = performance.now();
  function tick() {
    if (!anim.totalFrames) {
      requestAnimationFrame(tick);
      return;
    }
    
    const elapsed = (performance.now() - startedAt) % CFG.total;
    let progress;
    if (elapsed < CFG.lottieIn) progress = 0;
    else if (elapsed > CFG.lottieOut) progress = 1;
    else progress = (elapsed - CFG.lottieIn) / Math.max(1, CFG.lottieOut - CFG.lottieIn);
    
    const frame = progress * (anim.totalFrames - 1);
    try { anim.goToAndStop(frame, true); } catch (_) {}
    
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
</script>
</body>
</html>`;
}
