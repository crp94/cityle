// Deterministic, Satori-safe postcard/poster art for a city, keyed on
// `city.morphology.seed` (+ `.type` / `.sprawlScaleKm` / water fields for
// shape and mood). Reused as-is by `/postcard/[cityId]`'s page.tsx,
// opengraph-image.tsx and twitter-image.tsx (Workstream JJ) — see
// `resultImageContent.tsx`'s file-header comment for the exact Satori
// (`next/og`'s ImageResponse) constraints this respects: flex + basic SVG
// primitives only (`<path>`/`<circle>`/`<line>`/`<rect>`, no `<text>`
// inside raw `<svg>`), no external font/image fetches, `<g>` not `<>`
// fragments inside raw `<svg>`. No literal text is drawn inside the `<svg>`
// at all here — the art is purely abstract shapes; any caption lives
// outside it as ordinary flex/text divs in the calling page.
//
// CSS `background: linear-gradient(...)` on a flex `<div>` is empirically
// verified to render correctly in this app's next/og setup (multi-stop,
// angled, rgba stops — no banding), so the sky is a real gradient. Path
// curve commands (`Q`/`C`) render fine too — the final raster pass is
// resvg, a full SVG renderer, and `resultImageContent.tsx`'s d3-generated
// map paths already exercise complex `d` strings through this pipeline.
//
// ── The design (v2 — the travel-poster rework) ─────────────────────────
// The first version of this file drew three parallax bands of flat
// two-tone <rect> "buildings", which in practice read more like an audio
// equalizer than a postcard. This rework keeps everything that worked
// (deterministic seeding, morphology-driven silhouette rhythm, the
// postcard framing) and replaces the visual language wholesale:
//
//  • Five seed-picked times of day ("gilded dusk", "harbor night", "rose
//    dawn", "indigo night", "emerald evening"), each a full palette: a
//    5-7 stop sky gradient, three atmospheric silhouette inks (pale far
//    layer → near-black foreground, classic aerial perspective), water
//    tones, a glow accent, and warm window light.
//  • Skylines are continuous filled <path> silhouettes with real
//    rooflines — flat parapets, stepped Art-Deco setbacks, slants,
//    pitched roofs, domes, antenna spires — plus one seeded landmark
//    tower per city with a long mast and a tiny red aircraft beacon.
//  • Morphology drives terrain as well as rhythm: valley-basin gets
//    enclosing ridge walls, coastal-bay a rounded headland on the water
//    side, island-archipelago island humps in its channel gaps,
//    radial-concentric faint concentric "ring road" arcs, delta-estuary a
//    fan of distributary glints, linear-river a suspension bridge across
//    its channel, grid-sprawl a dead-flat endless horizon.
//  • Real water: cities with adjacent water get a deep water plane with a
//    shimmering glint column under the sun/moon, drifting ripple lines
//    and faint building reflections. Inland-dry cities instead ground the
//    skyline in a dark plain under a light-pollution horizon glow.
//  • Atmosphere: night palettes get seeded starfields (with the odd
//    shooting star) and a crescent or full moon; dusk/dawn palettes get a
//    huge low poster sun with layered halo, lens-shaped clouds and a few
//    gulls near the water.
//  • The postcard signature stays but is redrawn: the corner postmark is
//    now a double circle with wavy cancellation bars (like a real franking
//    mark) instead of gear-like ticks, inside a double poster frame.
//
// Deliberately a different visual language from `UrbanSprawlMap.tsx`'s
// functional radial tile map: this is a poster, not a diagram.

import type { ReactNode } from 'react';
import { getCountryFlag } from './geo';
import { City, MorphologyProfile } from './types';

/** Virtual coordinate system every shape below is authored against. Both
 * `opengraph-image.tsx`/`twitter-image.tsx` (1200x630, matching every other
 * OG image in this app) and the page render this at that native aspect
 * ratio, scaled by the parent container via `width: '100%' height: '100%'`
 * on the root and `width="100%" height="100%"` on the `<svg>`. */
export const POSTCARD_WIDTH = 1200;
export const POSTCARD_HEIGHT = 630;

const W = POSTCARD_WIDTH;
const H = POSTCARD_HEIGHT;
const BG = '#0A0C10';
const INK = '#F4F6F8';
const BEACON_RED = '#FF4D4D'; // matches --danger in globals.css

/** Rounds to 1 decimal so path `d` strings stay compact and stable. */
function f(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Mirrors `gameLogic.ts`'s `seededRandom` exactly (the same mulberry32-style
 * single-step hash used to build the daily shuffle) — duplicated rather than
 * imported so this module stays a small, dependency-free JSX builder with no
 * coupling to game-flow logic. Same algorithm, same output for the same
 * input.
 */
function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Sequential deterministic draws from one seed — mirrors the
 * `seed += 1; seededRandom(seed)` stepping pattern `gameLogic.ts`'s
 * `getDailyTargetCity` uses for its Fisher-Yates shuffle, just wrapped as a
 * reusable closure so this file can pull as many draws as it needs.
 */
function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s += 1;
    return seededRandom(s);
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

// ── Palettes ────────────────────────────────────────────────────────────

interface Palette {
  name: string;
  /** CSS background gradient for the sky (top of frame → horizon). */
  sky: string;
  /** Night palettes get stars + a moon; day-edge palettes get sun/clouds. */
  night: boolean;
  /** Accent for halos, horizon pooling, water glints. */
  glow: string;
  /** Sun disc / moon body fill. */
  disc: string;
  /** Inner highlight on the disc. */
  discCore: string;
  moonStyle?: 'full' | 'crescent';
  /** Three silhouette inks, far (palest) → near (darkest). */
  far: string;
  mid: string;
  near: string;
  waterDeep: string;
  waterLight: string;
  glint: string;
  window: string;
  cloud: string;
  star: string;
}

