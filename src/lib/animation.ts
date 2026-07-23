import type { EasingType, Keyframe, Layer, Vec2, Vec3 } from './types';

export function ease(t: number, type: EasingType): number {
  switch (type) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'spring':
      return 1 - Math.cos(t * Math.PI * 2) * Math.exp(-t * 4);
    case 'bezier':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default:
      return t;
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

export function lerpColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  if (!pa || !pb) return a;
  const r = Math.round(lerp(pa.r, pb.r, t));
  const g = Math.round(lerp(pa.g, pb.g, t));
  const bl = Math.round(lerp(pa.b, pb.b, t));
  return rgbToHex(r, g, bl);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export interface KeyframePair {
  prev: Keyframe | null;
  next: Keyframe | null;
  t: number;
}

export function findKeyframePair(keyframes: Keyframe[], time: number, property: string): KeyframePair {
  const relevant = keyframes.filter((k) => k.property === property).sort((a, b) => a.time - b.time);
  let prev: Keyframe | null = null;
  let next: Keyframe | null = null;
  for (const kf of relevant) {
    if (kf.time <= time) prev = kf;
    if (kf.time > time && !next) next = kf;
  }
  if (!next && prev) next = prev;
  let t = 0;
  if (prev && next && prev !== next) {
    t = (time - prev.time) / (next.time - prev.time);
    t = Math.max(0, Math.min(1, t));
    t = ease(t, next.easing);
  }
  return { prev, next, t };
}

export function interpolateValue(
  prev: Keyframe | null,
  next: Keyframe | null,
  t: number
): number | string | Vec2 | Vec3 {
  if (!prev && !next) return 0;
  if (!prev) return next!.value;
  if (!next || prev === next) return prev.value;
  if (t <= 0) return prev.value;
  if (t >= 1) return next.value;
  if (typeof prev.value === 'number' && typeof next.value === 'number') {
    return lerp(prev.value, next.value, t);
  }
  if (typeof prev.value === 'string' && typeof next.value === 'string') {
    return lerpColor(prev.value, next.value, t);
  }
  if (typeof prev.value === 'object' && 'z' in prev.value && typeof next.value === 'object' && 'z' in next.value) {
    return lerpVec3(prev.value as Vec3, next.value as Vec3, t);
  }
  if (typeof prev.value === 'object' && typeof next.value === 'object') {
    return lerpVec2(prev.value as Vec2, next.value as Vec2, t);
  }
  return prev.value;
}

export function getAnimatedProperty(layer: Layer, property: string, time: number): number | string | Vec2 | Vec3 {
  const { prev, next, t } = findKeyframePair(layer.keyframes, time, property);
  return interpolateValue(prev, next, t);
}

export function getLayerAtTime(layer: Layer, time: number): Layer {
  const animatedProps = new Set(layer.keyframes.map((k) => k.property));
  if (animatedProps.size === 0) return layer;
  const result = { ...layer } as unknown as Record<string, unknown>;
  for (const prop of animatedProps) {
    const val = getAnimatedProperty(layer, prop, time);
    result[prop] = val;
  }
  return result as unknown as Layer;
}
