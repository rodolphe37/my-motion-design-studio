import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from './store';
import { createProject, createShapeLayer } from './factories';
import type { Project, ShapeLayer } from './types';

function freshProject(): Project {
  return createProject('Test project', '2d', '16:9');
}

function setup() {
  const project = freshProject();
  useEditorStore.getState().setProject(project);
  return project;
}

beforeEach(() => {
  setup();
});

describe('setProject', () => {
  it('selects the first scene and resets transient/history state', () => {
    const project = freshProject();
    useEditorStore.getState().setProject(project);
    const s = useEditorStore.getState();
    expect(s.project).toBe(project);
    expect(s.currentSceneId).toBe(project.scenes[0].id);
    expect(s.selectedLayerIds).toEqual([]);
    expect(s.currentTime).toBe(0);
    expect(s.past).toEqual([]);
    expect(s.future).toEqual([]);
    expect(s.saveStatus).toBe('saved');
  });
});

describe('addLayer / updateLayer / deleteLayer / duplicateLayer', () => {
  it('addLayer appends to the current scene, selects it, and marks the project unsaved', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    expect(scene.layers).toHaveLength(1);
    expect(scene.layers[0].id).toBe(layer.id);
    expect(s.selectedLayerIds).toEqual([layer.id]);
    expect(s.saveStatus).toBe('unsaved');
  });

  it('updateLayer patches only the given layer', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().updateLayer(layer.id, { x: 500, name: 'Renamed' } as never);
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    const updated = scene.layers.find((l) => l.id === layer.id) as ShapeLayer;
    expect(updated.x).toBe(500);
    expect(updated.name).toBe('Renamed');
  });

  it('deleteLayer removes the layer and clears it from the selection', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().deleteLayer(layer.id);
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    expect(scene.layers).toHaveLength(0);
    expect(s.selectedLayerIds).not.toContain(layer.id);
  });

  it('duplicateLayer creates an independent copy with a new id and selects it', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().duplicateLayer(layer.id);
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    expect(scene.layers).toHaveLength(2);
    const copy = scene.layers[1];
    expect(copy.id).not.toBe(layer.id);
    expect(copy.name).toBe(`${layer.name} copy`);
    expect(s.selectedLayerIds).toEqual([copy.id]);
  });
});

describe('undo / redo', () => {
  it('undo restores the project to its state before the last mutation', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    expect(useEditorStore.getState().canUndo()).toBe(true);

    useEditorStore.getState().undo();
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    expect(scene.layers).toHaveLength(0);
    expect(s.saveStatus).toBe('unsaved');
  });

  it('redo re-applies a mutation that was just undone', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().canRedo()).toBe(true);

    useEditorStore.getState().redo();
    const s = useEditorStore.getState();
    const scene = s.project!.scenes.find((sc) => sc.id === s.currentSceneId)!;
    expect(scene.layers).toHaveLength(1);
  });

  it('a new mutation clears the redo stack', () => {
    useEditorStore.getState().addLayer(createShapeLayer());
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().canRedo()).toBe(true);

    useEditorStore.getState().addLayer(createShapeLayer());
    expect(useEditorStore.getState().canRedo()).toBe(false);
  });

  it('undo/redo are no-ops when there is nothing to undo/redo', () => {
    const before = useEditorStore.getState().project;
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().project).toBe(before);
    expect(useEditorStore.getState().canUndo()).toBe(false);

    useEditorStore.getState().redo();
    expect(useEditorStore.getState().project).toBe(before);
  });

  it('caps the undo history at 50 entries', () => {
    for (let i = 0; i < 60; i++) {
      useEditorStore.getState().addLayer(createShapeLayer());
    }
    expect(useEditorStore.getState().past).toHaveLength(50);
  });
});

