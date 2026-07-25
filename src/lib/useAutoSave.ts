import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from './store';
import { saveProject } from './db';

export function useAutoSave() {
  const { i18n } = useTranslation();
  const project = useEditorStore((s) => s.project);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deliberately depends on `project` only, not `saveStatus`. Setting the
  // status to 'saving' below is itself a store update — if `saveStatus`
  // were a dependency, that write would re-run this same effect, and its
  // cleanup would clearTimeout the very timer just scheduled a line above,
  // silently dropping every autosave (status gets stuck on "saving" forever
  // and IndexedDB never actually receives the write). Read the latest
  // status via getState() instead of subscribing to it here.
  useEffect(() => {
    if (!project || useEditorStore.getState().saveStatus !== 'unsaved') return;
    setSaveStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveProject(project);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('unsaved');
      }
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [project, setSaveStatus]);

  const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const formatTime = (date: Date) =>
    date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

  return {
    saveStatus,
    savedAt: project ? formatTime(new Date(project.updatedAt)) : '',
  };
}
