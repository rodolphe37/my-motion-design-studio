import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Moon, Sun, Trash2, AlertTriangle, Database, Languages } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import { getAllProjects, resetDatabase } from '@/lib/db';
import type { Project } from '@/lib/types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation('settings');
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
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
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-ink-300 mt-1">{t('subtitle')}</p>
      </div>

      <section className="panel p-5 space-y-4">
        <h2 className="font-semibold">{t('general.heading')}</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">{t('general.theme')}</div>
            <div className="text-xs text-ink-400">{t('general.themeDesc')}</div>
          </div>
          <button onClick={toggleTheme} className="btn-outline text-sm shrink-0">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === 'dark' ? t('general.themeDark') : t('general.themeLight')}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">{t('general.language')}</div>
            <div className="text-xs text-ink-400">{t('general.languageDesc')}</div>
          </div>
          <button onClick={toggleLanguage} className="btn-outline text-sm shrink-0">
            <Languages className="w-4 h-4" />
            {i18n.language === 'fr' ? 'Français' : 'English'}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">{t('general.storage')}</div>
            <div className="text-xs text-ink-400">{t('general.storageDesc')}</div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink-300 shrink-0">
            <Database className="w-4 h-4" />
            {t('general.projectCount', { count: projects?.length ?? 0 })}
          </div>
        </div>
      </section>

      <section className="panel p-5 space-y-3 border-red-500/30">
        <h2 className="font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {t('danger.heading')}
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">{t('danger.resetTitle')}</div>
            <div className="text-xs text-ink-400">{t('danger.resetDesc')}</div>
          </div>
          <button onClick={() => setConfirmReset(true)} className="btn bg-red-500 hover:bg-red-600 text-white shrink-0">
            <Trash2 className="w-4 h-4" /> {t('danger.resetButton')}
          </button>
        </div>
      </section>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !resetting && setConfirmReset(false)} />
          <div className="relative panel p-6 max-w-sm w-full animate-scale-in">
            <h3 className="font-semibold text-lg mb-2">{t('resetConfirm.title')}</h3>
            <p className="text-sm text-ink-300 mb-4">
              {t('resetConfirm.desc', { count: projects?.length ?? 0 })}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmReset(false)} disabled={resetting} className="btn-ghost">{t('resetConfirm.cancel')}</button>
              <button onClick={handleReset} disabled={resetting} className="btn bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="w-4 h-4" /> {resetting ? t('resetConfirm.resetting') : t('resetConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
