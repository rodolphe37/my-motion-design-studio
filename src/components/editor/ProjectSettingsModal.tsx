import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { AspectRatioPreset } from '@/lib/types';
import { ASPECT_RATIOS } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProjectSettingsModal({ open, onClose }: Props) {
  const { t } = useTranslation('editor');
  const project = useEditorStore((s) => s.project);
  const updateProjectSettings = useEditorStore((s) => s.updateProjectSettings);

  if (!open || !project) return null;
  const is3D = project.mode === '3d';
  const settings = project.settings;

  const setPreset = (preset: AspectRatioPreset) => {
    if (preset === 'custom') {
      updateProjectSettings({ aspectRatioPreset: preset });
      return;
    }
    const found = ASPECT_RATIOS.find((r) => r.preset === preset);
    if (found) updateProjectSettings({ aspectRatioPreset: preset, width: found.width, height: found.height });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative panel w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ink-700 sticky top-0 bg-ink-850 z-10">
          <h2 className="text-lg font-semibold">{t('projectSettingsModal.title')}</h2>
          <button onClick={onClose} className="icon-btn"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="label">{t('projectSettingsModal.format')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.preset}
                  onClick={() => setPreset(r.preset)}
                  className={`p-2 rounded-lg border-2 text-xs transition-all ${
                    settings.aspectRatioPreset === r.preset ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  <div className="font-medium">{r.label}</div>
                  <div className="text-[10px] text-ink-400">{r.width}×{r.height}</div>
                </button>
              ))}
              <button
                onClick={() => setPreset('custom')}
                className={`p-2 rounded-lg border-2 text-xs transition-all ${
                  settings.aspectRatioPreset === 'custom' ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                }`}
              >
                <div className="font-medium">{t('projectSettingsModal.custom')}</div>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">{t('projectSettingsModal.width')}</label>
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => updateProjectSettings({ width: parseInt(e.target.value) || settings.width, aspectRatioPreset: 'custom' })}
                  className="input text-sm font-mono"
                />
              </div>
              <div>
                <label className="label">{t('projectSettingsModal.height')}</label>
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => updateProjectSettings({ height: parseInt(e.target.value) || settings.height, aspectRatioPreset: 'custom' })}
                  className="input text-sm font-mono"
                />
              </div>
            </div>
            <p className="text-xs text-ink-400">{t('projectSettingsModal.formatHint')}</p>
          </div>

          <div className="space-y-2">
            <label className="label">{t('projectSettingsModal.fps')}</label>
            <div className="flex gap-2">
              {([24, 30, 60] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => updateProjectSettings({ fps: f })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    settings.fps === f ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  {f} fps
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">{t('projectSettingsModal.bgColor')}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.backgroundColor} onChange={(e) => updateProjectSettings({ backgroundColor: e.target.value })} className="w-12 h-10" />
              <input type="text" value={settings.backgroundColor} onChange={(e) => updateProjectSettings({ backgroundColor: e.target.value })} className="input font-mono text-sm" />
            </div>
            <p className="text-xs text-ink-400">{t('projectSettingsModal.bgColorHint')}</p>
          </div>

          {is3D && (
            <>
              <div className="space-y-2">
                <label className="label">{t('projectSettingsModal.reflections')}</label>
                <div className="flex gap-2">
                  {(['color', 'gradient', 'hdri'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => updateProjectSettings({ environment: env })}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        settings.environment === env ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                      }`}
                    >
                      {env === 'hdri' ? t('projectSettingsModal.reflectionsHdri') : env === 'gradient' ? t('projectSettingsModal.reflectionsCity') : t('projectSettingsModal.reflectionsNone')}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-400">{t('projectSettingsModal.reflectionsHint')}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-ink-900 rounded-lg border border-ink-600">
                <div>
                  <div className="text-sm font-medium">{t('projectSettingsModal.shadows')}</div>
                  <div className="text-xs text-ink-400">{t('projectSettingsModal.shadowsDesc')}</div>
                </div>
                <button
                  onClick={() => updateProjectSettings({ shadows: !settings.shadows })}
                  className={`w-11 h-6 rounded-full transition-colors shrink-0 ${settings.shadows ? 'bg-accent-violet' : 'bg-ink-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.shadows ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </>
          )}

          <div>
            <label className="label">{t('projectSettingsModal.sceneDuration')}</label>
            <input
              type="number"
              value={settings.defaultSceneDuration}
              onChange={(e) => updateProjectSettings({ defaultSceneDuration: parseInt(e.target.value) || 1 })}
              min={1}
              max={60}
              className="input text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
