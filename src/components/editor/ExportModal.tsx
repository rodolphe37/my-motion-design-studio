import { useState, useRef } from 'react';
import { X, Download, FileVideo, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { getExportResolution } from '@/lib/factories';
import type { ExportDefaults } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/download';
import { saveProject } from '@/lib/db';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FORMATS: { value: ExportDefaults['format']; label: string; desc: string }[] = [
  { value: 'mp4', label: 'MP4 (H.264)', desc: 'Compatibilité maximale, recommandé par défaut' },
  { value: 'webm', label: 'WebM (VP9)', desc: 'Fichier plus léger, idéal usage web' },
  { value: 'gif', label: 'GIF animé', desc: 'Extraits courts/loop, sans son' },
  { value: 'mov', label: 'MOV', desc: 'Usage montage pro (via ffmpeg.wasm)' },
];

const RESOLUTIONS: { value: ExportDefaults['resolutionPreset']; label: string }[] = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p HD' },
  { value: '1080p', label: '1080p Full HD' },
  { value: '1440p', label: '1440p 2K' },
  { value: '2160p', label: '2160p 4K' },
];

const QUALITIES: { value: ExportDefaults['quality']; label: string; bitrate: number }[] = [
  { value: 'standard', label: 'Standard', bitrate: 4_000_000 },
  { value: 'high', label: 'Haute', bitrate: 8_000_000 },
  { value: 'max', label: 'Maximale', bitrate: 16_000_000 },
];

