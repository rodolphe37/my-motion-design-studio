import type {
  Project,
  ProjectMode,
  ProjectSettings,
  Scene,
  ShapeLayer,
  TextLayer,
  ImageLayer,
  MeshLayer,
  LightLayer,
  Camera3DLayer,
  Text3DLayer,
  AspectRatioPreset,
  ExportDefaults,
  ImportedMeshFormat,
} from './types';
import { ASPECT_RATIOS, uid } from './types';

export function getAspectRatio(preset: AspectRatioPreset): { width: number; height: number } {
  if (preset === 'custom') return { width: 1920, height: 1080 };
  const found = ASPECT_RATIOS.find((r) => r.preset === preset);
  return found ? { width: found.width, height: found.height } : { width: 1920, height: 1080 };
}

export function createDefaultSettings(mode: ProjectMode, preset: AspectRatioPreset): ProjectSettings {
  const { width, height } = getAspectRatio(preset);
  return {
    width,
    height,
    aspectRatioPreset: preset,
    fps: 30,
    backgroundColor: '#0f0f12',
    environment: mode === '3d' ? 'gradient' : 'color',
    shadows: true,
    defaultSceneDuration: 3,
    exportDefaults: {
      format: 'mp4',
      resolutionPreset: '1080p',
      quality: 'high',
      fps: 30,
    },
  };
}

export function createShapeLayer(): ShapeLayer {
  return {
    id: uid(),
    name: 'Rectangle',
    type: 'shape',
    shape: 'rectangle',
    x: 200,
    y: 200,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    fill: '#8b5cf6',
    stroke: '#ffffff',
    strokeWidth: 0,
    cornerRadius: 0,
    sides: 6,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createTextLayer(): TextLayer {
  return {
    id: uid(),
    name: 'Texte',
    type: 'text',
    x: 300,
    y: 300,
    text: 'Votre texte',
    fontSize: 64,
    fontFamily: 'Inter',
    fontWeight: 700,
    fill: '#ffffff',
    rotation: 0,
    opacity: 1,
    align: 'left',
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createImageLayer(src: string, width = 400, height = 400): ImageLayer {
  return {
    id: uid(),
    name: 'Image',
    type: 'image',
    x: 200,
    y: 200,
    width,
    height,
    rotation: 0,
    opacity: 1,
    src,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createMeshLayer(mesh: MeshLayer['mesh']): MeshLayer {
  const names: Record<string, string> = {
    box: 'Cube',
    sphere: 'Sphère',
    cone: 'Cône',
    cylinder: 'Cylindre',
    plane: 'Plan',
    torus: 'Tore',
  };
  return {
    id: uid(),
    name: names[mesh] || 'Mesh',
    type: 'mesh',
    mesh,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#8b5cf6',
    metalness: 0.3,
    roughness: 0.5,
    opacity: 1,
    castShadow: true,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createImportedMeshLayer(name: string, src: string, format: ImportedMeshFormat): MeshLayer {
  return {
    id: uid(),
    name,
    type: 'mesh',
    mesh: 'imported',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#8b5cf6',
    metalness: 0.3,
    roughness: 0.5,
    opacity: 1,
    castShadow: true,
    src,
    importedFormat: format,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createLightLayer(light: LightLayer['light']): LightLayer {
  return {
    id: uid(),
    name: `Lumière ${light}`,
    type: 'light',
    light,
    position: { x: 5, y: 5, z: 5 },
    color: '#ffffff',
    intensity: 1,
    distance: 0,
    angle: Math.PI / 6,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createText3DLayer(): Text3DLayer {
  return {
    id: uid(),
    name: 'Texte 3D',
    type: 'text3d',
    text: 'Texte 3D',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#8b5cf6',
    fontSize: 1,
    height: 0.2,
    opacity: 1,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createCamera3DLayer(): Camera3DLayer {
  return {
    id: uid(),
    name: 'Caméra',
    type: 'camera3d',
    position: { x: 0, y: 2, z: 8 },
    rotation: { x: 0, y: 0, z: 0 },
    fov: 50,
    near: 0.1,
    far: 1000,
    orthographic: false,
    visible: true,
    locked: false,
    keyframes: [],
    parentId: null,
  };
}

export function createScene(name: string, duration: number, order: number): Scene {
  return {
    id: uid(),
    name,
    duration,
    order,
    layers: [],
    transitionToNext: null,
  };
}

export function createProject(
  name: string,
  mode: ProjectMode,
  preset: AspectRatioPreset,
  settingsOverrides?: Partial<ProjectSettings>
): Project {
  const settings = { ...createDefaultSettings(mode, preset), ...settingsOverrides };
  return {
    id: uid(),
    name,
    mode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: null,
    settings,
    scenes: [createScene('Scène 1', settings.defaultSceneDuration, 0)],
  };
}

export function getExportResolution(
  project: Project,
  preset: ExportDefaults['resolutionPreset'],
  customWidth?: number,
  customHeight?: number
): { width: number; height: number } {
  if (preset === 'custom' && customWidth && customHeight) {
    return { width: customWidth, height: customHeight };
  }
  const baseHeight = preset === 'custom' ? 1080 : (
    { '480p': 480, '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160 } as const
  )[preset];
  const ratio = project.settings.width / project.settings.height;
  const height = baseHeight;
  const width = Math.round(height * ratio);
  return { width, height };
}
