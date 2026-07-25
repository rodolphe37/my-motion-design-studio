import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Moon, Sun, Trash2, AlertTriangle, Database } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import { getAllProjects, resetDatabase } from '@/lib/db';
import type { Project } from '@/lib/types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const projects = useLiveQuery(() => getAllProjects(), [], [] as Project[]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await resetDatabase();
    setResetting(false);
    setConfirmReset(false);
    navigate('/projects');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-ink-300 mt-1">Préférences de l'application et gestion des données stockées sur cet appareil.</p>
      </div>

      <section className="panel p-5 space-y-4">
        <h2 className="font-semibold">Général</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Thème</div>
            <div className="text-xs text-ink-400">Apparence claire ou sombre de l'interface</div>
          </div>
          <button onClick={toggleTheme} className="btn-outline text-sm shrink-0">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === 'dark' ? 'Sombre' : 'Clair'}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Stockage</div>
            <div className="text-xs text-ink-400">Tous les projets sont enregistrés localement dans ce navigateur (IndexedDB), sans compte ni synchronisation</div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink-300 shrink-0">
            <Database className="w-4 h-4" />
            {projects?.length ?? 0} projet{(projects?.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      <section className="panel p-5 space-y-3 border-red-500/30">
        <h2 className="font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Zone dangereuse
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Réinitialiser l'application</div>
            <div className="text-xs text-ink-400">Supprime définitivement tous les projets stockés dans ce navigateur. Cette action est irréversible.</div>
          </div>
          <button onClick={() => setConfirmReset(true)} className="btn bg-red-500 hover:bg-red-600 text-white shrink-0">
            <Trash2 className="w-4 h-4" /> Réinitialiser
          </button>
        </div>
      </section>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !resetting && setConfirmReset(false)} />
          <div className="relative panel p-6 max-w-sm w-full animate-scale-in">
            <h3 className="font-semibold text-lg mb-2">Réinitialiser l'application ?</h3>
            <p className="text-sm text-ink-300 mb-4">
              Tous vos projets ({projects?.length ?? 0}) seront définitivement supprimés de ce navigateur. Cette action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmReset(false)} disabled={resetting} className="btn-ghost">Annuler</button>
              <button onClick={handleReset} disabled={resetting} className="btn bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="w-4 h-4" /> {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