export function ExportModal({ open, onClose }: Props) {
  const project = useEditorStore((s) => s.project);
  const updateProjectSettings = useEditorStore((s) => s.updateProjectSettings);
  const setThumbnail = useEditorStore((s) => s.setThumbnail);
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<ExportDefaults['format']>('mp4');
  const [resolution, setResolution] = useState<ExportDefaults['resolutionPreset']>('1080p');
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [quality, setQuality] = useState<ExportDefaults['quality']>('high');
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  if (!open || !project) return null;

  const res = getExportResolution(project, resolution, customW, customH);
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0);
  const estimatedSize = (QUALITIES.find((q) => q.value === quality)?.bitrate || 8_000_000) * totalDuration / 8;
  const isHeavy = res.width * res.height > 1920 * 1080 || project.mode === '3d';

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setProgress(0);
    cancelRef.current = false;

    const store = useEditorStore.getState();
    const restoreState = {
      currentSceneId: store.currentSceneId,
      currentTime: store.currentTime,
      isPlaying: store.isPlaying,
    };

    try {
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) throw new Error('Canvas introuvable');

      // Precompute each scene's start offset in the timeline
      const sceneOffsets: { sceneId: string; start: number; duration: number }[] = [];
      let offset = 0;
      for (const scene of project.scenes) {
        sceneOffsets.push({ sceneId: scene.id, start: offset, duration: scene.duration });
        offset += scene.duration;
      }

      // A single rAF is enough here: our state changes go through Zustand
      // outside of a React event handler, so React (and Konva's internal
      // batched redraw, which itself runs on rAF) has already committed by
      // the time this callback fires. Waiting for a second rAF would double
      // this loop's per-frame cost against MediaRecorder's real-time capture,
      // stretching the exported video well past its intended duration.
      const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = res.width;
      targetCanvas.height = res.height;
      const ctx = targetCanvas.getContext('2d')!;

      const mimeType = format === 'mp4' ? 'video/mp4' : format === 'webm' ? 'video/webm' : format === 'gif' ? 'video/webm' : 'video/quicktime';
      const bitrate = QUALITIES.find((q) => q.value === quality)?.bitrate || 8_000_000;

      const stream = targetCanvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const filename = `${project.name.replace(/\s+/g, '-').toLowerCase()}.${format === 'gif' ? 'webm' : format}`;
        downloadBlob(blob, filename);

        // Save thumbnail
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 320;
        thumbCanvas.height = 180;
        const thumbCtx = thumbCanvas.getContext('2d')!;
        thumbCtx.drawImage(targetCanvas, 0, 0, 320, 180);
        setThumbnail(thumbCanvas.toDataURL('image/jpeg', 0.7));

        // Save export defaults
        updateProjectSettings({
          exportDefaults: { format, resolutionPreset: resolution, quality, fps },
        });
        saveProject(useEditorStore.getState().project!);

        useEditorStore.setState({ ...restoreState, isExporting: false });
        setExporting(false);
        setDone(true);
        setProgress(100);
      };

      recorder.start();

      // Render frames: drive the store's scene/time for each frame so the
      // on-screen canvas actually reflects that instant before we capture it.
      const totalFrames = Math.ceil(totalDuration * fps);
      const frameTime = 1000 / fps;

      useEditorStore.setState({ isPlaying: false, isExporting: true });
      await waitForPaint(); // let editor-only affordances (e.g. 3D grid) hide before capturing
      const sourceCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;

      // The on-screen canvas is sized to its container, not the project's
      // aspect ratio, so its content is letterboxed (offsetX/offsetY margins)
      // inside it. Capturing the whole canvas and stretching it to res.width
      // x res.height both distorted the aspect ratio and left the background
      // filling only the inner letterboxed box instead of the full frame.
      // Crop to just the reported content rect instead.
      const viewport = useEditorStore.getState().canvasViewport;
      let srcX = 0, srcY = 0, srcW = sourceCanvas?.width ?? res.width, srcH = sourceCanvas?.height ?? res.height;
      if (sourceCanvas && viewport && sourceCanvas.clientWidth > 0 && sourceCanvas.clientHeight > 0) {
        const dprX = sourceCanvas.width / sourceCanvas.clientWidth;
        const dprY = sourceCanvas.height / sourceCanvas.clientHeight;
        srcX = viewport.offsetX * dprX;
        srcY = viewport.offsetY * dprY;
        srcW = project.settings.width * viewport.scale * dprX;
        srcH = project.settings.height * viewport.scale * dprY;
      }

      for (let i = 0; i < totalFrames; i++) {
        const frameStart = performance.now();
        if (cancelRef.current) {
          recorder.stop();
          useEditorStore.setState({ ...restoreState, isExporting: false });
          setExporting(false);
          return;
        }

        const t = i / fps;
        let active = sceneOffsets[sceneOffsets.length - 1];
        for (const so of sceneOffsets) {
          if (t >= so.start) active = so;
          else break;
        }
        const localTime = Math.min(t - active.start, active.duration);

        useEditorStore.setState({ currentSceneId: active.sceneId, currentTime: localTime });
        await waitForPaint();

        // Draw current canvas state, cropped to the actual content rect.
        if (sourceCanvas) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, res.width, res.height);
          ctx.drawImage(sourceCanvas, srcX, srcY, srcW, srcH, 0, 0, res.width, res.height);
        }

        if (i % 4 === 0 || i === totalFrames - 1) setProgress((i / totalFrames) * 100);
        const elapsed = performance.now() - frameStart;
        await new Promise((r) => setTimeout(r, Math.max(0, frameTime - elapsed)));
      }

      recorder.stop();
    } catch (err) {
      useEditorStore.setState({ ...restoreState, isExporting: false });
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (exporting) {
      cancelRef.current = true;
      return;
    }
    setStep(0);
    setDone(false);
    setProgress(0);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative panel w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ink-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-accent-violet" />
            Exporter en vidéo
          </h2>
          <button onClick={handleClose} className="icon-btn"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Export terminé !</h3>
            <p className="text-sm text-ink-300 mb-4">Votre vidéo a été téléchargée.</p>
            <button onClick={handleClose} className="btn-primary">Fermer</button>
          </div>
        ) : exporting ? (
          <div className="p-6">
            <div className="text-center mb-4">
              <Loader2 className="w-10 h-10 text-accent-violet animate-spin mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Rendu en cours...</h3>
              <p className="text-sm text-ink-300">{Math.round(progress)}%</p>
            </div>
            <div className="w-full h-2 bg-ink-700 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-accent-violet to-accent-blue transition-all" style={{ width: `${progress}%` }} />
            </div>
            <button onClick={() => { cancelRef.current = true; }} className="btn-outline w-full">
              Annuler
            </button>
          </div>
        ) : step === 0 ? (
          <>
            <div className="p-5 space-y-4">
              {/* Format */}
              <div>
                <label className="label mb-2 block">Format de fichier</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${format === f.value ? 'border-accent-violet bg-accent-violet/10' : 'border-ink-600 hover:border-ink-500'}`}
                    >
                      <div className="font-medium text-sm">{f.label}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="label mb-2 block">Définition</label>
                <div className="flex flex-wrap gap-2">
                  {RESOLUTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setResolution(r.value)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-all ${resolution === r.value ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {resolution === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={customW} onChange={(e) => setCustomW(parseInt(e.target.value) || 0)} className="input text-sm" placeholder="Largeur" />
                    <input type="number" value={customH} onChange={(e) => setCustomH(parseInt(e.target.value) || 0)} className="input text-sm" placeholder="Hauteur" />
                  </div>
                )}
              </div>

              {/* FPS */}
              <div>
                <label className="label mb-2 block">FPS</label>
                <div className="flex gap-2">
                  {([24, 30, 60] as const).map((f) => (
                    <button key={f} onClick={() => setFps(f)} className={`flex-1 py-2 rounded-lg border-2 text-sm transition-all ${fps === f ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300'}`}>
                      {f} fps
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="label mb-2 block">Qualité</label>
                <div className="flex gap-2">
                  {QUALITIES.map((q) => (
                    <button key={q.value} onClick={() => setQuality(q.value)} className={`flex-1 py-2 rounded-lg border-2 text-sm transition-all ${quality === q.value ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300'}`}>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-ink-900 rounded-lg border border-ink-600 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-ink-400">Résolution</span><span className="font-mono">{res.width}×{res.height}</span></div>
                <div className="flex justify-between"><span className="text-ink-400">Durée</span><span className="font-mono">{totalDuration.toFixed(1)}s</span></div>
                <div className="flex justify-between"><span className="text-ink-400">Taille estimée</span><span className="font-mono">~{formatBytes(estimatedSize)}</span></div>
              </div>

              {isHeavy && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Rendu potentiellement long : résolution élevée ou scène 3D complexe. Prévoyez suffisamment de temps et de mémoire.</span>
                </div>
              )}
            </div>
            <div className="flex justify-end p-5 border-t border-ink-700">
              <button onClick={handleExport} className="btn-primary">
                <Download className="w-4 h-4" /> Exporter
              </button>
            </div>
          </>
        ) : null}

        {error && (
          <div className="p-4 mx-5 mb-5 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
