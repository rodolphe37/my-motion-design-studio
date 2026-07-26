import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { Canvas2D } from '@/components/editor/Canvas2D';
import { Canvas3D } from '@/components/editor/Canvas3D';
import type { Project } from '@/lib/types';

export type ShowcaseSource = { kind: 'video'; demoUrl: string } | { kind: 'gif'; gifUrl: string };

interface Props {
  source: ShowcaseSource | null;
  label: string;
  closeAria: string;
  onClose: () => void;
}

// Shows a single showcase item in a modal overlay, used when a gallery
// thumbnail is clicked. A 'video' source plays the real demo project on loop
// through the app's own Canvas2D/Canvas3D (assumes the caller pauses
// <DemoPlayer/> while this is open, since both drive the same shared editor
// store); a 'gif' source just displays the already-animated GIF file.
export function ShowcaseLightbox({ source, label, closeAria, onClose }: Props) {
  const demoUrl = source?.kind === 'video' ? source.demoUrl : null;
  const [project, setProjectState] = useState<Project | null>(null);
  const setProject = useEditorStore((s) => s.setProject);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!demoUrl) { setProjectState(null); return; }
    let cancelled = false;
    fetch(demoUrl)
      .then((r) => r.json() as Promise<Project>)
      .then((data) => { if (!cancelled) setProjectState(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [demoUrl]);

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
        sceneIndex = (sceneIndex + 1) % project.scenes.length;
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

  useEffect(() => {
    if (!source) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [source, onClose]);

  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl animate-scale-in">
        <button onClick={onClose} className="absolute -top-11 right-0 icon-btn text-white" aria-label={closeAria}>
          <X className="w-5 h-5" />
        </button>
        <div className="relative rounded-2xl overflow-hidden border border-ink-700 shadow-2xl aspect-video bg-ink-950">
          {source.kind === 'gif' ? (
            <img src={source.gifUrl} alt={label} className="absolute inset-0 w-full h-full object-contain" />
          ) : project ? (
            <div className="absolute inset-0 pointer-events-none select-none">
              {project.mode === '3d' ? <Canvas3D /> : <Canvas2D />}
            </div>
          ) : (
            <div className="absolute inset-0 animate-pulse bg-ink-850" />
          )}
          <div className="absolute bottom-3 right-3 text-xs text-ink-300 font-mono bg-ink-900/60 backdrop-blur px-2 py-1 rounded z-10">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
