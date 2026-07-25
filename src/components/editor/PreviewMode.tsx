import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { Canvas2D } from './Canvas2D';
import { Canvas3D } from './Canvas3D';

export function PreviewMode({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation('editor');
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectScene = useEditorStore((s) => s.selectScene);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const currentTime = useEditorStore((s) => s.currentTime);

  const scene = project?.scenes.find((s) => s.id === currentSceneId) ?? null;
  const sceneIndex = project?.scenes.findIndex((s) => s.id === currentSceneId) ?? -1;

  useEffect(() => {
    if (!project || !scene) return;
    if (isPlaying && currentTime >= scene.duration) {
      const nextScene = project.scenes[sceneIndex + 1];
      if (nextScene) {
        selectScene(nextScene.id);
        setPlaying(true);
      } else {
        setPlaying(false);
      }
    }
  }, [currentTime, isPlaying, scene, sceneIndex, project, selectScene, setPlaying]);

  if (!project || !scene) return null;

  return (
    <div className="h-screen flex flex-col bg-ink-950">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-ink-700 bg-ink-850">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('previewMode.title')}</span>
          <span className="text-xs text-ink-400">{t('previewMode.sceneCounter', { current: sceneIndex + 1, total: project.scenes.length })}</span>
        </div>
        <button onClick={onExit} className="icon-btn"><X className="w-5 h-5" /></button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {project.mode === '3d' ? <Canvas3D /> : <Canvas2D />}
      </div>

      {/* Controls */}
      <div className="h-16 flex items-center justify-center gap-4 border-t border-ink-700 bg-ink-850">
        <button
          onClick={() => {
            const prev = project.scenes[sceneIndex - 1];
            if (prev) selectScene(prev.id);
          }}
          disabled={sceneIndex === 0}
          className="icon-btn disabled:opacity-30"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button onClick={() => setPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center text-white hover:shadow-lg hover:shadow-accent-violet/30 transition-all active:scale-95">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button
          onClick={() => {
            const next = project.scenes[sceneIndex + 1];
            if (next) selectScene(next.id);
          }}
          disabled={sceneIndex === project.scenes.length - 1}
          className="icon-btn disabled:opacity-30"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <span className="text-sm font-mono text-ink-300 ml-4">
          {currentTime.toFixed(1)}s / {scene.duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
