import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/store';
import { Canvas2D } from '@/components/editor/Canvas2D';
import { Canvas3D } from '@/components/editor/Canvas3D';
import type { Project } from '@/lib/types';

const DEMO_URLS = ['/demos/2d-demo.json', '/demos/3d-demo.json'];

// Renders the real 2D/3D demo projects through the app's own Canvas2D/Canvas3D
// — not a mocked-up animation — looping through each project's scenes and
// alternating between the 2D and 3D demo once each finishes.
export function DemoPlayer() {
  const [demos, setDemos] = useState<Project[] | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);
  const setProject = useEditorStore((s) => s.setProject);
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all(DEMO_URLS.map((u) => fetch(u).then((r) => r.json() as Promise<Project>)))
      .then((data) => { if (!cancelled) setDemos(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // This reuses the real editor store — Canvas2D/Canvas3D only know how to
  // render "the current project" from there. Force viewMode to 'preview' so
  // Canvas3D hides its editor-only reference grid, and restore it on unmount
  // so a later visit to /editor/:id doesn't inherit a stuck preview mode.
  useEffect(() => {
    useEditorStore.setState({ viewMode: 'preview' });
    return () => { useEditorStore.setState({ viewMode: 'editor', isPlaying: false }); };
  }, []);

  const project = demos?.[demoIndex] ?? null;

  useEffect(() => {
    if (project) setProject(project);
  }, [project, setProject]);

  useEffect(() => {
    if (!project) return;
    let sceneIndex = 0;
    let start = performance.now();
    useEditorStore.setState({ currentSceneId: project.scenes[0].id, currentTime: 0 });

    const tick = (now: number) => {
      const scene = project.scenes[sceneIndex];
      const elapsed = (now - start) / 1000;
      if (elapsed >= scene.duration) {
        sceneIndex += 1;
        if (sceneIndex >= project.scenes.length) {
          setDemoIndex((i) => (i + 1) % DEMO_URLS.length);
          return;
        }
        start = now;
        useEditorStore.setState({ currentSceneId: project.scenes[sceneIndex].id, currentTime: 0 });
      } else {
        useEditorStore.setState({ currentTime: elapsed });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [project]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-ink-700 shadow-2xl shadow-accent-violet/10 aspect-video bg-ink-950">
      {project ? (
        <div className="absolute inset-0 pointer-events-none select-none">
          {project.mode === '3d' ? <Canvas3D /> : <Canvas2D />}
        </div>
      ) : (
        <div className="absolute inset-0 animate-pulse bg-ink-850" />
      )}
      <div className="absolute top-3 left-3 flex gap-1 z-10">
        <span className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${project?.mode === '2d' ? 'bg-accent-violet text-white' : 'bg-ink-800/70 text-ink-300'}`}>
          2D
        </span>
        <span className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${project?.mode === '3d' ? 'bg-accent-blue text-white' : 'bg-ink-800/70 text-ink-300'}`}>
          3D
        </span>
      </div>
      <div className="absolute bottom-3 right-3 text-xs text-ink-300 font-mono bg-ink-900/60 backdrop-blur px-2 py-1 rounded z-10">
        {project?.name ?? 'motion-studio.demo'}
      </div>
    </div>
  );
}
