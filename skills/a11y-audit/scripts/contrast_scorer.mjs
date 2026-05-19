// contrast_scorer.mjs — WCAG 2.2 SC 1.4.3 / 1.4.11 runtime contrast computation.
//
// Handles every modern CSS color form the browser hands back via getComputedStyle:
// rgb()/rgba(), hsl()/hsla(), hex, oklab(), oklch(), and named colors. Composites
// translucent foregrounds over the cascaded background before scoring, so
// rgba(255,255,255,0.8) on rgb(33,38,45) yields the actual blended luminance —
// not the 1.38 false-positive that a naive scorer reports.
//
// Designed to run inside Puppeteer / chrome-devtools-mcp evaluate_script via
// new Function() injection. Exposes a single `scoreContrast(viewport, opts)`
// function that returns { url, viewport, checked, failures, summary }.

export const contrastScorerSource = String.raw`
(function() {
  // sRGB relative luminance per WCAG 2.x.
  function srgbToLinear(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function relLum(r, g, b) {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  }

  // OKLab -> linear sRGB -> sRGB (per CSS Color 4).
  function oklabToRgb(L, a, b) {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    let R =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    const enc = (c) => {
      if (c <= 0) return 0;
      if (c >= 1) return 255;
      return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055));
    };
    return [enc(R), enc(G), enc(B)];
  }

  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;
    str = str.trim();

    // #rgb / #rrggbb / #rrggbbaa
    if (str.startsWith('#')) {
      const hex = str.slice(1);
      if (hex.length === 3) {
        return [parseInt(hex[0]+hex[0],16), parseInt(hex[1]+hex[1],16), parseInt(hex[2]+hex[2],16), 1];
      }
      if (hex.length === 6) {
        return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), 1];
      }
      if (hex.length === 8) {
        return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), parseInt(hex.slice(6,8),16)/255];
      }
    }

    // rgb / rgba — modern + legacy syntax
    let m = str.match(/^rgba?\\(\\s*([\\d.]+)[,\\s]+([\\d.]+)[,\\s]+([\\d.]+)(?:[,\\s\\/]+([\\d.]+%?))?\\s*\\)$/);
    if (m) {
      let a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), a];
    }

    // hsl / hsla
    m = str.match(/^hsla?\\(\\s*([\\d.]+)(?:deg)?[,\\s]+([\\d.]+)%[,\\s]+([\\d.]+)%(?:[,\\s\\/]+([\\d.]+%?))?\\s*\\)$/);
    if (m) {
      const h = parseFloat(m[1]) / 360;
      const s = parseFloat(m[2]) / 100;
      const l = parseFloat(m[3]) / 100;
      const a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [Math.round(r*255), Math.round(g*255), Math.round(b*255), a];
    }

    // oklab() — getComputedStyle returns this for tailwind opacity utilities in modern browsers
    m = str.match(/^oklab\\(\\s*([\\d.]+%?)[\\s,]+(-?[\\d.]+)[\\s,]+(-?[\\d.]+)(?:[\\s,\\/]+([\\d.]+%?))?\\s*\\)$/);
    if (m) {
      const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
      const a = parseFloat(m[2]);
      const b = parseFloat(m[3]);
      const alpha = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      const [r, g, bl] = oklabToRgb(L, a, b);
      return [r, g, bl, alpha];
    }

    // lab() — CIE Lab. Browsers serialise oklch from Tailwind v4 @theme as lab()
    // when the source uses theme(), so this parser must understand it or every
    // Tailwind-v4-themed surface falls back to "transparent" in the cascade walk
    // and the contrast scan false-positives spectacularly.
    m = str.match(/^lab\\(\\s*([\\d.]+%?)[\\s,]+(-?[\\d.]+)[\\s,]+(-?[\\d.]+)(?:[\\s,\\/]+([\\d.]+%?))?\\s*\\)$/);
    if (m) {
      // CIE Lab → D50 XYZ → linear sRGB (D65) → sRGB. Lossy; OK for contrast scoring.
      const L = m[1].endsWith('%') ? parseFloat(m[1]) : parseFloat(m[1]);
      const a = parseFloat(m[2]);
      const b = parseFloat(m[3]);
      const alpha = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      const fy = (L + 16) / 116;
      const fx = a / 500 + fy;
      const fz = fy - b / 200;
      const e = 216 / 24389, k = 24389 / 27;
      const X = (Math.pow(fx, 3) > e ? Math.pow(fx, 3) : (116 * fx - 16) / k) * 0.96422;
      const Y = (L > 8 ? Math.pow(fy, 3) : L / k);
      const Z = (Math.pow(fz, 3) > e ? Math.pow(fz, 3) : (116 * fz - 16) / k) * 0.82521;
      // D50 → D65 Bradford-adapted, then to linear sRGB
      let R =  3.1338561 * X - 1.6168667 * Y - 0.4906146 * Z;
      let G = -0.9787684 * X + 1.9161415 * Y + 0.0334540 * Z;
      let B =  0.0719453 * X - 0.2289914 * Y + 1.4052427 * Z;
      const enc = (c) => c <= 0 ? 0 : c >= 1 ? 255 : Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055));
      return [enc(R), enc(G), enc(B), alpha];
    }

    // oklch() — L C h, h in deg/rad/grad/turn (browser returns deg)
    m = str.match(/^oklch\\(\\s*([\\d.]+%?)[\\s,]+([\\d.]+)[\\s,]+(-?[\\d.]+)(?:deg)?(?:[\\s,\\/]+([\\d.]+%?))?\\s*\\)$/);
    if (m) {
      const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
      const C = parseFloat(m[2]);
      const h = parseFloat(m[3]) * Math.PI / 180;
      const alpha = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      const a = C * Math.cos(h);
      const b = C * Math.sin(h);
      const [r, g, bl] = oklabToRgb(L, a, b);
      return [r, g, bl, alpha];
    }

    return null;
  }

  // Composite [fgR,fgG,fgB,fgA] over solid [bgR,bgG,bgB,1] → solid RGB.
  function composite(fg, bg) {
    if (fg[3] >= 1) return [fg[0], fg[1], fg[2]];
    const a = fg[3];
    return [
      Math.round(fg[0] * a + bg[0] * (1 - a)),
      Math.round(fg[1] * a + bg[1] * (1 - a)),
      Math.round(fg[2] * a + bg[2] * (1 - a)),
    ];
  }

  function contrast(rgb1, rgb2) {
    const l1 = relLum(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = relLum(rgb2[0], rgb2[1], rgb2[2]);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  }

  function effectiveBgRgb(el) {
    let cur = el;
    let acc = null;
    const layers = [];
    while (cur && cur !== document.documentElement) {
      const bg = parseColor(getComputedStyle(cur).backgroundColor);
      if (bg && bg[3] > 0) {
        layers.unshift(bg);
        if (bg[3] >= 1) break;
      }
      cur = cur.parentElement;
    }
    // walk up — at the top, fall back to body, then white
    if (cur === null || layers.length === 0 || layers[0][3] < 1) {
      const bodyBg = parseColor(getComputedStyle(document.body).backgroundColor);
      if (bodyBg && bodyBg[3] > 0) layers.unshift(bodyBg);
      else layers.unshift([255,255,255,1]);
    }
    // composite top-down
    let out = [layers[0][0], layers[0][1], layers[0][2], 1];
    for (let i = 1; i < layers.length; i++) {
      out = composite(layers[i], out).concat([1]);
    }
    return [out[0], out[1], out[2]];
  }

  function isLargeText(el) {
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    return px >= 24 || (bold && px >= 18.66);
  }

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
    return true;
  }

  function elDescriptor(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = el.className && typeof el.className === 'string' ? '.' + el.className.split(/\\s+/).slice(0,3).join('.') : '';
    return tag + id + cls;
  }

  const SELECTORS = 'h1,h2,h3,h4,h5,h6,p,a,button,span,li,label,input,td,th,figcaption,summary,strong,em,dt,dd';
  const els = Array.from(document.querySelectorAll(SELECTORS));
  const failures = [];
  const checked = [];
  for (const el of els) {
    const text = (el.innerText || el.value || '').trim();
    if (!text) continue;
    if (!isVisible(el)) continue;
    const fgStr = getComputedStyle(el).color;
    const fg = parseColor(fgStr);
    if (!fg) continue;
    const bgRgb = effectiveBgRgb(el);
    const fgFinal = composite(fg, bgRgb.concat([1]));
    const ratio = contrast(fgFinal, bgRgb);
    const threshold = isLargeText(el) ? 3 : 4.5;
    checked.push(1);
    if (ratio < threshold) {
      failures.push({
        selector: elDescriptor(el),
        text: text.slice(0, 60),
        fg: 'rgb(' + fgFinal.join(',') + ')',
        bg: 'rgb(' + bgRgb.join(',') + ')',
        ratio: Math.round(ratio * 100) / 100,
        threshold,
        fontSize: parseFloat(getComputedStyle(el).fontSize),
        weight: getComputedStyle(el).fontWeight,
        large: isLargeText(el),
      });
    }
  }
  return {
    url: window.location.href,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    checkedCount: checked.length,
    failureCount: failures.length,
    failures: failures.sort((a, b) => a.ratio - b.ratio).slice(0, 50),
  };
})()
`;
