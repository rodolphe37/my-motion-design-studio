export type ProjectMode = '2d' | '3d';

export type AspectRatioPreset =
  | '16:9'
  | '9:16'
  | '1:1'
  | '4:5'
  | '4:3'
  | '3:4'
  | '16:10'
  | '21:9'
  | 'custom';

export interface ExportDefaults {
  format: 'mp4' | 'webm' | 'gif' | 'mov';
  resolutionPreset: '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'custom';
  quality: 'standard' | 'high' | 'max';
  fps: 24 | 30 | 60;
  customWidth?: number;
  customHeight?: number;
}

export interface ProjectSettings {
  width: number;
  height: number;
  aspectRatioPreset: AspectRatioPreset;
  fps: 24 | 30 | 60;
  backgroundColor: string;
  environment: 'color' | 'gradient' | 'hdri';
  shadows: boolean;
  defaultSceneDuration: number;
  exportDefaults: ExportDefaults;
}

export type LayerType2D = 'shape' | 'text' | 'image' | 'group';
export type LayerType3D = 'mesh' | 'light' | 'camera3d' | 'text3d';
export type LayerType = LayerType2D | LayerType3D;

export type ShapeKind = 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star';
export type MeshKind = 'box' | 'sphere' | 'cone' | 'cylinder' | 'plane' | 'torus' | 'imported';
export type ImportedMeshFormat = 'gltf' | 'obj';
export type LightKind = 'directional' | 'point' | 'spot' | 'ambient';

export interface Vec2 {
  x: number;
  y: number;
}
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  keyframes: Keyframe[];
  parentId: string | null;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  sides: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fill: string;
  rotation: number;
  opacity: number;
  align: 'left' | 'center' | 'right';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  src: string;
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

export interface MeshLayer extends BaseLayer {
  type: 'mesh';
  mesh: MeshKind;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  castShadow: boolean;
  // Only set when mesh === 'imported': the model file, embedded as a data
  // URL so it round-trips through IndexedDB/JSON export like image layers.
  src?: string;
  importedFormat?: ImportedMeshFormat;
}

export interface LightLayer extends BaseLayer {
  type: 'light';
  light: LightKind;
  position: Vec3;
  color: string;
  intensity: number;
  distance: number;
  angle: number;
}

export interface Camera3DLayer extends BaseLayer {
  type: 'camera3d';
  position: Vec3;
  rotation: Vec3;
  fov: number;
  near: number;
  far: number;
  orthographic: boolean;
}

export interface Text3DLayer extends BaseLayer {
  type: 'text3d';
  text: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  fontSize: number;
  height: number;
  opacity: number;
}

export type Layer = ShapeLayer | TextLayer | ImageLayer | GroupLayer | MeshLayer | LightLayer | Camera3DLayer | Text3DLayer;

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bezier';

export interface Keyframe {
  id: string;
  time: number;
  property: string;
  value: number | string | Vec2 | Vec3;
  easing: EasingType;
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe';

export interface Transition {
  type: TransitionType;
  duration: number;
  easing: EasingType;
}

export type BackgroundFill =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'spots'; base: string; spots: { color: string; x: number; y: number; radius: number; opacity: number }[] };

export interface Scene {
  id: string;
  name: string;
  duration: number;
  order: number;
  layers: Layer[];
  transitionToNext: Transition | null;
  // Falls back to the project's solid settings.backgroundColor when unset.
  background?: BackgroundFill;
}

export interface Project {
  id: string;
  name: string;
  mode: ProjectMode;
  createdAt: number;
  updatedAt: number;
  thumbnail: string | null;
  settings: ProjectSettings;
  scenes: Scene[];
}

export const ASPECT_RATIOS: { preset: AspectRatioPreset; label: string; width: number; height: number }[] = [
  { preset: '16:9', label: '16:9', width: 1920, height: 1080 },
  { preset: '9:16', label: '9:16', width: 1080, height: 1920 },
  { preset: '1:1', label: '1:1', width: 1080, height: 1080 },
  { preset: '4:5', label: '4:5', width: 1080, height: 1350 },
  { preset: '4:3', label: '4:3', width: 1440, height: 1080 },
  { preset: '3:4', label: '3:4', width: 1080, height: 1440 },
  { preset: '16:10', label: '16:10', width: 1920, height: 1200 },
  { preset: '21:9', label: '21:9', width: 2560, height: 1080 },
];

export const RESOLUTION_PRESETS = {
  '480p': 480,
  '720p': 720,
  '1080p': 1080,
  '1440p': 1440,
  '2160p': 2160,
} as const;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