// Every palette keeps this app's near-black at the top of frame so the
// poster still reads as Cityle's dark theme, and anchors its accents on the
// existing tokens (#3FD17C green, #FFB238 gold, #38BDF8 cyan) — the extra
// hues in between are atmospheric ramp stops toward those accents, not a
// second brand palette.
const PALETTES: Palette[] = [
  {
    name: 'gilded-dusk',
    sky: 'linear-gradient(180deg, #07080D 0%, #10121F 22%, #241832 44%, #4A2340 62%, #93353F 78%, #E06A38 90%, #FFB238 100%)',
    night: false,
    glow: '#FFB238',
    disc: '#FFC85C',
    discCore: '#FFE3B0',
    far: '#52304D',
    mid: '#2B1B33',
    near: '#0C0A14',
    waterDeep: '#120D1C',
    waterLight: '#FF9D4A',
    glint: '#FFCB6B',
    window: '#FFD9A0',
    cloud: '#FFC9A3',
    star: '#FFE3B0',
  },
  {
    name: 'harbor-night',
    sky: 'linear-gradient(180deg, #04070B 0%, #071018 26%, #0B1D26 48%, #10333A 68%, #17594E 84%, rgba(63,209,124,0.62) 100%)',
    night: true,
    glow: '#3FD17C',
    disc: '#DCF5E8',
    discCore: '#F2FCF7',
    moonStyle: 'full',
    far: '#2A5B57',
    mid: '#132E33',
    near: '#060B10',
    waterDeep: '#07141A',
    waterLight: '#38BDF8',
    glint: '#7BE8B0',
    window: '#FFD9A0',
    cloud: '#BFE8CE',
    star: '#CFEFE0',
  },
  {
    name: 'rose-dawn',
    sky: 'linear-gradient(180deg, #0A0A14 0%, #171432 24%, #33204C 46%, #6B3260 66%, #C25563 82%, #F5926B 92%, #FFC46B 100%)',
    night: false,
    glow: '#FFAD7A',
    disc: '#FFE3B0',
    discCore: '#FFF4DC',
    far: '#5C3A5E',
    mid: '#33223F',
    near: '#100C18',
    waterDeep: '#150F20',
    waterLight: '#FFA88F',
    glint: '#FFD9A0',
    window: '#FFE3B0',
    cloud: '#FFD3E0',
    star: '#FFF4DC',
  },
  {
    name: 'indigo-night',
    sky: 'linear-gradient(180deg, #030409 0%, #070C1C 30%, #0D1730 56%, #16274E 76%, #23406E 90%, rgba(56,189,248,0.45) 100%)',
    night: true,
    glow: '#38BDF8',
    disc: '#EAF4FF',
    discCore: '#FFFFFF',
    moonStyle: 'crescent',
    far: '#2C3E63',
    mid: '#17233F',
    near: '#070A13',
    waterDeep: '#081020',
    waterLight: '#38BDF8',
    glint: '#9BD4F5',
    window: '#FFB238',
    cloud: '#BFD4EC',
    star: '#DCE9F8',
  },
  {
    name: 'emerald-evening',
    sky: 'linear-gradient(180deg, #05080A 0%, #0A1512 26%, #102921 48%, #174534 68%, #23684A 84%, rgba(63,209,124,0.8) 100%)',
    night: false,
    glow: '#FFB238',
    disc: '#FFC85C',
    discCore: '#FFE9BE',
    far: '#2E5B49',
    mid: '#16332B',
    near: '#070D0D',
    waterDeep: '#0A1714',
    waterLight: '#3FD17C',
    glint: '#FFD9A0',
    window: '#FFE3B0',
    cloud: '#BFE8CE',
    star: '#E8F6EE',
  },
];

// ── Skyline envelope (rhythm per morphology.type) ───────────────────────

interface EnvelopeResult {
  /** Relative height in [0,1] per building slot (0 = no building / gap). */
  heights: number[];
  /** True where a slot is a deliberate gap (open water / channel / strait). */
  gaps: boolean[];
}

/**
 * Produces the per-slot height rhythm for one skyline layer, shaped by
 * `morphology.type`. All seven `MorphologyProfile['type']` values get a
 * distinct silhouette language:
 *  - radial-concentric: a stepped bell curve (tiered by `ringsCount`),
 *    tallest in the center.
 *  - valley-basin: the inverse — tall at both edges (valley walls), low and
 *    dense in the middle (the basin floor).
 *  - coastal-bay: a one-directional taper (tall inland edge, low toward the
 *    water), mirrored by `waterOrientation` below.
 *  - island-archipelago: 3-4 domed clusters separated by hard gaps.
 *  - delta-estuary: a fairly even skyline fanned through by 3-4 narrow
 *    channel gaps.
 *  - linear-river: the same idea with exactly one wider channel.
 *  - grid-sprawl: low, uniform, tightly-packed — width over height.
 */
function buildEnvelope(
  type: MorphologyProfile['type'],
  count: number,
  rng: () => number,
  ringsCount: number | undefined
): EnvelopeResult {
  const heights: number[] = [];
  const gaps: boolean[] = new Array(count).fill(false);
  const jitter = () => 0.78 + rng() * 0.44; // 0.78..1.22 per-building wobble
  const lastIndex = Math.max(1, count - 1);

  switch (type) {
    case 'radial-concentric': {
      const tiers = clamp(Math.round(ringsCount ?? 3), 2, 5);
      for (let i = 0; i < count; i++) {
        const distFromCenter = Math.abs(i / lastIndex - 0.5) * 2; // 0 center..1 edge
        const tierStep = Math.floor(distFromCenter * tiers) / tiers;
        heights.push(Math.max(0.14, 1 - tierStep * 0.82) * jitter());
      }
      break;
    }
    case 'valley-basin': {
      for (let i = 0; i < count; i++) {
        const distFromCenter = Math.abs(i / lastIndex - 0.5) * 2;
        heights.push((0.32 + distFromCenter * 0.66) * jitter());
      }
      break;
    }
    case 'coastal-bay': {
      for (let i = 0; i < count; i++) {
        heights.push((0.34 + (i / lastIndex) * 0.64) * jitter());
      }
      break;
    }
    case 'island-archipelago': {
      const clusterCount = 3 + Math.floor(rng() * 2); // 3-4
      const clusterWidth = Math.max(2, Math.floor(count / clusterCount));
      for (let i = 0; i < count; i++) {
        const posInCluster = i % clusterWidth;
        if (posInCluster === 0 && i !== 0) {
          gaps[i] = true;
          heights.push(0);
          continue;
        }
        const clusterT = posInCluster / Math.max(1, clusterWidth - 1);
        heights.push((0.38 + Math.sin(clusterT * Math.PI) * 0.58) * jitter());
      }
      break;
    }
    case 'delta-estuary': {
      const channelCount = 3 + Math.floor(rng() * 2);
      const channelPositions = new Set<number>();
      for (let c = 0; c < channelCount; c++) {
        channelPositions.add(1 + Math.floor(rng() * Math.max(1, count - 2)));
      }
      for (let i = 0; i < count; i++) {
        if (channelPositions.has(i)) {
          gaps[i] = true;
          heights.push(0);
        } else {
          heights.push((0.42 + rng() * 0.4) * jitter());
        }
      }
      break;
    }
    case 'linear-river': {
      const gapCenter = Math.floor(count * (0.32 + rng() * 0.36));
      const gapHalfWidth = Math.max(1, Math.round(count * 0.05));
      for (let i = 0; i < count; i++) {
        if (Math.abs(i - gapCenter) <= gapHalfWidth) {
          gaps[i] = true;
          heights.push(0);
        } else {
          heights.push((0.42 + rng() * 0.42) * jitter());
        }
      }
      break;
    }
    case 'grid-sprawl':
    default: {
      for (let i = 0; i < count; i++) {
        heights.push((0.26 + rng() * 0.22) * jitter());
      }
      break;
    }
  }

  return { heights, gaps };
}