describe('scenes', () => {
  it('addScene appends a scene using the project\'s default duration and selects it', () => {
    const before = useEditorStore.getState().project!.scenes.length;
    useEditorStore.getState().addScene();
    const s = useEditorStore.getState();
    expect(s.project!.scenes).toHaveLength(before + 1);
    expect(s.currentSceneId).toBe(s.project!.scenes[before].id);
  });

  it('deleteScene refuses to remove the last remaining scene', () => {
    const soleSceneId = useEditorStore.getState().project!.scenes[0].id;
    useEditorStore.getState().deleteScene(soleSceneId);
    expect(useEditorStore.getState().project!.scenes).toHaveLength(1);
  });

  it('deleteScene removes a scene and re-numbers the remaining ones\' order', () => {
    useEditorStore.getState().addScene();
    useEditorStore.getState().addScene();
    const [first, second, third] = useEditorStore.getState().project!.scenes;
    useEditorStore.getState().deleteScene(first.id);
    const remaining = useEditorStore.getState().project!.scenes;
    expect(remaining).toHaveLength(2);
    expect(remaining.map((s) => s.order)).toEqual([0, 1]);
    expect(remaining.map((s) => s.id)).toEqual([second.id, third.id]);
  });

  it('reorderScenes moves a scene and keeps `order` in sync with array position', () => {
    useEditorStore.getState().addScene();
    useEditorStore.getState().addScene();
    const ids = useEditorStore.getState().project!.scenes.map((s) => s.id);
    useEditorStore.getState().reorderScenes(0, 2);
    const scenes = useEditorStore.getState().project!.scenes;
    expect(scenes.map((s) => s.id)).toEqual([ids[1], ids[2], ids[0]]);
    expect(scenes.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it('setSceneBackground stores or clears the per-scene background override', () => {
    const sceneId = useEditorStore.getState().currentSceneId!;
    useEditorStore.getState().setSceneBackground(sceneId, { type: 'solid', color: '#ff0000' });
    expect(useEditorStore.getState().project!.scenes[0].background).toEqual({ type: 'solid', color: '#ff0000' });

    useEditorStore.getState().setSceneBackground(sceneId, null);
    expect(useEditorStore.getState().project!.scenes[0].background).toBeUndefined();
  });

  it('setSceneTransition stores or clears the transition to the next scene', () => {
    const sceneId = useEditorStore.getState().currentSceneId!;
    useEditorStore.getState().setSceneTransition(sceneId, { type: 'fade', duration: 0.5, easing: 'easeInOut' });
    expect(useEditorStore.getState().project!.scenes[0].transitionToNext).toEqual({ type: 'fade', duration: 0.5, easing: 'easeInOut' });
  });
});

describe('updateProjectSettings / renameProject / setThumbnail', () => {
  it('updateProjectSettings merges a partial patch without dropping other fields', () => {
    useEditorStore.getState().updateProjectSettings({ fps: 60 });
    const settings = useEditorStore.getState().project!.settings;
    expect(settings.fps).toBe(60);
    expect(settings.width).toBe(1920); // untouched
  });

  it('renameProject updates the project name', () => {
    useEditorStore.getState().renameProject('New name');
    expect(useEditorStore.getState().project!.name).toBe('New name');
  });

  it('setThumbnail updates the thumbnail without pushing undo history', () => {
    const pastBefore = useEditorStore.getState().past.length;
    useEditorStore.getState().setThumbnail('data:image/jpeg;base64,AAA');
    const s = useEditorStore.getState();
    expect(s.project!.thumbnail).toBe('data:image/jpeg;base64,AAA');
    expect(s.past.length).toBe(pastBefore);
  });
});

describe('keyframes', () => {
  it('addKeyframe adds a new keyframe for a layer property', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().addKeyframe(layer.id, { id: 'kf1', time: 0, property: 'x', value: 0, easing: 'linear' });

    const scene = useEditorStore.getState().project!.scenes[0];
    expect(scene.layers[0].keyframes).toHaveLength(1);
  });

  it('addKeyframe replaces (rather than duplicates) a keyframe at the same time+property', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().addKeyframe(layer.id, { id: 'kf1', time: 0, property: 'x', value: 0, easing: 'linear' });
    useEditorStore.getState().addKeyframe(layer.id, { id: 'kf2', time: 0, property: 'x', value: 999, easing: 'easeIn' });

    const scene = useEditorStore.getState().project!.scenes[0];
    expect(scene.layers[0].keyframes).toHaveLength(1);
    expect(scene.layers[0].keyframes[0]).toMatchObject({ value: 999, easing: 'easeIn' });
  });

  it('updateKeyframe patches an existing keyframe by id', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().addKeyframe(layer.id, { id: 'kf1', time: 0, property: 'x', value: 0, easing: 'linear' });
    useEditorStore.getState().updateKeyframe(layer.id, 'kf1', { time: 2 });

    const scene = useEditorStore.getState().project!.scenes[0];
    expect(scene.layers[0].keyframes[0].time).toBe(2);
  });

  it('deleteKeyframe removes a keyframe by id', () => {
    const layer = createShapeLayer();
    useEditorStore.getState().addLayer(layer);
    useEditorStore.getState().addKeyframe(layer.id, { id: 'kf1', time: 0, property: 'x', value: 0, easing: 'linear' });
    useEditorStore.getState().deleteKeyframe(layer.id, 'kf1');

    const scene = useEditorStore.getState().project!.scenes[0];
    expect(scene.layers[0].keyframes).toHaveLength(0);
  });
});
