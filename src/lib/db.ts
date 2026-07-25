import Dexie, { type Table } from 'dexie';
import type { Project } from './types';

export class MotionStudioDB extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super('MotionStudioDB');
    this.version(1).stores({
      projects: 'id, name, mode, updatedAt, createdAt',
    });
  }
}

export const db = new MotionStudioDB();

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = Date.now();
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function resetDatabase(): Promise<void> {
  await db.projects.clear();
}

export async function duplicateProject(id: string): Promise<Project | undefined> {
  const original = await db.projects.get(id);
  if (!original) return undefined;
  const copy: Project = {
    ...original,
    id: uid(),
    name: `${original.name} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: original.thumbnail,
    scenes: original.scenes.map((s) => ({
      ...s,
      id: uid(),
      layers: s.layers.map((l) => ({ ...l, id: uid(), keyframes: l.keyframes.map((k) => ({ ...k, id: uid() })) })),
    })),
  };
  await db.projects.put(copy);
  return copy;
}

import { uid } from './types';
