import { describe, it, expect } from 'vitest';
import {
  ease, lerp, lerpVec2, lerpVec3, lerpColor,
  findKeyframePair, interpolateValue, getAnimatedProperty, getLayerAtTime,
} from './animation';
import type { EasingType, Keyframe, ShapeLayer } from './types';

const EASINGS: EasingType[] = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bezier'];

describe('ease', () => {
  it.each(EASINGS)('%s starts at 0 and ends at 1', (type) => {
    expect(ease(0, type)).toBeCloseTo(0);
    expect(ease(1, type)).toBeCloseTo(1);
  });

  it('linear is the identity function', () => {
    expect(ease(0.37, 'linear')).toBeCloseTo(0.37);
  });

  it('spring starts at 0 and settles close to 1 without requiring monotonicity', () => {
    expect(ease(0, 'spring')).toBeCloseTo(0);
    expect(ease(1, 'spring')).toBeGreaterThan(0.9);
  });

  it('falls back to identity for an unknown easing value', () => {
    expect(ease(0.5, 'not-a-real-easing' as EasingType)).toBe(0.5);
  });
});

describe('lerp / lerpVec2 / lerpVec3 / lerpColor', () => {
  it('lerp interpolates linearly and clamps to the endpoints at t=0/1', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 0, 0.25)).toBe(7.5);
  });

  it('lerpVec2 interpolates each axis independently', () => {
    expect(lerpVec2({ x: 0, y: 0 }, { x: 10, y: -20 }, 0.5)).toEqual({ x: 5, y: -10 });
  });

  it('lerpVec3 interpolates each axis independently', () => {
    expect(lerpVec3({ x: 0, y: 0, z: 0 }, { x: 10, y: -20, z: 4 }, 0.5)).toEqual({ x: 5, y: -10, z: 2 });
  });

  it('lerpColor blends two hex colors channel by channel', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000');
    expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('lerpColor falls back to the first color when either isn\'t a valid hex', () => {
    expect(lerpColor('not-a-color', '#ffffff', 0.5)).toBe('not-a-color');
  });
});

function kf(time: number, value: Keyframe['value'], easing: EasingType = 'linear'): Keyframe {
  return { id: `kf-${time}`, time, property: 'opacity', value, easing };
}

describe('findKeyframePair', () => {
  it('returns null prev/next when there are no keyframes for the property', () => {
    const { prev, next, t } = findKeyframePair([], 1, 'opacity');
    expect(prev).toBeNull();
    expect(next).toBeNull();
    expect(t).toBe(0);
  });

  it('ignores keyframes belonging to a different property', () => {
    const { prev, next } = findKeyframePair([{ ...kf(1, 5), property: 'x' }], 1, 'opacity');
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  it('before the first keyframe: prev is null, next is the first keyframe', () => {
    const keyframes = [kf(2, 1), kf(4, 0)];
    const { prev, next } = findKeyframePair(keyframes, 0, 'opacity');
    expect(prev).toBeNull();
    expect(next?.time).toBe(2);
  });

  it('after the last keyframe: prev and next both resolve to the last keyframe', () => {
    const keyframes = [kf(2, 1), kf(4, 0)];
    const { prev, next } = findKeyframePair(keyframes, 10, 'opacity');
    expect(prev?.time).toBe(4);
    expect(next?.time).toBe(4);
  });

  it('exactly on a keyframe: prev is that keyframe, t collapses to 0', () => {
    const keyframes = [kf(2, 1), kf(4, 0)];
    const { prev, t } = findKeyframePair(keyframes, 2, 'opacity');
    expect(prev?.time).toBe(2);
    expect(t).toBe(0);
  });

  it('between two keyframes: computes a normalized, eased t', () => {
    const keyframes = [kf(0, 0, 'linear'), kf(10, 1, 'linear')];
    const { prev, next, t } = findKeyframePair(keyframes, 5, 'opacity');
    expect(prev?.time).toBe(0);
    expect(next?.time).toBe(10);
    expect(t).toBeCloseTo(0.5);
  });

  it('handles keyframes given out of chronological order', () => {
    const keyframes = [kf(10, 1), kf(0, 0)];
    const { prev, next } = findKeyframePair(keyframes, 5, 'opacity');
    expect(prev?.time).toBe(0);
    expect(next?.time).toBe(10);
  });
});

describe('interpolateValue', () => {
  it('returns 0 when both keyframes are missing', () => {
    expect(interpolateValue(null, null, 0)).toBe(0);
  });

  it('returns the single available keyframe\'s value', () => {
    expect(interpolateValue(null, kf(1, 42), 0)).toBe(42);
    expect(interpolateValue(kf(1, 42), null, 0)).toBe(42);
  });

  it('interpolates numbers linearly with t', () => {
    expect(interpolateValue(kf(0, 0), kf(1, 100), 0.5)).toBe(50);
  });

  it('interpolates colors', () => {
    expect(interpolateValue(kf(0, '#000000'), kf(1, '#ffffff'), 0.5)).toBe('#808080');
  });

  it('interpolates Vec2/Vec3 objects', () => {
    expect(interpolateValue(kf(0, { x: 0, y: 0 }), kf(1, { x: 10, y: 10 }), 0.5)).toEqual({ x: 5, y: 5 });
    expect(interpolateValue(kf(0, { x: 0, y: 0, z: 0 }), kf(1, { x: 10, y: 10, z: 10 }), 0.5)).toEqual({ x: 5, y: 5, z: 5 });
  });
});

function makeShapeLayer(overrides: Partial<ShapeLayer> = {}): ShapeLayer {
  return {
    id: 'l1', name: 'Rect', type: 'shape', shape: 'rectangle',
    x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1,
    fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 0, cornerRadius: 0, sides: 6,
    visible: true, locked: false, keyframes: [], parentId: null,
    ...overrides,
  };
}

describe('getAnimatedProperty / getLayerAtTime', () => {
  it('getAnimatedProperty resolves a single property at a given time', () => {
    const layer = makeShapeLayer({ keyframes: [{ ...kf(0, 0), property: 'x' }, { ...kf(2, 200), property: 'x' }] });
    expect(getAnimatedProperty(layer, 'x', 1)).toBe(100);
  });

  it('getLayerAtTime returns the layer unchanged when it has no keyframes', () => {
    const layer = makeShapeLayer();
    expect(getLayerAtTime(layer, 5)).toEqual(layer);
  });

  it('getLayerAtTime overrides only the animated properties, at the given instant', () => {
    const layer = makeShapeLayer({
      x: 999, // static value, should be overridden by the keyframe track
      keyframes: [
        { id: 'x0', time: 0, property: 'x', value: 0, easing: 'linear' },
        { id: 'x1', time: 10, property: 'x', value: 100, easing: 'linear' },
      ],
    });
    const atStart = getLayerAtTime(layer, 0) as ShapeLayer;
    const atMid = getLayerAtTime(layer, 5) as ShapeLayer;
    const atEnd = getLayerAtTime(layer, 10) as ShapeLayer;
    expect(atStart.x).toBe(0);
    expect(atMid.x).toBe(50);
    expect(atEnd.x).toBe(100);
    // untouched, non-animated properties should pass through unchanged
    expect(atMid.y).toBe(layer.y);
    expect(atMid.fill).toBe(layer.fill);
  });
});
