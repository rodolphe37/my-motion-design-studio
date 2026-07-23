import { useEffect } from 'react';
import { useEditorStore } from '@/lib/store';
import { createShapeLayer, createTextLayer } from '@/lib/factories';

export function useKeyboardShortcuts() {
  const project = useEditorStore((s) => s.project);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const addLayer = useEditorStore((s) => s.addLayer);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const isPlaying = useEditorStore((s) => s.isPlaying);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!project) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
        else if (e.key === 'd' && selectedLayerIds.length > 0) { e.preventDefault(); duplicateLayer(selectedLayerIds[0]); }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIds.length > 0) { e.preventDefault(); deleteLayer(selectedLayerIds[0]); }
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying(!isPlaying);
      } else if (project.mode === '2d') {
        if (e.key === 'v' || e.key === 'V') { /* select tool */ }
        else if (e.key === 'r' || e.key === 'R') { addLayer(createShapeLayer()); }
        else if (e.key === 't' || e.key === 'T') { addLayer(createTextLayer()); }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, undo, redo, addLayer, deleteLayer, duplicateLayer, selectedLayerIds, setPlaying, isPlaying]);
}
