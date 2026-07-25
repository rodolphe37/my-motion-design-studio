import { describe, it, expect, afterEach } from 'vitest';
import { db, getAllProjects, getProject, saveProject, deleteProject, duplicateProject, resetDatabase } from './db';
import { createProject } from './factories';

afterEach(async () => {
  await db.projects.clear();
});

function project(name = 'Test project') {
  return createProject(name, '2d', '16:9');
}

describe('saveProject / getProject / getAllProjects', () => {
  it('persists a project and reads it back by id', async () => {
    const p = project();
    await saveProject(p);
    const loaded = await getProject(p.id);
    expect(loaded?.id).toBe(p.id);
    expect(loaded?.name).toBe('Test project');
  });

  it('stamps updatedAt on every save', async () => {
    const p = project();
    p.updatedAt = 0;
    await saveProject(p);
    const loaded = await getProject(p.id);
    expect(loaded!.updatedAt).toBeGreaterThan(0);
  });

  it('getProject returns undefined for an unknown id', async () => {
    expect(await getProject('does-not-exist')).toBeUndefined();
  });

  it('getAllProjects returns every stored project, newest updatedAt first', async () => {
    const older = project('Older');
    older.updatedAt = 1000;
    const newer = project('Newer');
    newer.updatedAt = 2000;
    await db.projects.bulkPut([older, newer]);

    const all = await getAllProjects();
    expect(all.map((p) => p.name)).toEqual(['Newer', 'Older']);
  });
});

describe('deleteProject', () => {
  it('removes the project so it no longer appears in getAllProjects', async () => {
    const p = project();
    await saveProject(p);
    await deleteProject(p.id);
    expect(await getProject(p.id)).toBeUndefined();
    expect(await getAllProjects()).toHaveLength(0);
  });
});

describe('duplicateProject', () => {
  it('creates an independent copy with new ids for the project, scenes, layers, and keyframes', async () => {
    const original = project('Original');
    original.scenes[0].layers.push({
      id: 'layer-1', name: 'Rect', type: 'shape', shape: 'rectangle',
      x: 0, y: 0, width: 10, height: 10, rotation: 0, opacity: 1,
      fill: '#fff', stroke: '#000', strokeWidth: 0, cornerRadius: 0, sides: 4,
      visible: true, locked: false, parentId: null,
      keyframes: [{ id: 'kf-1', time: 0, property: 'x', value: 0, easing: 'linear' }],
    });
    await saveProject(original);

    const copy = await duplicateProject(original.id);
    expect(copy).toBeDefined();
    expect(copy!.id).not.toBe(original.id);
    expect(copy!.name).toBe('Original (copy)');
    expect(copy!.scenes[0].id).not.toBe(original.scenes[0].id);
    expect(copy!.scenes[0].layers[0].id).not.toBe('layer-1');
    expect(copy!.scenes[0].layers[0].keyframes[0].id).not.toBe('kf-1');

    // Both the original and the copy should now exist independently.
    expect(await getAllProjects()).toHaveLength(2);
  });

  it('returns undefined when the source project does not exist', async () => {
    expect(await duplicateProject('does-not-exist')).toBeUndefined();
  });
});

describe('resetDatabase', () => {
  it('clears every stored project', async () => {
    await saveProject(project('A'));
    await saveProject(project('B'));
    expect(await getAllProjects()).toHaveLength(2);

    await resetDatabase();
    expect(await getAllProjects()).toHaveLength(0);
  });
});
