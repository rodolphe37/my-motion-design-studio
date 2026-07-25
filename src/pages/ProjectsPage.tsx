import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, FolderOpen, Copy, Trash2, Edit3, Download, Upload, Film, Box, Square, Clock, Monitor } from 'lucide-react';
import { db, getAllProjects, deleteProject, duplicateProject } from '@/lib/db';
import type { Project } from '@/lib/types';
import { NewProjectModal } from '@/components/NewProjectModal';
import { downloadJSON, formatDuration } from '@/lib/download';

export default function ProjectsPage() {
  const projects = useLiveQuery(() => getAllProjects(), [], [] as Project[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'mode'>('date');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = (projects || [])
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return b.updatedAt - a.updatedAt;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.mode.localeCompare(b.mode);
    });

  const handleRename = async (id: string) => {
    const p = await db.projects.get(id);
    if (p) {
      p.name = renameValue || 'Projet sans titre';
      p.updatedAt = Date.now();
      await db.projects.put(p);
    }
    setRenameId(null);
  };

  const handleExport = (p: Project) => {
    downloadJSON(p, `${p.name.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Project;
        data.id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        data.createdAt = Date.now();
        data.updatedAt = Date.now();
        await db.projects.put(data);
      } catch {
        alert('Fichier de projet invalide');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalDuration = (p: Project) => p.scenes.reduce((sum, s) => sum + s.duration, 0);

  return (
    <>
      {/* Dashboard is desktop-only: project management (drag targets, dense
          grids, context menus) isn't designed for small touch screens. Gate
          entirely rather than just warn, matching the "desktop only" ask —
          nothing below renders (or is reachable) under the md breakpoint. */}
      <div className="md:hidden min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mb-4">
          <Monitor className="w-8 h-8 text-accent-violet" />
        </div>
        <h2 className="font-semibold text-lg mb-1">Disponible sur desktop uniquement</h2>
        <p className="text-sm text-ink-400 max-w-xs">
          La gestion de projets est optimisée pour un grand écran. Ouvrez MyMotionDesignStudio sur un ordinateur pour créer et gérer vos projets.
        </p>
      </div>
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mes projets</h1>
            <p className="text-sm text-ink-300 mt-1">{filtered.length} projet{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="btn-outline cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importer</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
          </div>
        </div>
  
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="input sm:w-48">
            <option value="date">Trier par date</option>
            <option value="name">Trier par nom</option>
            <option value="mode">Trier par mode</option>
          </select>
        </div>
  
        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-ink-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Aucun projet</h3>
            <p className="text-sm text-ink-400 mb-4">Créez votre premier projet de motion design.</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Nouveau projet
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="group panel hover:border-ink-500 transition-all hover:-translate-y-1 hover:shadow-xl">
                <Link to={`/editor/${p.id}`} className="block relative aspect-video bg-ink-950 rounded-t-xl overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.mode === '3d' ? 'from-blue-500 to-cyan-500' : 'from-violet-500 to-purple-500'} flex items-center justify-center`}>
                        {p.mode === '3d' ? <Box className="w-6 h-6 text-white" /> : <Square className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold backdrop-blur ${p.mode === '3d' ? 'bg-blue-500/30 text-blue-200' : 'bg-violet-500/30 text-violet-200'}`}>
                      {p.mode.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-ink-300 font-mono bg-ink-900/60 backdrop-blur px-2 py-0.5 rounded">
                    {p.settings.width}×{p.settings.height}
                  </div>
                </Link>
                <div className="p-3">
                  {renameId === p.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(p.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(p.id)}
                      autoFocus
                      className="input text-sm"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <Link to={`/editor/${p.id}`} className="font-medium text-sm hover:text-accent-violet transition-colors truncate">
                        {p.name}
                      </Link>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="icon-btn w-7 h-7">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === p.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-8 z-20 w-44 panel py-1 shadow-xl animate-scale-in">
                              <Link to={`/editor/${p.id}`} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-ink-700">
                                <FolderOpen className="w-4 h-4" /> Ouvrir
                              </Link>
                              <button onClick={() => { setRenameId(p.id); setRenameValue(p.name); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-ink-700 text-left">
                                <Edit3 className="w-4 h-4" /> Renommer
                              </button>
                              <button onClick={async () => { await duplicateProject(p.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-ink-700 text-left">
                                <Copy className="w-4 h-4" /> Dupliquer
                              </button>
                              <button onClick={() => { handleExport(p); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-ink-700 text-left">
                                <Download className="w-4 h-4" /> Exporter JSON
                              </button>
                              <button onClick={() => { setConfirmDelete(p.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-red-500/10 text-red-400 text-left">
                                <Trash2 className="w-4 h-4" /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(totalDuration(p))}</span>
                    <span>•</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
  
        <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
  
        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <div className="relative panel p-6 max-w-sm w-full animate-scale-in">
              <h3 className="font-semibold text-lg mb-2">Supprimer ce projet ?</h3>
              <p className="text-sm text-ink-300 mb-4">Cette action est irréversible. Le projet et toutes ses scènes seront définitivement supprimés.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Annuler</button>
                <button onClick={async () => { await deleteProject(confirmDelete); setConfirmDelete(null); }} className="btn bg-red-500 hover:bg-red-600 text-white">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
