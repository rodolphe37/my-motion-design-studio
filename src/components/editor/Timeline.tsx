import { useRef, useState, useEffect } from 'react';
import { Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore } from '@/lib/store';

export function Timeline() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const updateKeyframe = useEditorStore((s) => s.updateKeyframe);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pxPerSec, setPxPerSec] = useState(80);
  const [draggingKf, setDraggingKf] = useState<{ layerId: string; kfId: string } | null>(null);

  const scene = project?.scenes.find((s) => s.id === currentSceneId) ?? null;
  const duration = scene?.duration ?? 1;
  const trackWidth = duration * pxPerSec;

  useEffect(() => {
    if (!draggingKf) return;
    const move = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = Math.max(0, Math.min(duration, x / pxPerSec));
      updateKeyframe(draggingKf.layerId, draggingKf.kfId, { time: t });
    };
    const up = () => setDraggingKf(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [draggingKf, duration, pxPerSec, updateKeyframe]);

  if (!project || !scene) return null;

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = Math.max(0, Math.min(duration, x / pxPerSec));
    setCurrentTime(t);
  };

  return (
    <div className="h-48 border-t border-ink-700 bg-ink-850 flex flex-col shrink-0">
      {/* Controls */}
      <div className="h-9 flex items-center gap-2 px-3 border-b border-ink-700">
        <button onClick={() => setPlaying(!isPlaying)} className="icon-btn w-7 h-7">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <span className="text-xs font-mono text-ink-300">
          {currentTime.toFixed(2)}s / {duration.toFixed(1)}s
        </span>
        <div className="flex-1" />
        <button onClick={() => setPxPerSec(Math.max(20, pxPerSec - 20))} className="icon-btn w-7 h-7">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setPxPerSec(Math.min(300, pxPerSec + 20))} className="icon-btn w-7 h-7">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Layer labels */}
        <div className="w-40 shrink-0 border-r border-ink-700 overflow-y-auto scrollbar-thin">
          <div className="h-6 border-b border-ink-700 flex items-center px-2 text-xs text-ink-400 font-medium">Calques</div>
          {scene.layers.length === 0 && (
            <div className="text-xs text-ink-500 px-2 py-3">Aucun calque</div>
          )}
          {[...scene.layers].reverse().map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`h-6 flex items-center px-2 text-xs cursor-pointer border-b border-ink-700/50 truncate ${
                selectedLayerIds.includes(layer.id) ? 'bg-accent-violet/15 text-ink-50' : 'text-ink-300 hover:bg-ink-750'
              }`}
            >
              {layer.name}
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin relative">
          {/* Ruler */}
          <div className="h-6 border-b border-ink-700 relative sticky top-0 bg-ink-850 z-10" style={{ width: trackWidth }}>
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 flex items-center text-[10px] text-ink-400 font-mono" style={{ left: i * pxPerSec }}>
                <span className="pl-1">{i}s</span>
                <div className="w-px h-2 bg-ink-600 ml-1" />
              </div>
            ))}
          </div>

          {/* Tracks area */}
          <div ref={trackRef} className="relative cursor-text" style={{ width: trackWidth, minHeight: '100%' }} onMouseDown={handleTrackClick}>
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-accent-violet z-20 pointer-events-none"
              style={{ left: currentTime * pxPerSec }}
            >
              <div className="w-3 h-3 -ml-1.5 rounded-full bg-accent-violet" />
            </div>

            {/* Layer tracks */}
            {[...scene.layers].reverse().map((layer) => (
              <div
                key={layer.id}
                className={`h-6 border-b border-ink-700/30 relative ${selectedLayerIds.includes(layer.id) ? 'bg-accent-violet/5' : ''}`}
              >
                {layer.keyframes.map((kf) => (
                  <div
                    key={kf.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingKf({ layerId: layer.id, kfId: kf.id });
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rotate-45 bg-accent-pink hover:bg-pink-400 cursor-grab active:cursor-grabbing transition-colors"
                    style={{ left: kf.time * pxPerSec }}
                    title={`${kf.property} @ ${kf.time.toFixed(2)}s`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
