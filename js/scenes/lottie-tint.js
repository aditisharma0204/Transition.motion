// Tint a Lottie JSON by replacing fill / stroke / gradient colors.
// Returns a deep-cloned JSON so the cached source can be re-tinted.
//
// `tint` may be:
//   - a single hex string             → flat tint (every stop = same color)
//   - an array of hex strings         → gradient interpolated across stops
//
// Lottie color shapes:
//   ty: 'fl' (solid fill)     → c.k = [r,g,b,a]
//   ty: 'st' (solid stroke)   → c.k = [r,g,b,a]
//   ty: 'gf' (gradient fill)  → g.k.k = [pos1, r1, g1, b1, pos2, r2, g2, b2, ...]
//   ty: 'gs' (gradient stroke)
//
// For gradients: positions stay, RGB at each stop is sampled from the
// supplied color array — preserving the gradient shape while letting
// the user pick the endpoints.

function hexToRgbUnit(hex) {
  const m = (hex || '').match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return [1, 1, 1];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

function normalizeColors(tint) {
  if (Array.isArray(tint)) {
    if (tint.length === 0) return [[1, 1, 1]];
    return tint.map(hexToRgbUnit);
  }
  return [hexToRgbUnit(tint)];
}

// Sample a position 0..1 across a list of RGB colors via piecewise lerp.
function sampleColors(colors, t) {
  if (colors.length === 1) return colors[0];
  if (t <= 0) return colors[0];
  if (t >= 1) return colors[colors.length - 1];
  const segments = colors.length - 1;
  const seg = Math.min(segments - 1, Math.floor(t * segments));
  const local = t * segments - seg;
  const a = colors[seg];
  const b = colors[seg + 1];
  return [
    a[0] + (b[0] - a[0]) * local,
    a[1] + (b[1] - a[1]) * local,
    a[2] + (b[2] - a[2]) * local,
  ];
}

function tintGradientStops(stopsArray, colors) {
  const out = stopsArray.slice();
  // Find where the color stops end (alpha stops, if any, follow).
  // Color stops are quadruples [pos, r, g, b] each in 0..1.
  let colorStopEnd = 0;
  for (let i = 0; i + 3 < out.length; i += 4) {
    const ok =
      typeof out[i + 1] === 'number' && out[i + 1] >= 0 && out[i + 1] <= 1 &&
      typeof out[i + 2] === 'number' && out[i + 2] >= 0 && out[i + 2] <= 1 &&
      typeof out[i + 3] === 'number' && out[i + 3] >= 0 && out[i + 3] <= 1;
    if (!ok) break;
    colorStopEnd = i + 4;
  }
  const numStops = colorStopEnd / 4;
  if (numStops === 0) return out;

  for (let s = 0; s < numStops; s++) {
    const t = numStops > 1 ? s / (numStops - 1) : 0;
    const [r, g, b] = sampleColors(colors, t);
    out[s * 4 + 1] = r;
    out[s * 4 + 2] = g;
    out[s * 4 + 3] = b;
  }
  return out;
}

export function tintLottieJSON(source, tint, { tintFills = true, tintStrokes = false } = {}) {
  const colors = normalizeColors(tint);
  const out = JSON.parse(JSON.stringify(source));

  function tintSolid(node) {
    if (!node.c || !Array.isArray(node.c.k)) return;
    // Solid fills can't represent a gradient — use the first color.
    const [r, g, b] = colors[0];
    const k = node.c.k;
    if (k.length === 4 && k.every((n) => typeof n === 'number')) {
      node.c.k = [r, g, b, k[3] ?? 1];
    } else {
      for (const kf of k) {
        if (kf && Array.isArray(kf.s) && kf.s.length >= 3) {
          kf.s = [r, g, b, kf.s[3] ?? 1];
        }
      }
    }
  }

  function tintGradient(node) {
    if (!node.g || !node.g.k) return;
    const k = node.g.k;
    if (k.a === 0 && Array.isArray(k.k)) {
      node.g.k.k = tintGradientStops(k.k, colors);
    } else if (k.a === 1 && Array.isArray(k.k)) {
      for (const kf of k.k) {
        if (kf && Array.isArray(kf.s)) {
          kf.s = tintGradientStops(kf.s, colors);
        }
      }
    }
  }

  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    const isFill = node.ty === 'fl';
    const isStroke = node.ty === 'st';
    const isGradFill = node.ty === 'gf';
    const isGradStroke = node.ty === 'gs';
    if ((isFill && tintFills) || (isStroke && tintStrokes)) tintSolid(node);
    if ((isGradFill && tintFills) || (isGradStroke && tintStrokes)) tintGradient(node);
    for (const key of Object.keys(node)) visit(node[key]);
  }
  visit(out);
  return out;
}

// Live-tint the rendered SVG of an already-loaded Lottie. Updates every
// gradient's <stop> colors in-place, distributing the supplied colors across
// the existing stop count. Avoids destroying / reloading the animation.
//
// Returns true if anything was patched.
export function liveTintSVG(svgRoot, tint) {
  if (!svgRoot) return false;
  const colors = normalizeColors(tint);
  let touched = false;

  // Gradient stops — main path for sparkle.json, where the star is a
  // linearGradient with multiple stops.
  const gradients = svgRoot.querySelectorAll('linearGradient, radialGradient');
  gradients.forEach((grad) => {
    const stops = grad.querySelectorAll('stop');
    const n = stops.length;
    if (!n) return;
    stops.forEach((stop, i) => {
      const t = n > 1 ? i / (n - 1) : 0;
      const [r, g, b] = sampleColors(colors, t);
      const targetColor = rgbToCss(r, g, b);
      if (stop.getAttribute('stop-color') !== targetColor) {
        stop.setAttribute('stop-color', targetColor);
        touched = true;
      }
      if (!stop.hasAttribute('offset')) {
        stop.setAttribute('offset', `${t * 100}%`);
        touched = true;
      }
    });
  });

  return touched;
}

function rgbToCss(r, g, b) {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function tokenToHex(token, fallback = '#0176D3') {
  if (!token) return fallback;
  if (token.startsWith('#')) return token;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v || fallback;
}
