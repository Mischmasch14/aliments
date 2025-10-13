// lib/theme.ts
export type RGB = { r: number; g: number; b: number };
export type Palette = Record<string, string>;

const KEY = "aliments.theme.rgb";
const clamp = (n: number, min=0, max=255) => Math.min(max, Math.max(min, Math.round(n)));

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: clamp(a.r + (b.r - a.r) * t),
    g: clamp(a.g + (b.g - a.g) * t),
    b: clamp(a.b + (b.b - a.b) * t),
  };
}
function rgbToHex({r,g,b}: RGB) {
  return "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
}
function hex(rgb: RGB) { return rgbToHex(rgb); }

export function buildPalette(base: RGB): Palette {
  const white: RGB = { r:255,g:255,b:255 };
  const black: RGB = { r:0,g:0,b:0 };

  // Tints (mit Weiß), Shades (mit Schwarz)
  const p50  = mix(base, white, 0.88);
  const p100 = mix(base, white, 0.80);
  const p200 = mix(base, white, 0.55);
  const p300 = mix(base, white, 0.40);
  const p400 = mix(base, white, 0.25);
  const p500 = base;
  const p600 = mix(base, black, 0.12);
  const p700 = mix(base, black, 0.24);
  const p800 = mix(base, black, 0.38);
  const p900 = mix(base, black, 0.52);

  return {
    "--brand-50":  hex(p50),
    "--brand-100": hex(p100),
    "--brand-200": hex(p200),
    "--brand-300": hex(p300),
    "--brand-400": hex(p400),
    "--brand-500": hex(p500),
    "--brand-600": hex(p600),
    "--brand-700": hex(p700),
    "--brand-800": hex(p800),
    "--brand-900": hex(p900),

    "--text":      hex(p700),
    "--muted":     hex(p400),
    "--icon":      hex(p600),
    "--border":    hex(p200),
    "--surface-0": "#ffffff",
    "--surface-1": hex(p50),
    "--surface-2": hex(p100),
    "--today-bg":  hex(p50),

    "--chip-bg":   hex(p100),
    "--chip-text": hex(p700),

    "--hover-bg":  hex(mix(base, white, 0.70)),
    "--active-bd": hex(p300),
    "--focus-ring": "rgba(0,0,0,0.18)", // neutraler Fokus, bleibt dezent
  };
}

export function applyPalette(p: Palette) {
  const root = document.documentElement;
  Object.entries(p).forEach(([k,v]) => root.style.setProperty(k, v));
}

export function saveBaseRGB(rgb: RGB) {
  localStorage.setItem(KEY, JSON.stringify(rgb));
}
export function loadBaseRGB(): RGB | null {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) as RGB : null; }
  catch { return null; }
}

export const DEFAULT_RGB: RGB = { r: 138, g: 126, b: 118 }; // Moonstone Veil #8A7E76