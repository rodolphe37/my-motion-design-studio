import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Project } from '@/lib/types';
import { useEditorStore } from '@/lib/store';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { LeftToolbar2D, LeftToolbar3D } from '@/components/editor/LeftToolbar';
import { LayersPanel, PropertiesPanel, AnimationPanel, TransitionsPanel, ScenePanel } from '@/components/editor/RightPanels';
import { Canvas2D } from '@/components/editor/Canvas2D';
import { Canvas3D } from '@/components/editor/Canvas3D';
import { Timeline } from '@/components/editor/Timeline';
import { PreviewMode } from '@/components/editor/PreviewMode';
import { ExportModal } from '@/components/editor/ExportModal';
import { useAutoSave } from '@/lib/useAutoSave';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { Monitor } from 'lucide-react';

export default function EditorPage() {
  const { projectId } = useParams();
  const project = useLiveQuery(() => db.projects.get(projectId!), [projectId], undefined as Project | undefined);
  const setProject = useEditorStore((s) => s.setProject);
  const viewMode = useEditorStore((s) => s.viewMode);
  const [exportOpen, setExportOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<'layers' | 'properties' | 'animation' | 'transitions' | 'scene'>('properties');
  const { saveStatus, savedAt } = useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  useEffect(() => {
    if (project) setProject(project);
  }, [project, setProject]);

  if (project === undefined) return <div className="min-h-screen flex items-center justify-center text-ink-300">Chargement...</div>;
  if (!project) return <Navigate to="/projects" replace />;

  if (viewMode === 'preview') {
    return <PreviewMode onExit={() => useEditorStore.getState().setViewMode('editor')} />;
  }

  const is3D = project.mode === '3d';

  return (
    <div className="h-screen flex flex-col bg-ink-900 text-ink-100 overflow-hidden">
      <EditorToolbar onSave={() => setExportOpen(true)} saveStatus={saveStatus} savedAt={savedAt} onExport={() => setExportOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        {is3D ? <LeftToolbar3D /> : <LeftToolbar2D />}

        {/* Center */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative bg-ink-950 overflow-hidden">
            {is3D ? <Canvas3D /> : <Canvas2D />}
            {/* Small screen warning — bg-ink-950 stays dark in both themes
                (see index.css), so its text is fixed light rather than the
                theme-flipping ink-* tokens, which would go dark-on-dark. */}
            <div className="sm:hidden absolute inset-0 bg-ink-950/95 flex flex-col items-center justify-center p-6 text-center z-50">
              <Monitor className="w-10 h-10 text-amber-400 mb-3" />
              <h3 className="font-semibold mb-1 text-white">Écran trop petit</h3>
              <p className="text-sm text-gray-300">L'éditeur est optimisé pour desktop. Utilisez un écran plus large pour une meilleure expérience{is3D ? ', surtout en mode 3D' : ''}.</p>
            </div>
          </div>
          <Timeline />
        </div>

        {/* Right panels */}
        <div className="w-72 shrink-0 border-l border-ink-700 bg-ink-850 flex flex-col overflow-hidden">
          <div className="flex border-b border-ink-700">
            {(['properties', 'layers', 'animation', 'transitions', 'scene'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setRightPanel(p)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                  rightPanel === p ? 'text-accent-violet bg-accent-violet/10 border-b-2 border-accent-violet' : 'text-ink-300 hover:text-ink-50'
                }`}
              >
                {p === 'properties' ? 'Propriétés' : p === 'layers' ? 'Calques' : p === 'animation' ? 'Anim' : p === 'transitions' ? 'Trans.' : 'Scène'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {rightPanel === 'properties' && <PropertiesPanel />}
            {rightPanel === 'layers' && <LayersPanel />}
            {rightPanel === 'animation' && <AnimationPanel />}
            {rightPanel === 'transitions' && <TransitionsPanel />}
            {rightPanel === 'scene' && <ScenePanel />}
          </div>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