/**
 * Some shapes (coastal-bay's inland->water taper) are authored
 * left-to-right by default; this flips them so `waterOrientation` actually
 * changes the rendered art instead of sitting unused. Not a literal compass
 * mapping (this is abstract poster art, not a functional map like
 * `UrbanSprawlMap.tsx`) — just a deterministic, seed-independent variety
 * knob tied to a real data field.
 */
function shouldMirror(waterOrientation: MorphologyProfile['waterOrientation']): boolean {
  return waterOrientation === 'east' || waterOrientation === 'north';
}

// ── Building layout + roofline paths ────────────────────────────────────

interface Building {
  x: number;
  width: number;
  topY: number;
}

function layoutBuildings(
  envelope: EnvelopeResult,
  groundY: number,
  amplitude: number,
  minFrac: number,
  rng: () => number
): Building[] {
  const count = envelope.heights.length;
  const slotWidth = W / count;
  const buildings: Building[] = [];
  for (let i = 0; i < count; i++) {
    if (envelope.gaps[i]) continue;
    const widthFrac = 0.84 + rng() * 0.12; // leaves a thin gutter between buildings
    const width = slotWidth * widthFrac;
    const x = i * slotWidth + (slotWidth - width) / 2;
    const h = minFrac * amplitude + envelope.heights[i] * amplitude * (1 - minFrac);
    buildings.push({ x, width, topY: groundY - h });
  }
  return buildings;
}

interface Antenna {
  x: number;
  y1: number;
  y2: number;
  beacon: boolean;
}

/**
 * Emits the top edge of one building as path segments (starting with the
 * left wall implied by the caller's `L x,groundY` before it). Detailed
 * (front) layers get the full roofline vocabulary — Art-Deco setbacks,
 * pitched/slanted roofs, domes, antenna masts; far/mid layers stay simple
 * so distance reads as haze, not noise. Antenna masts are pushed into
 * `antennae` and drawn separately as `<line>`s (a 2px stroke holds up
 * better than a 2px filled notch in the silhouette path).
 */
function roofTop(
  b: Building,
  hFrac: number,
  detailed: boolean,
  isLandmark: boolean,
  rng: () => number,
  antennae: Antenna[]
): string {
  const { x, width: w, topY: t } = b;
  const x2 = x + w;
  const cx = x + w / 2;

  if (isLandmark) {
    // Three-tier Art-Deco crown + a long mast with a red aircraft beacon.
    const s1 = 14 + rng() * 8;
    const s2 = s1 + 14 + rng() * 8;
    const i1 = w * 0.16;
    const i2 = w * 0.32;
    antennae.push({ x: cx, y1: t, y2: t - (42 + rng() * 22), beacon: true });
    return (
      `L ${f(x)} ${f(t + s2)} L ${f(x + i1)} ${f(t + s2)} L ${f(x + i1)} ${f(t + s1)} ` +
      `L ${f(x + i2)} ${f(t + s1)} L ${f(x + i2)} ${f(t)} L ${f(x2 - i2)} ${f(t)} ` +
      `L ${f(x2 - i2)} ${f(t + s1)} L ${f(x2 - i1)} ${f(t + s1)} L ${f(x2 - i1)} ${f(t + s2)} L ${f(x2)} ${f(t + s2)}`
    );
  }

  if (!detailed) {
    const r = rng();
    if (r < 0.62) return `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t)}`;
    if (r < 0.86) {
      // Single side-step.
      const s = 8 + rng() * 12;
      const xs = x + w * (0.3 + rng() * 0.4);
      return rng() < 0.5
        ? `L ${f(x)} ${f(t)} L ${f(xs)} ${f(t)} L ${f(xs)} ${f(t + s)} L ${f(x2)} ${f(t + s)}`
        : `L ${f(x)} ${f(t + s)} L ${f(xs)} ${f(t + s)} L ${f(xs)} ${f(t)} L ${f(x2)} ${f(t)}`;
    }
    const rise = Math.min(w * 0.3, 14);
    return rng() < 0.5
      ? `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t + rise)}`
      : `L ${f(x)} ${f(t + rise)} L ${f(x2)} ${f(t)}`;
  }

  if (hFrac > 0.62) {
    // Tall towers: setback crowns and mast-topped slabs.
    const r = rng();
    if (r < 0.34) {
      const step = 12 + rng() * 14;
      const inset = w * 0.24;
      if (rng() < 0.65) antennae.push({ x: cx, y1: t, y2: t - (14 + rng() * 22), beacon: false });
      return (
        `L ${f(x)} ${f(t + step)} L ${f(x + inset)} ${f(t + step)} L ${f(x + inset)} ${f(t)} ` +
        `L ${f(x2 - inset)} ${f(t)} L ${f(x2 - inset)} ${f(t + step)} L ${f(x2)} ${f(t + step)}`
      );
    }
    if (r < 0.62) {
      const s1 = 10 + rng() * 8;
      const s2 = s1 + 10 + rng() * 8;
      const i1 = w * 0.14;
      const i2 = w * 0.3;
      return (
        `L ${f(x)} ${f(t + s2)} L ${f(x + i1)} ${f(t + s2)} L ${f(x + i1)} ${f(t + s1)} ` +
        `L ${f(x + i2)} ${f(t + s1)} L ${f(x + i2)} ${f(t)} L ${f(x2 - i2)} ${f(t)} ` +
        `L ${f(x2 - i2)} ${f(t + s1)} L ${f(x2 - i1)} ${f(t + s1)} L ${f(x2 - i1)} ${f(t + s2)} L ${f(x2)} ${f(t + s2)}`
      );
    }
    if (rng() < 0.55) antennae.push({ x: cx, y1: t, y2: t - (16 + rng() * 26), beacon: false });
    return `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t)}`;
  }

  if (hFrac > 0.32) {
    // Mid-rises: flat, slanted, stepped, occasional dome.
    const r = rng();
    if (r < 0.38) return `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t)}`;
    if (r < 0.58) {
      const rise = Math.min(w * 0.4, 26);
      return rng() < 0.5
        ? `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t + rise)}`
        : `L ${f(x)} ${f(t + rise)} L ${f(x2)} ${f(t)}`;
    }
    if (r < 0.82) {
      const s = 10 + rng() * 12;
      const xs = x + w * (0.3 + rng() * 0.4);
      return rng() < 0.5
        ? `L ${f(x)} ${f(t)} L ${f(xs)} ${f(t)} L ${f(xs)} ${f(t + s)} L ${f(x2)} ${f(t + s)}`
        : `L ${f(x)} ${f(t + s)} L ${f(xs)} ${f(t + s)} L ${f(xs)} ${f(t)} L ${f(x2)} ${f(t)}`;
    }
    const dh = Math.min(w * 0.5, 30);
    return `L ${f(x)} ${f(t + dh)} Q ${f(cx)} ${f(t - dh)} ${f(x2)} ${f(t + dh)}`;
  }

  // Low-rises: flat parapets and pitched roofs.
  if (rng() < 0.5) return `L ${f(x)} ${f(t)} L ${f(x2)} ${f(t)}`;
  const rise = Math.min(w * 0.34, 22);
  return `L ${f(x)} ${f(t + rise)} L ${f(cx)} ${f(t)} L ${f(x2)} ${f(t + rise)}`;
}

