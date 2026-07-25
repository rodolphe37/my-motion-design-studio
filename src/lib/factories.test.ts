import { describe, it, expect } from 'vitest';
import {
  createDefaultSettings, createShapeLayer, createTextLayer, createImageLayer,
  createMeshLayer, createImportedMeshLayer, createLightLayer, createText3DLayer,
  createCamera3DLayer, createScene, createProject, getAspectRatio, getExportResolution,
} from './factories';
import { ASPECT_RATIOS } from './types';

describe('getAspectRatio', () => {
  it.each(ASPECT_RATIOS)('resolves the known dimensions for preset "%s"', (r) => {
    expect(getAspectRatio(r.preset)).toEqual({ width: r.width, height: r.height });
  });

  it('falls back to 1920x1080 for "custom"', () => {
    expect(getAspectRatio('custom')).toEqual({ width: 1920, height: 1080 });
  });
});

describe('createDefaultSettings', () => {
  it('resolves width/height from the requested preset', () => {
    const settings = createDefaultSettings('2d', '9:16');
    expect(settings.width).toBe(1080);
    expect(settings.height).toBe(1920);
    expect(settings.aspectRatioPreset).toBe('9:16');
  });

  it('defaults 2D projects to a solid color environment and 3D projects to gradient', () => {
    expect(createDefaultSettings('2d', '16:9').environment).toBe('color');
    expect(createDefaultSettings('3d', '16:9').environment).toBe('gradient');
  });

  it('always includes sane export defaults', () => {
    const settings = createDefaultSettings('2d', '16:9');
    expect(settings.exportDefaults).toMatchObject({ format: 'mp4', resolutionPreset: '1080p', quality: 'high' });
  });
});

describe('layer factories', () => {
  it('createShapeLayer produces a rectangle with unique id and sane defaults', () => {
    const a = createShapeLayer();
    const b = createShapeLayer();
    expect(a.id).not.toBe(b.id);
    expect(a.type).toBe('shape');
    expect(a.shape).toBe('rectangle');
    expect(a.visible).toBe(true);
    expect(a.locked).toBe(false);
    expect(a.keyframes).toEqual([]);
    expect(a.sides).toBeGreaterThanOrEqual(3);
  });

  it('createTextLayer defaults to left-aligned, visible text', () => {
    const t = createTextLayer();
    expect(t.type).toBe('text');
    expect(t.align).toBe('left');
    expect(t.text.length).toBeGreaterThan(0);
  });

  it('createImageLayer uses the given src and dimensions', () => {
    const img = createImageLayer('data:image/png;base64,AAA', 320, 240);
    expect(img.src).toBe('data:image/png;base64,AAA');
    expect(img.width).toBe(320);
    expect(img.height).toBe(240);
  });

  it('createMeshLayer names the layer after its primitive kind', () => {
    expect(createMeshLayer('sphere').name).toBe('Sphère');
    expect(createMeshLayer('box').mesh).toBe('box');
  });

  it('createImportedMeshLayer preserves the given name, src, and format', () => {
    const mesh = createImportedMeshLayer('Robot', 'data:model/gltf;base64,AAA', 'gltf');
    expect(mesh.mesh).toBe('imported');
    expect(mesh.name).toBe('Robot');
    expect(mesh.importedFormat).toBe('gltf');
  });

  it('createLightLayer sets the requested light kind', () => {
    expect(createLightLayer('spot').light).toBe('spot');
    expect(createLightLayer('point').light).toBe('point');
  });

  it('createText3DLayer and createCamera3DLayer produce valid 3D layers', () => {
    expect(createText3DLayer().type).toBe('text3d');
    const cam = createCamera3DLayer();
    expect(cam.type).toBe('camera3d');
    expect(cam.orthographic).toBe(false);
  });

  it('every layer factory produces a unique id', () => {
    const ids = [createShapeLayer(), createTextLayer(), createMeshLayer('box'), createLightLayer('point')]
      .map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('createScene / createProject', () => {
  it('createScene starts with no layers and no transition', () => {
    const scene = createScene('Scène 1', 3, 0);
    expect(scene.layers).toEqual([]);
    expect(scene.transitionToNext).toBeNull();
    expect(scene.duration).toBe(3);
  });

  it('createProject seeds exactly one scene using the settings\' default duration', () => {
    const project = createProject('Mon projet', '2d', '16:9');
    expect(project.scenes).toHaveLength(1);
    expect(project.scenes[0].duration).toBe(project.settings.defaultSceneDuration);
    expect(project.mode).toBe('2d');
    expect(project.thumbnail).toBeNull();
  });

  it('createProject applies settingsOverrides on top of the computed defaults', () => {
    const project = createProject('Mon projet', '3d', '16:9', { fps: 60, shadows: false });
    expect(project.settings.fps).toBe(60);
    expect(project.settings.shadows).toBe(false);
    // untouched fields still come from the computed defaults
    expect(project.settings.width).toBe(1920);
  });
});

describe('getExportResolution', () => {
  const project = createProject('P', '2d', '16:9');

  it('scales width to match the project\'s aspect ratio for a given height preset', () => {
    expect(getExportResolution(project, '1080p')).toEqual({ width: 1920, height: 1080 });
    expect(getExportResolution(project, '720p')).toEqual({ width: 1280, height: 720 });
  });

  it('uses the explicit custom dimensions when preset is "custom" and both are given', () => {
    expect(getExportResolution(project, 'custom', 640, 480)).toEqual({ width: 640, height: 480 });
  });

  it('falls back to a 1080-tall custom render when no explicit custom size is given', () => {
    expect(getExportResolution(project, 'custom')).toEqual({ width: 1920, height: 1080 });
  });
});
