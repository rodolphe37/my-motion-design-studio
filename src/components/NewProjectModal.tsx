import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, ArrowLeft, Check, Box, Square } from 'lucide-react';
import type { ProjectMode, AspectRatioPreset } from '@/lib/types';
import { ASPECT_RATIOS } from '@/lib/types';
import { createProject } from '@/lib/factories';
import { saveProject } from '@/lib/db';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('projects');
  const [step, setStep] = useState(0);
  const [name, setName] = useState(t('untitledProject'));
  const [mode, setMode] = useState<ProjectMode | null>(null);
  const [preset, setPreset] = useState<AspectRatioPreset>('16:9');
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [ratioLocked, setRatioLocked] = useState(true);
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [bgColor, setBgColor] = useState('#0f0f12');
  const [environment, setEnvironment] = useState<'color' | 'gradient' | 'hdri'>('gradient');
  const [shadows, setShadows] = useState(true);
  const [sceneDuration, setSceneDuration] = useState(3);

  if (!open) return null;

  const reset = () => {
    setStep(0);
    setName(t('untitledProject'));
    setMode(null);
    setPreset('16:9');
    setFps(30);
    setBgColor('#0f0f12');
    setEnvironment('gradient');
    setShadows(true);
    setSceneDuration(3);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    const actualPreset: AspectRatioPreset = preset === 'custom' ? 'custom' : preset;
    const w = preset === 'custom' ? customW : ASPECT_RATIOS.find((r) => r.preset === preset)?.width ?? 1920;
    const h = preset === 'custom' ? customH : ASPECT_RATIOS.find((r) => r.preset === preset)?.height ?? 1080;
    const project = createProject(name, mode!, actualPreset, {
      width: w,
      height: h,
      fps,
      backgroundColor: bgColor,
      environment,
      shadows,
      defaultSceneDuration: sceneDuration,
    });
    await saveProject(project);
    handleClose();
    navigate(`/editor/${project.id}`);
  };

  const canProceed = step === 0 || (step === 1 && mode) || (step === 2 && (preset !== 'custom' || (customW > 0 && customH > 0))) || step === 3;

  const steps = [t('newProjectModal.steps.name'), t('newProjectModal.steps.mode'), t('newProjectModal.steps.format'), t('newProjectModal.steps.settings')];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative panel w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ink-700 sticky top-0 bg-ink-850 z-10">
          <h2 className="text-lg font-semibold">{t('newProjectModal.title')}</h2>
          <button onClick={handleClose} className="icon-btn"><X className="w-5 h-5" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-ink-700">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-accent-violet text-white' : 'bg-ink-700 text-ink-400'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-ink-50 font-medium' : 'text-ink-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-ink-700'}`} />}
            </div>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              <label className="label">{t('newProjectModal.step0.label')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input text-base"
                placeholder={t('newProjectModal.step0.placeholder')}
                autoFocus
              />
              <p className="text-sm text-ink-400">{t('newProjectModal.step0.hint')}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <label className="label">{t('newProjectModal.step1.label')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('2d')}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    mode === '2d' ? 'border-accent-violet bg-accent-violet/10' : 'border-ink-600 hover:border-ink-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-3">
                    <Square className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{t('newProjectModal.step1.mode2dTitle')}</h3>
                  <p className="text-sm text-ink-300">{t('newProjectModal.step1.mode2dDesc')}</p>
                </button>
                <button
                  onClick={() => setMode('3d')}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    mode === '3d' ? 'border-accent-blue bg-accent-blue/10' : 'border-ink-600 hover:border-ink-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{t('newProjectModal.step1.mode3dTitle')}</h3>
                  <p className="text-sm text-ink-300">{t('newProjectModal.step1.mode3dDesc')}</p>
                </button>
              </div>
              <p className="text-sm text-amber-400/80 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {t('newProjectModal.step1.definitiveWarning')}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="label">{t('newProjectModal.step2.label')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.preset}
                    onClick={() => setPreset(r.preset)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preset === r.preset ? 'border-accent-violet bg-accent-violet/10' : 'border-ink-600 hover:border-ink-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2 h-12">
                      <div
                        className="border-2 border-ink-300 rounded"
                        style={{
                          width: r.width >= r.height ? 32 : (32 * r.width) / r.height,
                          height: r.height >= r.width ? 32 : (32 * r.height) / r.width,
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium">{r.label}</div>
                    <div className="text-[10px] text-ink-400">{r.width}×{r.height}</div>
                  </button>
                ))}
                <button
                  onClick={() => setPreset('custom')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preset === 'custom' ? 'border-accent-violet bg-accent-violet/10' : 'border-ink-600 hover:border-ink-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2 h-12 text-ink-300">{t('newProjectModal.step2.custom')}</div>
                  <div className="text-xs font-medium">{t('newProjectModal.step2.customLabel')}</div>
                </button>
              </div>
              {preset === 'custom' && (
                <div className="flex items-end gap-2 p-3 bg-ink-900 rounded-lg border border-ink-600">
                  <div className="flex-1">
                    <label className="label">{t('newProjectModal.step2.width')}</label>
                    <input type="number" value={customW} onChange={(e) => {
                      const w = parseInt(e.target.value) || 0;
                      setCustomW(w);
                      if (ratioLocked && customH > 0) setCustomH(Math.round(w * (customH / customW || 1)));
                    }} className="input" />
                  </div>
                  <button onClick={() => setRatioLocked(!ratioLocked)} className="icon-btn mb-0.5" title={t('newProjectModal.step2.lockRatio')}>
                    {ratioLocked ? <Check className="w-4 h-4 text-accent-violet" /> : <X className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <label className="label">{t('newProjectModal.step2.height')}</label>
                    <input type="number" value={customH} onChange={(e) => setCustomH(parseInt(e.target.value) || 0)} className="input" />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="label">{t('newProjectModal.step3.fps')}</label>
                <div className="flex gap-2">
                  {([24, 30, 60] as const).map((f) => (
                    <button key={f} onClick={() => setFps(f)} className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      fps === f ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                    }`}>{f} fps</button>
                  ))}
                </div>
              </div>
              {mode === '2d' && (
                <div className="space-y-2">
                  <label className="label">{t('newProjectModal.step3.bgColor')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input font-mono" />
                  </div>
                </div>
              )}
              {mode === '3d' && (
                <>
                  <div className="space-y-2">
                    <label className="label">{t('newProjectModal.step3.reflections')}</label>
                    <div className="flex gap-2">
                      {(['color', 'gradient', 'hdri'] as const).map((env) => (
                        <button key={env} onClick={() => setEnvironment(env)} className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                          environment === env ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                        }`}>{env === 'hdri' ? t('newProjectModal.step3.reflectionsHdri') : env === 'gradient' ? t('newProjectModal.step3.reflectionsCity') : t('newProjectModal.step3.reflectionsNone')}</button>
                      ))}
                    </div>
                    <p className="text-xs text-ink-400">{t('newProjectModal.step3.reflectionsHint')}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-ink-900 rounded-lg border border-ink-600">
                    <div>
                      <div className="text-sm font-medium">{t('newProjectModal.step3.shadows')}</div>
                      <div className="text-xs text-ink-400">{t('newProjectModal.step3.shadowsDesc')}</div>
                    </div>
                    <button onClick={() => setShadows(!shadows)} className={`w-11 h-6 rounded-full transition-colors ${shadows ? 'bg-accent-violet' : 'bg-ink-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${shadows ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="label">{t('newProjectModal.step3.sceneDuration')}</label>
                <input type="number" value={sceneDuration} onChange={(e) => setSceneDuration(parseInt(e.target.value) || 3)} min={1} max={60} className="input" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-ink-700 sticky bottom-0 bg-ink-850">
          <button
            onClick={() => (step === 0 ? handleClose() : setStep(step - 1))}
            className="btn-ghost"
          >
            {step === 0 ? t('newProjectModal.footer.cancel') : <><ArrowLeft className="w-4 h-4" /> {t('newProjectModal.footer.previous')}</>}
          </button>
          {step < 3 ? (
            <button
              onClick={() => canProceed && setStep(step + 1)}
              disabled={!canProceed}
              className="btn-primary"
            >
              {t('newProjectModal.footer.next')} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} className="btn-primary">
              <Check className="w-4 h-4" /> {t('newProjectModal.footer.create')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
