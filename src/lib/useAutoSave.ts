import { useEffect, useRef } from 'react';
import { useEditorStore } from './store';
import { saveProject } from './db';

export function useAutoSave() {
  const project = useEditorStore((s) => s.project);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!project || saveStatus !== 'unsaved') return;
    setSaveStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await saveProject(project);
      setSaveStatus('saved');
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [project, saveStatus, setSaveStatus]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return {
    saveStatus,
    savedAt: project ? formatTime(new Date(project.updatedAt)) : '',
  };
}