interface SkylineResult {
  d: string;
  antennae: Antenna[];
}

/**
 * One skyline layer as a single continuous filled silhouette: along the
 * ground between buildings, up and over each varied roofline, closed to the
 * bottom of frame (the water plane paints over everything below `groundY`
 * afterwards, so gaps read as open water without any masking).
 */
function buildSkylinePath(
  buildings: Building[],
  groundY: number,
  amplitude: number,
  detailed: boolean,
  landmarkIndex: number,
  rng: () => number
): SkylineResult {
  const antennae: Antenna[] = [];
  let d = `M 0 ${H} L 0 ${f(groundY)}`;
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const hFrac = clamp((groundY - b.topY) / Math.max(1, amplitude), 0, 1.4);
    d += ` L ${f(b.x)} ${f(groundY)}`;
    d += ` ${roofTop(b, hFrac, detailed, i === landmarkIndex, rng, antennae)}`;
    d += ` L ${f(b.x + b.width)} ${f(groundY)}`;
  }
  d += ` L ${W} ${f(groundY)} L ${W} ${H} Z`;
  return { d, antennae };
}

// ── Pixel-space gap ranges (for bridges / island humps / channel glints) ─

interface GapRange {
  x0: number;
  x1: number;
}

function findGapRanges(envelope: EnvelopeResult): GapRange[] {
  const count = envelope.gaps.length;
  const slotWidth = W / count;
  const ranges: GapRange[] = [];
  let start = -1;
  for (let i = 0; i <= count; i++) {
    const isGap = i < count && envelope.gaps[i];
    if (isGap && start === -1) start = i;
    if (!isGap && start !== -1) {
      ranges.push({ x0: start * slotWidth, x1: i * slotWidth });
      start = -1;
    }
  }
  return ranges;
}

// ── Layer specs ─────────────────────────────────────────────────────────

interface LayerSpec {
  ampFrac: number;
  minFrac: number;
  countRange: [number, number];
}

const LAYER_SPECS: Record<'back' | 'mid' | 'front', LayerSpec> = {
  back: { ampFrac: 0.26, minFrac: 0.34, countRange: [8, 13] },
  mid: { ampFrac: 0.33, minFrac: 0.3, countRange: [11, 17] },
  front: { ampFrac: 0.44, minFrac: 0.24, countRange: [14, 26] },
};

// ── Main builder ────────────────────────────────────────────────────────

/**
 * Builds the full postcard poster for a city as a single Satori-safe JSX
 * tree: one flex `<div>` carrying the gradient sky as a CSS background, and
 * one `<svg viewBox="0 0 1200 630">` filling it, painted strictly back to
 * front (glow → stars/clouds → sun/moon → terrain → skyline layers →
 * water → signature details → postmark → frame) so nearer elements occlude
 * farther ones through plain SVG paint order — no z-index or absolute
 * positioning, matching every other Satori tree in this app.
 *
 * Deterministic per `city.morphology.seed`: every random draw below comes
 * from the single `rng` closure seeded from it, pulled in a fixed order, so
 * the same city always renders pixel-identical art.
 */
