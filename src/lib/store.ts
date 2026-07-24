import { create } from 'zustand';
import type { Project, Scene, Layer, Keyframe, Transition, BackgroundFill } from './types';
import { uid } from './types';

export type ViewMode = 'editor' | 'preview';

interface EditorState {
  project: Project | null;
  currentSceneId: string | null;
  selectedLayerIds: string[];
  viewMode: ViewMode;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';

  // Content-area rect of the on-screen canvas in CSS px, reported by Canvas2D.
  // Used by export to crop out letterboxing instead of stretching the whole
  // (padded) canvas over the output frame.
  canvasViewport: { offsetX: number; offsetY: number; scale: number } | null;
  setCanvasViewport: (v: EditorState['canvasViewport']) => void;

  // True while ExportModal is capturing frames, so editor-only affordances
  // (e.g. the 3D reference grid) can hide themselves from the render.
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;

  // undo/redo
  past: Project[];
  future: Project[];

  // actions
  setProject: (p: Project) => void;
  setViewMode: (v: ViewMode) => void;
  setPlaying: (p: boolean) => void;
  setCurrentTime: (t: number) => void;
  setZoom: (z: number) => void;
  selectLayer: (id: string | null, additive?: boolean) => void;
  selectScene: (id: string) => void;

  addScene: () => void;
  deleteScene: (id: string) => void;
  reorderScenes: (from: number, to: number) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  setSceneTransition: (sceneId: string, transition: Transition | null) => void;
  setSceneBackground: (sceneId: string, background: BackgroundFill | null) => void;

  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayers: (sceneId: string, from: number, to: number) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;

  addKeyframe: (layerId: string, kf: Keyframe) => void;
  updateKeyframe: (layerId: string, kfId: string, patch: Partial<Keyframe>) => void;
  deleteKeyframe: (layerId: string, kfId: string) => void;

  updateProjectSettings: (patch: Partial<Project['settings']>) => void;
  renameProject: (name: string) => void;
  setThumbnail: (thumb: string | null) => void;

