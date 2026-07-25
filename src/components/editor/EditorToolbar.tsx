import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Pause, Square, Undo2, Redo2, ZoomIn, ZoomOut, Maximize,
  Eye, Download, Plus, ChevronLeft, Check, Loader2, X, Settings,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';
import { Moon, Sun } from 'lucide-react';
import { ProjectSettingsModal } from './ProjectSettingsModal';

interface Props {
  saveStatus: 'saved' | 'saving' | 'unsaved';
  savedAt: string;
  onExport: () => void;
  onSave: () => void;
}

export function EditorToolbar({ saveStatus, savedAt, onExport }: Props) {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const zoom = useEditorStore((s) => s.zoom);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const renameProject = useEditorStore((s) => s.renameProject);
  const addScene = useEditorStore((s) => s.addScene);
  const selectScene = useEditorStore((s) => s.selectScene);
  const deleteScene = useEditorStore((s) => s.deleteScene);
  const reorderScenes = useEditorStore((s) => s.reorderScenes);
  const updateScene = useEditorStore((s) => s.updateScene);
  const { theme, toggleTheme } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project?.name || '');
  const [renamingSceneId, setRenamingSceneId] = useState<string | null>(null);
  const [sceneNameValue, setSceneNameValue] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // See the identical comment in RightPanels.tsx's LayersPanel: onDrop needs
  // the value onDragStart set even if no re-render has happened in between.
  const dragRef = useRef<number | null>(null);

  useEffect(() => {
    setNameValue(project?.name || '');
  }, [project?.name]);

  if (!project) return null;

  return (
    <header className="h-14 border-b border-ink-700 bg-ink-850 flex items-center px-3 gap-2 shrink-0">
      {/* Left: logo + project name */}
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/projects" className="icon-btn" title="Retour aux projets">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <img src="/icon-96.png" alt="MyMotionStudio" className="w-8 h-8 rounded-lg shrink-0" />
        {editingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={() => { renameProject(nameValue); setEditingName(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { renameProject(nameValue); setEditingName(false); } }}
            autoFocus
            className="input text-sm w-48"
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
            <span className="font-medium text-sm hover:text-accent-violet transition-colors">{project.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${project.mode === '3d' ? 'bg-blue-500/20 text-blue-300' : 'bg-violet-500/20 text-violet-300'}`}>
              {project.mode.toUpperCase()}
            </span>
          </button>
        )}
        <button onClick={() => setSettingsOpen(true)} className="icon-btn" title="Réglages du projet">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Center: scene tabs */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin px-2">
        {project.scenes.map((scene, i) => (
          <div
            key={scene.id}
            draggable={renamingSceneId !== scene.id}
            onDragStart={() => { dragRef.current = i; setDragIndex(i); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragRef.current;
              if (from !== null && from !== i) reorderScenes(from, i);
              dragRef.current = null;
              setDragIndex(null);
            }}
            onDragEnd={() => { dragRef.current = null; setDragIndex(null); }}
            className={`group relative shrink-0 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all ${
              scene.id === currentSceneId ? 'bg-accent-violet/20 text-accent-violet' : 'text-ink-300 hover:bg-ink-700 hover:text-ink-50'
            } ${dragIndex === i ? 'opacity-50' : ''}`}
          >
            {renamingSceneId === scene.id ? (
              <input
                type="text"
                value={sceneNameValue}
                onChange={(e) => setSceneNameValue(e.target.value)}
                onBlur={() => { updateScene(scene.id, { name: sceneNameValue || scene.name }); setRenamingSceneId(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { updateScene(scene.id, { name: sceneNameValue || scene.name }); setRenamingSceneId(null); }
                  else if (e.key === 'Escape') setRenamingSceneId(null);
                }}
                autoFocus
                onFocus={(e) => e.target.select()}
                className="bg-ink-900 border border-accent-violet rounded-lg px-2 py-1.5 text-xs w-28 outline-none"
              />
            ) : (
              <button
                onClick={() => selectScene(scene.id)}
                onDoubleClick={() => { setRenamingSceneId(scene.id); setSceneNameValue(scene.name); }}
                className="px-3 py-1.5 cursor-grab active:cursor-grabbing"
                title="Cliquer pour ouvrir, double-cliquer pour renommer, glisser pour réordonner"
              >
                <span className="opacity-50">{i + 1}.</span> {scene.name}
              </button>
            )}
            {project.scenes.length > 1 && renamingSceneId !== scene.id && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 mr-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                title="Supprimer la scène"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addScene} className="icon-btn w-7 h-7 shrink-0" title="Ajouter une scène">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Save status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 text-xs text-ink-400">
          {saveStatus === 'saving' ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement...</>
          ) : saveStatus === 'unsaved' ? (
            <><span className="w-2 h-2 rounded-full bg-amber-400" /> Non enregistré</>
          ) : (
            <><Check className="w-3 h-3 text-emerald-400" /> Enregistré {savedAt && `à ${savedAt}`}</>
          )}
        </div>

        {/* Playback */}
        <button onClick={() => setPlaying(!isPlaying)} className="icon-btn" title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={() => { setPlaying(false); setCurrentTime(0); }} className="icon-btn" title="Stop">
          <Square className="w-4 h-4" />
        </button>

        {/* Undo/Redo */}
        <button onClick={undo} disabled={past.length === 0} className="icon-btn disabled:opacity-30" title="Annuler (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={future.length === 0} className="icon-btn disabled:opacity-30" title="Refaire (Ctrl+Y)">
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Zoom */}
        <button onClick={() => setZoom(zoom - 0.1)} className="icon-btn" title="Zoom arrière">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-ink-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.1)} className="icon-btn" title="Zoom avant">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(1)} className="icon-btn" title="Ajuster">
          <Maximize className="w-4 h-4" />
        </button>

        {/* View mode toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
          className="btn-outline text-xs px-3 py-1.5"
          title="Visualisateur"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden xl:inline">Preview</span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="icon-btn" title="Thème">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Export */}
        <button onClick={onExport} className="btn-primary text-xs px-3 py-1.5">
          <Download className="w-4 h-4" />
          <span className="hidden xl:inline">Exporter</span>
        </button>
      </div>

      <ProjectSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