export function buildPostcardLayout(city: City, options?: { showCaption?: boolean }) {
  const { seed, type, sprawlScaleKm, ringsCount, waterOrientation, primaryWater } = city.morphology;
  const rng = createRng(seed);

  const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
  const mirror = shouldMirror(waterOrientation);
  const hasWater = primaryWater !== 'inland-dry';

  // Water cities stand on a waterline with a real water plane below it;
  // inland-dry cities sit deeper in frame on a dark ground plane instead.
  const groundY = hasWater ? 500 : 540;

  // sprawlScaleKm ~12 (compact/tall) .. ~70 (sprawling/low) in the current
  // dataset — mapped to a 0..1 "density" that drives both building COUNT
  // (more, smaller buildings as sprawl grows) and average HEIGHT (shorter as
  // sprawl grows), so a compact radial city and a wide grid-sprawl one read
  // as visibly different silhouettes even before the envelope shape kicks in.
  const densityT = clamp((clamp(sprawlScaleKm, 12, 70) - 12) / (70 - 12), 0, 1);
  const heightScale = lerp(1.12, 0.72, densityT);

  // Envelopes and layouts are computed before any celestial placement so the
  // sun/moon can be biased toward the *low* side of the actual skyline.
  const layers = (['back', 'mid', 'front'] as const).map((key) => {
    const spec = LAYER_SPECS[key];
    const amplitude = H * spec.ampFrac * heightScale;
    const count = Math.round(lerp(spec.countRange[0], spec.countRange[1], densityT));
    const envelope = buildEnvelope(type, count, rng, ringsCount);
    if (mirror) {
      envelope.heights.reverse();
      envelope.gaps.reverse();
    }
    const buildings = layoutBuildings(envelope, groundY, amplitude, spec.minFrac, rng);
    return { key, spec, amplitude, envelope, buildings };
  });
  const front = layers[2];

  // Landmark: the tallest front-layer building gets a deco crown + mast.
  let landmarkIndex = -1;
  let landmarkTop = Infinity;
  for (let i = 0; i < front.buildings.length; i++) {
    if (front.buildings[i].topY < landmarkTop) {
      landmarkTop = front.buildings[i].topY;
      landmarkIndex = i;
    }
  }
  if (landmarkIndex >= 0) {
    front.buildings[landmarkIndex] = {
      ...front.buildings[landmarkIndex],
      topY: front.buildings[landmarkIndex].topY - front.amplitude * 0.12,
    };
  }

  // Sun/moon goes over the lower half of the front skyline (so the tall side
  // frames it rather than swallowing it), clear of the top-right postmark.
  const half = Math.floor(front.envelope.heights.length / 2);
  const avgLeft = front.envelope.heights.slice(0, half).reduce((a, b) => a + b, 0) / Math.max(1, half);
  const avgRight =
    front.envelope.heights.slice(half).reduce((a, b) => a + b, 0) /
    Math.max(1, front.envelope.heights.length - half);
  const lowSideLeft = avgLeft <= avgRight;

  const discR = palette.night ? 30 + rng() * 14 : 64 + rng() * 32;
  const discCx = clamp(lowSideLeft ? W * (0.12 + rng() * 0.28) : W * (0.58 + rng() * 0.26), 100, W - 190);
  // Day suns sit just above the local roofline — the tallest building near
  // the disc eclipses its lower edge, never swallows it whole. Night moons
  // hang high in the starfield.
  let localTop = groundY - front.amplitude * 0.5;
  for (const layer of layers) {
    for (const b of layer.buildings) {
      if (b.x < discCx + discR * 1.4 && b.x + b.width > discCx - discR * 1.4) {
        localTop = Math.min(localTop, b.topY);
      }
    }
  }
  const discCy = palette.night
    ? H * (0.14 + rng() * 0.13)
    : clamp(localTop - discR * 0.35, H * 0.16, groundY - discR * 0.7);

  const children: ReactNode[] = [];

  // 1. Horizon pooling — big soft glow circles low in frame under the sun's
  // x, warming the gradient where the light source lives.
  children.push(
    <g key="pool">
      {[560, 470, 380, 290, 200].map((r, i) => (
        <circle key={`pool-${i}`} cx={f(discCx)} cy={f(groundY + 30)} r={r} fill={palette.glow} opacity={0.016} />
      ))}
    </g>
  );

  // 2a. Haze bands just above the horizon — luminous atmospheric depth.
  children.push(
    <g key="haze">
      <rect x={0} y={f(groundY - 72)} width={W} height={30} fill={palette.glow} opacity={0.045} />
      <rect x={0} y={f(groundY - 38)} width={W} height={22} fill={palette.glow} opacity={0.06} />
    </g>
  );

  // 2b. Stars (night) or clouds (dusk/dawn). Dusk gets a few faint early
  // stars high in frame too.
  if (palette.night) {
    const starCount = 54 + Math.floor(rng() * 26);
    const stars: ReactNode[] = [];
    for (let i = 0; i < starCount; i++) {
      const sx = rng() * W;
      const sy = Math.pow(rng(), 1.7) * H * 0.55;
      const dx = sx - discCx;
      const dy = sy - discCy;
      if (Math.sqrt(dx * dx + dy * dy) < discR * 2.4) continue; // keep moon's halo clean
      stars.push(
        <circle key={`s-${i}`} cx={f(sx)} cy={f(sy)} r={f(0.6 + rng() * 1.1)} fill={palette.star} opacity={f(0.2 + rng() * 0.6)} />
      );
    }
    // A few four-point sparkles among the round stars.
    for (let i = 0; i < 5; i++) {
      const sx = 60 + rng() * (W - 120);
      const sy = 30 + Math.pow(rng(), 1.5) * H * 0.4;
      const len = 4 + rng() * 4;
      stars.push(
        <g key={`sp-${i}`}>
          <line x1={f(sx - len)} y1={f(sy)} x2={f(sx + len)} y2={f(sy)} stroke={palette.star} strokeWidth={1} opacity={0.55} />
          <line x1={f(sx)} y1={f(sy - len)} x2={f(sx)} y2={f(sy + len)} stroke={palette.star} strokeWidth={1} opacity={0.55} />
        </g>
      );
    }
    // Occasional shooting star.
    if (rng() < 0.22) {
      const mx = W * (0.25 + rng() * 0.5);
      const my = 40 + rng() * 90;
      const len = 70 + rng() * 60;
      stars.push(
        <g key="meteor">
          <line x1={f(mx)} y1={f(my)} x2={f(mx + len)} y2={f(my + len * 0.32)} stroke={palette.star} strokeWidth={1.5} opacity={0.22} />
          <line x1={f(mx + len * 0.55)} y1={f(my + len * 0.176)} x2={f(mx + len)} y2={f(my + len * 0.32)} stroke={palette.star} strokeWidth={1.5} opacity={0.5} />
          <circle cx={f(mx + len)} cy={f(my + len * 0.32)} r={1.8} fill={palette.star} opacity={0.8} />
        </g>
      );
    }
    children.push(<g key="stars">{stars}</g>);
  } else {
    const clouds: ReactNode[] = [];
    // Faint early stars at the very top of a dusk/dawn sky.
    for (let i = 0; i < 8; i++) {
      clouds.push(
        <circle key={`es-${i}`} cx={f(rng() * W)} cy={f(rng() * H * 0.2)} r={f(0.6 + rng())} fill={palette.star} opacity={f(0.1 + rng() * 0.16)} />
      );
    }
    // Long thin streak clouds (stylized stratus) — deliberately banded, so
    // they read as drifting poster clouds rather than blobs.
    const cloudCount = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < cloudCount; i++) {
      const cxc = W * (0.04 + rng() * 0.6);
      const cyc = H * (0.14 + rng() * 0.28);
      const len = 170 + rng() * 200;
      const bh = 6 + rng() * 5;
      clouds.push(
        <g key={`cl-${i}`}>
          <path d={`M ${f(cxc)} ${f(cyc)} Q ${f(cxc + len / 2)} ${f(cyc - bh * 2)} ${f(cxc + len)} ${f(cyc)} Z`} fill={palette.cloud} opacity={0.12} />
          <path
            d={`M ${f(cxc + len * 0.24)} ${f(cyc + bh + 5)} Q ${f(cxc + len * 0.54)} ${f(cyc + bh + 5 - bh * 1.7)} ${f(cxc + len * 0.86)} ${f(cyc + bh + 5)} Z`}
            fill={palette.cloud}
            opacity={0.08}
          />
        </g>
      );
    }
    children.push(<g key="clouds">{clouds}</g>);
  }

  // 3. The disc — huge low poster sun with a layered halo, or a moon.
  if (palette.night) {
    const halo = [3.0, 2.55, 2.15, 1.8, 1.5, 1.25].map((m, i) => (
      <circle key={`h-${i}`} cx={f(discCx)} cy={f(discCy)} r={f(discR * m)} fill={palette.disc} opacity={0.012 + i * 0.005} />
    ));
    if (palette.moonStyle === 'crescent') {
      // Crescent via two cubic-approximated arcs (outer semicircle out,
      // shallower elliptical arc back).
      const k = 0.5523;
      const b = discR * 0.45;
      const cd = `M ${f(discCx)} ${f(discCy - discR)} C ${f(discCx + k * discR)} ${f(discCy - discR)} ${f(discCx + discR)} ${f(discCy - k * discR)} ${f(discCx + discR)} ${f(discCy)} C ${f(discCx + discR)} ${f(discCy + k * discR)} ${f(discCx + k * discR)} ${f(discCy + discR)} ${f(discCx)} ${f(discCy + discR)} C ${f(discCx + k * b)} ${f(discCy + discR)} ${f(discCx + b)} ${f(discCy + k * discR)} ${f(discCx + b)} ${f(discCy)} C ${f(discCx + b)} ${f(discCy - k * discR)} ${f(discCx + k * b)} ${f(discCy - discR)} ${f(discCx)} ${f(discCy - discR)} Z`;
      children.push(
        <g key="moon">
          {halo}
          <path d={cd} fill={palette.disc} opacity={0.95} />
        </g>
      );
    } else {
      children.push(
        <g key="moon">
          {halo}
          <circle cx={f(discCx)} cy={f(discCy)} r={f(discR)} fill={palette.disc} opacity={0.95} />
          <circle cx={f(discCx - discR * 0.3)} cy={f(discCy - discR * 0.15)} r={f(discR * 0.16)} fill={palette.mid} opacity={0.35} />
          <circle cx={f(discCx + discR * 0.22)} cy={f(discCy + discR * 0.28)} r={f(discR * 0.11)} fill={palette.mid} opacity={0.3} />
          <circle cx={f(discCx + discR * 0.05)} cy={f(discCy - discR * 0.42)} r={f(discR * 0.08)} fill={palette.mid} opacity={0.25} />
        </g>
      );
    }
  } else {
    children.push(
      <g key="sun">
        {[3.05, 2.55, 2.1, 1.7, 1.35].map((m, i) => (
          <circle key={`h-${i}`} cx={f(discCx)} cy={f(discCy)} r={f(discR * m)} fill={palette.glow} opacity={0.02 + i * 0.008} />
        ))}
        <circle cx={f(discCx)} cy={f(discCy)} r={f(discR)} fill={palette.disc} opacity={0.94} />
        <circle cx={f(discCx - discR * 0.08)} cy={f(discCy - discR * 0.12)} r={f(discR * 0.58)} fill={palette.discCore} opacity={0.75} />
      </g>
    );
  }

  // 4. Morphology signature terrain, behind every skyline layer.
  const frontGaps = findGapRanges(front.envelope);
  if (type === 'valley-basin') {
    // Ridge walls must tower over even the tall valley-edge buildings, or
    // the skyline hides them and the basin reads like any other city.
    const rhL = H * (0.4 + rng() * 0.1);
    const rhR = H * (0.4 + rng() * 0.1);
    children.push(
      <g key="ridges">
        <path d={`M 0 ${H} L 0 ${f(groundY - rhL)} Q ${f(W * 0.2)} ${f(groundY - rhL * 0.52)} ${f(W * 0.46)} ${f(groundY)} L ${f(W * 0.46)} ${H} Z`} fill={palette.far} opacity={0.9} />
        <path d={`M ${W} ${H} L ${W} ${f(groundY - rhR)} Q ${f(W * 0.8)} ${f(groundY - rhR * 0.52)} ${f(W * 0.54)} ${f(groundY)} L ${f(W * 0.54)} ${H} Z`} fill={palette.far} opacity={0.9} />
        <path d={`M 0 ${H} L 0 ${f(groundY - rhL * 0.62)} Q ${f(W * 0.14)} ${f(groundY - rhL * 0.34)} ${f(W * 0.34)} ${f(groundY)} L ${f(W * 0.34)} ${H} Z`} fill={palette.mid} opacity={0.9} />
        <path d={`M ${W} ${H} L ${W} ${f(groundY - rhR * 0.62)} Q ${f(W * 0.86)} ${f(groundY - rhR * 0.34)} ${f(W * 0.66)} ${f(groundY)} L ${f(W * 0.66)} ${H} Z`} fill={palette.mid} opacity={0.9} />
      </g>
    );
  } else if (type === 'coastal-bay') {
    // Headland hill on the water (low) side of the taper.
    const hh = H * (0.12 + rng() * 0.08);
    const onLeft = !mirror; // taper authored low→high L→R; mirror puts low side right→left, so headland goes on the opposite (low) side
    children.push(
      <g key="headland">
        {onLeft ? (
          <path d={`M 0 ${H} L 0 ${f(groundY - hh)} Q ${f(W * 0.11)} ${f(groundY - hh * 0.85)} ${f(W * 0.26)} ${f(groundY)} L ${f(W * 0.26)} ${H} Z`} fill={palette.far} opacity={0.6} />
        ) : (
          <path d={`M ${W} ${H} L ${W} ${f(groundY - hh)} Q ${f(W * 0.89)} ${f(groundY - hh * 0.85)} ${f(W * 0.74)} ${f(groundY)} L ${f(W * 0.74)} ${H} Z`} fill={palette.far} opacity={0.6} />
        )}
      </g>
    );
  } else if (type === 'island-archipelago') {
    // Distant island humps behind/among the cluster gaps.
    const humps: ReactNode[] = [];
    const positions = frontGaps.length > 0 ? frontGaps.map((g) => (g.x0 + g.x1) / 2) : [W * 0.25, W * 0.7];
    positions.slice(0, 4).forEach((hx, i) => {
      const hw = 70 + rng() * 90;
      const hHeight = 16 + rng() * 26;
      humps.push(
        <path key={`hump-${i}`} d={`M ${f(hx - hw)} ${f(groundY)} Q ${f(hx)} ${f(groundY - hHeight)} ${f(hx + hw)} ${f(groundY)} Z`} fill={palette.far} opacity={0.7} />
      );
    });
    children.push(<g key="humps">{humps}</g>);
  } else if (type === 'radial-concentric') {
    // Faint concentric "ring road" arcs rising over the city's heart.
    const ringN = clamp(Math.round(ringsCount ?? 3), 2, 4);
    children.push(
      <g key="rings">
        {Array.from({ length: ringN }, (_, i) => (
          <circle
            key={`ring-${i}`}
            cx={f(W / 2)}
            cy={f(groundY + 50)}
            r={f(150 + i * 95)}
            fill="none"
            stroke={palette.glow}
            strokeWidth={1.5}
            opacity={f(0.09 - i * 0.018)}
          />
        ))}
      </g>
    );
  }

  // 5. The three skyline silhouettes, far → near.
  const layerColors = [palette.far, palette.mid, palette.near];
  const skylines = layers.map((layer, i) => {
    const detailed = i === 2;
    return {
      layer,
      color: layerColors[i],
      result: buildSkylinePath(
        layer.buildings,
        groundY,
        layer.amplitude,
        detailed,
        detailed ? landmarkIndex : -1,
        rng
      ),
    };
  });

  for (let i = 0; i < skylines.length; i++) {
    const { color, result } = skylines[i];
    children.push(
      <g key={`skyline-${i}`}>
        <path d={result.d} fill={color} />
        {result.antennae.map((a, j) => (
          <g key={`ant-${i}-${j}`}>
            <line x1={f(a.x)} y1={f(a.y1)} x2={f(a.x)} y2={f(a.y2)} stroke={color} strokeWidth={2.5} />
            {a.beacon ? <circle cx={f(a.x)} cy={f(a.y2 - 2)} r={2.6} fill={BEACON_RED} opacity={0.9} /> : null}
          </g>
        ))}
      </g>
    );
  }

  // 6. Window lights on the front layer — sparse, warm, biased upward.
  const windows: ReactNode[] = [];
  for (const b of front.buildings) {
    const bh = groundY - b.topY;
    if (bh < 70 || b.width < 16) continue;
    const n = clamp(Math.round(bh / 52), 1, 4);
    for (let i = 0; i < n; i++) {
      const wx = b.x + 5 + rng() * (b.width - 12);
      const wy = b.topY + 12 + rng() * (bh * 0.55);
      windows.push(
        <rect key={`w-${windows.length}`} x={f(wx)} y={f(wy)} width={4} height={7} fill={palette.window} opacity={f(0.35 + rng() * 0.5)} />
      );
    }
  }
  children.push(<g key="windows">{windows}</g>);

  // 7. Water plane (or dark ground for inland-dry cities).
  if (hasWater) {
    const waterBits: ReactNode[] = [];
    waterBits.push(<rect key="wbase" x={0} y={f(groundY)} width={W} height={f(H - groundY)} fill={palette.waterDeep} />);
    // Crisp lit waterline at the horizon.
    waterBits.push(<line key="wline" x1={0} y1={f(groundY + 0.75)} x2={W} y2={f(groundY + 0.75)} stroke={palette.glow} strokeWidth={1.5} opacity={0.28} />);
    // Shimmering glint column under the sun/moon.
    const glintRows = 8;
    for (let i = 0; i < glintRows; i++) {
      const gy = groundY + 12 + i * ((H - groundY - 24) / glintRows) + rng() * 5;
      const halfW = (discR * (palette.night ? 1.5 : 0.9)) * (1 - i / (glintRows + 2)) * (0.55 + rng() * 0.7);
      const off = (rng() - 0.5) * 26;
      waterBits.push(
        <line key={`g-${i}`} x1={f(discCx + off - halfW)} y1={f(gy)} x2={f(discCx + off + halfW)} y2={f(gy)} stroke={palette.glint} strokeWidth={2.5} opacity={f(0.5 - i * 0.048)} />
      );
    }
    // Drifting ripples across the rest of the water.
    for (let i = 0; i < 6; i++) {
      const ry = groundY + 16 + rng() * (H - groundY - 30);
      const rx0 = rng() * W * 0.55;
      const rx1 = rx0 + W * (0.16 + rng() * 0.3);
      waterBits.push(
        <line key={`r-${i}`} x1={f(rx0)} y1={f(ry)} x2={f(Math.min(rx1, W))} y2={f(ry)} stroke={palette.waterLight} strokeWidth={1.5} opacity={f(0.07 + rng() * 0.09)} />
      );
    }
    // Faint dark reflections under every other foreground tower.
    front.buildings.forEach((b, i) => {
      if (i % 2 !== 0) return;
      const bh = groundY - b.topY;
      waterBits.push(
        <rect
          key={`refl-${i}`}
          x={f(b.x + b.width * 0.32)}
          y={f(groundY + 3)}
          width={f(b.width * 0.36)}
          height={f(Math.min(34, bh * 0.2))}
          fill="#020308"
          opacity={0.28}
        />
      );
    });
    children.push(<g key="water">{waterBits}</g>);
  } else {
    children.push(
      <g key="ground">
        <rect x={0} y={f(groundY)} width={W} height={f(H - groundY)} fill={palette.near} />
        <line x1={0} y1={f(groundY + 0.75)} x2={W} y2={f(groundY + 0.75)} stroke={palette.glow} strokeWidth={1.5} opacity={0.18} />
      </g>
    );
  }

  // 8. Morphology signature foreground details.
  if (type === 'linear-river' && hasWater && frontGaps.length > 0) {
    // A suspension bridge across the widest channel.
    const gap = frontGaps.reduce((a, b) => (b.x1 - b.x0 > a.x1 - a.x0 ? b : a));
    const deckY = groundY - 16;
    const t1x = gap.x0 + 10;
    const t2x = gap.x1 - 10;
    const towerTop = deckY - 52;
    const midX = (t1x + t2x) / 2;
    const hangers: ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      const tt = i / 6;
      const hx = t1x + (t2x - t1x) * tt;
      // Quadratic Bezier y at tt for P0=(t1x,towerTop) C=(midX,deckY-2) P2=(t2x,towerTop)
      const hy = (1 - tt) * (1 - tt) * towerTop + 2 * (1 - tt) * tt * (deckY - 2) + tt * tt * towerTop;
      hangers.push(<line key={`hang-${i}`} x1={f(hx)} y1={f(hy)} x2={f(hx)} y2={f(deckY)} stroke={palette.near} strokeWidth={1.5} opacity={0.9} />);
    }
    children.push(
      <g key="bridge">
        <line x1={f(gap.x0 - 26)} y1={f(deckY)} x2={f(gap.x1 + 26)} y2={f(deckY)} stroke={palette.near} strokeWidth={5} />
        <line x1={f(t1x)} y1={f(deckY + 8)} x2={f(t1x)} y2={f(towerTop)} stroke={palette.near} strokeWidth={4} />
        <line x1={f(t2x)} y1={f(deckY + 8)} x2={f(t2x)} y2={f(towerTop)} stroke={palette.near} strokeWidth={4} />
        <path d={`M ${f(t1x)} ${f(towerTop)} Q ${f(midX)} ${f(deckY - 2)} ${f(t2x)} ${f(towerTop)}`} fill="none" stroke={palette.near} strokeWidth={2.5} />
        {hangers}
      </g>
    );
  }
  if (type === 'delta-estuary' && hasWater && frontGaps.length > 0) {
    // Each channel gap shimmers — stacked glints so the water reads as
    // distributaries threading the skyline, not empty slots.
    const channelGlints: ReactNode[] = [];
    frontGaps.forEach((gap, gi) => {
      const gcx = (gap.x0 + gap.x1) / 2;
      const gw = gap.x1 - gap.x0;
      for (let i = 0; i < 4; i++) {
        const gy = groundY + 14 + i * 22 + rng() * 6;
        const halfW = (gw * 0.5) * (1 - i * 0.16) * (0.7 + rng() * 0.5);
        channelGlints.push(
          <line
            key={`ch-${gi}-${i}`}
            x1={f(gcx - halfW)}
            y1={f(gy)}
            x2={f(gcx + halfW)}
            y2={f(gy)}
            stroke={palette.waterLight}
            strokeWidth={2}
            opacity={f(0.22 - i * 0.045)}
          />
        );
      }
    });
    children.push(<g key="channels">{channelGlints}</g>);
  }
  if ((type === 'island-archipelago' || (type === 'coastal-bay' && primaryWater === 'bay-harbor')) && hasWater) {
    // A couple of tiny sailboats out on the water.
    const boats: ReactNode[] = [];
    const boatCount = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < boatCount; i++) {
      const bx = W * (0.14 + rng() * 0.72);
      const by = groundY + 30 + rng() * 55;
      boats.push(
        <g key={`boat-${i}`}>
          <path d={`M ${f(bx - 13)} ${f(by)} L ${f(bx + 13)} ${f(by)} L ${f(bx + 8)} ${f(by + 6)} L ${f(bx - 8)} ${f(by + 6)} Z`} fill={palette.near} opacity={0.9} />
          <line x1={f(bx)} y1={f(by)} x2={f(bx)} y2={f(by - 19)} stroke={palette.near} strokeWidth={1.5} opacity={0.9} />
          <path d={`M ${f(bx + 1.5)} ${f(by - 3)} L ${f(bx + 1.5)} ${f(by - 18)} L ${f(bx + 11)} ${f(by - 5)} Z`} fill={palette.near} opacity={0.85} />
        </g>
      );
    }
    children.push(<g key="boats">{boats}</g>);
  }

  // 9. Gulls near the water on dusk/dawn cards.
  if (!palette.night && hasWater) {
    const birds: ReactNode[] = [];
    const birdCount = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < birdCount; i++) {
      const bx = clamp(discCx + (rng() - 0.5) * W * 0.5, 60, W - 100);
      const by = H * (0.24 + rng() * 0.26);
      const bw = 7 + rng() * 6;
      const bh = 4 + rng() * 3;
      birds.push(
        <path
          key={`bird-${i}`}
          d={`M ${f(bx - bw)} ${f(by)} Q ${f(bx - bw / 2)} ${f(by - bh)} ${f(bx)} ${f(by)} Q ${f(bx + bw / 2)} ${f(by - bh)} ${f(bx + bw)} ${f(by)}`}
          fill="none"
          stroke={palette.near}
          strokeWidth={2}
          opacity={0.75}
        />
      );
    }
    children.push(<g key="birds">{birds}</g>);
  }

  // 10. Corner postmark — double circle with wavy cancellation bars, like a
  // real franking mark, tying the route back to the "postcard" concept.
  const pmCx = W - 86;
  const pmCy = 78;
  const wavyBars: ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const by = pmCy - 13 + i * 13;
    const bx0 = pmCx - 178;
    let d = `M ${f(bx0)} ${f(by)}`;
    for (let s = 0; s < 4; s++) {
      const sx = bx0 + s * 38;
      const dir = s % 2 === 0 ? -5 : 5;
      d += ` Q ${f(sx + 19)} ${f(by + dir)} ${f(sx + 38)} ${f(by)}`;
    }
    wavyBars.push(<path key={`bar-${i}`} d={d} fill="none" stroke={INK} strokeWidth={2} opacity={0.2} />);
  }
  children.push(
    <g key="postmark">
      {wavyBars}
      <circle cx={pmCx} cy={pmCy} r={36} fill="none" stroke={INK} strokeWidth={2} opacity={0.3} />
      <circle cx={pmCx} cy={pmCy} r={28} fill="none" stroke={INK} strokeWidth={1} opacity={0.18} />
    </g>
  );

  // 11. Double poster frame.
  children.push(
    <g key="frame">
      <rect x={16} y={16} width={W - 32} height={H - 32} fill="none" stroke="rgba(244,246,248,0.2)" strokeWidth={2} />
      <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke="rgba(244,246,248,0.08)" strokeWidth={1} />
    </g>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: BG,
        background: palette.sky,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'flex' }}>
        {children}
      </svg>
      {/* Only the OG/Twitter image routes opt into this — page.tsx renders
          its own richer caption (name/flag/country/Köppen) as sibling divs
          below the art, so embedding one here too would double it up. The
          OG/Twitter routes have no such wrapper (an ImageResponse's content
          IS the whole image), so without this the social-preview PNG showed
          an anonymous skyline with no indication of which city it was. */}
      {options?.showCaption && (
        <div
          style={{
            position: 'absolute',
            left: 40,
            bottom: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 40, fontWeight: 700, color: INK }}>
            <span>{getCountryFlag(city.countryCode)}</span>
            <span>{city.name}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(244,246,248,0.75)' }}>
            {city.country}
          </div>
        </div>
      )}
    </div>
  );
}