  setSaveStatus: (s: EditorState['saveStatus']) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function cloneProject(p: Project): Project {
  return JSON.parse(JSON.stringify(p));
}

function pushHistory(state: EditorState): { past: Project[]; future: Project[] } {
  if (!state.project) return { past: state.past, future: state.future };
  const past = [...state.past, cloneProject(state.project)].slice(-50);
  return { past, future: [] };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  currentSceneId: null,
  selectedLayerIds: [],
  viewMode: 'editor',
  isPlaying: false,
  currentTime: 0,
  zoom: 1,
  saveStatus: 'saved',
  canvasViewport: null,
  setCanvasViewport: (v) => set({ canvasViewport: v }),
  isExporting: false,
  setIsExporting: (v) => set({ isExporting: v }),
  past: [],
  future: [],

  setProject: (p) =>
    set({
      project: p,
      currentSceneId: p.scenes[0]?.id ?? null,
      selectedLayerIds: [],
      currentTime: 0,
      past: [],
      future: [],
      saveStatus: 'saved',
    }),

  setViewMode: (v) => set({ viewMode: v, isPlaying: false, currentTime: 0 }),
  setPlaying: (p) => set({ isPlaying: p }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(4, z)) }),

  selectLayer: (id, additive) =>
    set((s) => {
      if (!id) return { selectedLayerIds: [] };
      if (additive) {
        return {
          selectedLayerIds: s.selectedLayerIds.includes(id)
            ? s.selectedLayerIds.filter((x) => x !== id)
            : [...s.selectedLayerIds, id],
        };
      }
      return { selectedLayerIds: [id] };
    }),

  selectScene: (id) => set({ currentSceneId: id, selectedLayerIds: [], currentTime: 0 }),

  addScene: () =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const newScene: Scene = {
        id: uid(),
        name: `Scène ${project.scenes.length + 1}`,
        duration: project.settings.defaultSceneDuration,
        order: project.scenes.length,
        layers: [],
        transitionToNext: null,
      };
      project.scenes.push(newScene);
      return {
        project,
        currentSceneId: newScene.id,
        selectedLayerIds: [],
        currentTime: 0,
        ...hist,
        saveStatus: 'unsaved',
      };
    }),

  deleteScene: (id) =>
    set((s) => {
      if (!s.project || s.project.scenes.length <= 1) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      project.scenes = project.scenes.filter((sc) => sc.id !== id).map((sc, i) => ({ ...sc, order: i }));
      return {
        project,
        currentSceneId: project.scenes[0]?.id ?? null,
        selectedLayerIds: [],
        currentTime: 0,
        ...hist,
        saveStatus: 'unsaved',
      };
    }),

  reorderScenes: (from, to) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const [moved] = project.scenes.splice(from, 1);
      project.scenes.splice(to, 0, moved);
      project.scenes = project.scenes.map((sc, i) => ({ ...sc, order: i }));
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  updateScene: (id, patch) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === id);
      if (scene) Object.assign(scene, patch);
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  setSceneTransition: (sceneId, transition) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === sceneId);
      if (scene) scene.transitionToNext = transition;
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  setSceneBackground: (sceneId, background) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === sceneId);
      if (scene) scene.background = background ?? undefined;
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  addLayer: (layer) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        scene.layers.push(layer);
      }
      return { project, selectedLayerIds: [layer.id], ...hist, saveStatus: 'unsaved' };
    }),

  updateLayer: (id, patch) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === id);
        if (layer) Object.assign(layer, patch);
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  deleteLayer: (id) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        scene.layers = scene.layers.filter((l) => l.id !== id);
      }
      return { project, selectedLayerIds: s.selectedLayerIds.filter((x) => x !== id), ...hist, saveStatus: 'unsaved' };
    }),

  duplicateLayer: (id) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === id);
        if (layer) {
          const copy = { ...cloneLayer(layer), id: uid(), name: `${layer.name} copy` };
          scene.layers.push(copy);
          return { project, selectedLayerIds: [copy.id], ...hist, saveStatus: 'unsaved' };
        }
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  reorderLayers: (sceneId, from, to) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === sceneId);
      if (scene) {
        const [moved] = scene.layers.splice(from, 1);
        scene.layers.splice(to, 0, moved);
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  setLayerVisibility: (id, visible) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === id);
        if (layer) layer.visible = visible;
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  setLayerLocked: (id, locked) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === id);
        if (layer) layer.locked = locked;
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  addKeyframe: (layerId, kf) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === layerId);
        if (layer) {
          const existing = layer.keyframes.find((k) => k.property === kf.property && k.time === kf.time);
          if (existing) {
            existing.value = kf.value;
            existing.easing = kf.easing;
          } else {
            layer.keyframes.push(kf);
          }
        }
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  updateKeyframe: (layerId, kfId, patch) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === layerId);
        if (layer) {
          const kf = layer.keyframes.find((k) => k.id === kfId);
          if (kf) Object.assign(kf, patch);
        }
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  deleteKeyframe: (layerId, kfId) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      const scene = project.scenes.find((sc) => sc.id === s.currentSceneId);
      if (scene) {
        const layer = scene.layers.find((l) => l.id === layerId);
        if (layer) {
          layer.keyframes = layer.keyframes.filter((k) => k.id !== kfId);
        }
      }
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  updateProjectSettings: (patch) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      project.settings = { ...project.settings, ...patch };
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  renameProject: (name) =>
    set((s) => {
      if (!s.project) return {};
      const hist = pushHistory(s);
      const project = cloneProject(s.project);
      project.name = name;
      return { project, ...hist, saveStatus: 'unsaved' };
    }),

  setThumbnail: (thumb) =>
    set((s) => {
      if (!s.project) return {};
      const project = cloneProject(s.project);
      project.thumbnail = thumb;
      return { project, saveStatus: 'unsaved' };
    }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  undo: () =>
    set((s) => {
      if (!s.project || s.past.length === 0) return {};
      const previous = s.past[s.past.length - 1];
      const past = s.past.slice(0, -1);
      const future = [cloneProject(s.project), ...s.future].slice(0, 50);
      return { project: previous, past, future, saveStatus: 'unsaved' };
    }),

  redo: () =>
    set((s) => {
      if (!s.project || s.future.length === 0) return {};
      const next = s.future[0];
      const future = s.future.slice(1);
      const past = [...s.past, cloneProject(s.project)].slice(-50);
      return { project: next, past, future, saveStatus: 'unsaved' };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

function cloneLayer(layer: Layer): Layer {
  return {
    ...JSON.parse(JSON.stringify(layer)),
    keyframes: layer.keyframes.map((k) => ({ ...k, id: uid() })),
  };
}
