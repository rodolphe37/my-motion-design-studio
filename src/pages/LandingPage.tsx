import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Layers,
  Play,
  Download,
  Box,
  Shapes,
  Diamond,
  Palette,
  Camera,
  Zap,
  ArrowRight,
  GitBranch,
  Monitor,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { DemoPlayer } from '@/components/DemoPlayer';
import { ShowcaseLightbox, type ShowcaseSource } from '@/components/ShowcaseLightbox';
import { useTheme } from '@/lib/useTheme';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation('landing');
  const { t: tCommon } = useTranslation('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState<number | null>(null);

  const FEATURES = [
    { icon: Shapes, key: 'edit2d', color: 'from-violet-500 to-purple-500' },
    { icon: Box, key: 'scenes3d', color: 'from-blue-500 to-cyan-500' },
    { icon: Diamond, key: 'keyframes', color: 'from-pink-500 to-rose-500' },
    { icon: Layers, key: 'scenesTransitions', color: 'from-amber-500 to-orange-500' },
    { icon: Download, key: 'videoExport', color: 'from-emerald-500 to-teal-500' },
    { icon: Zap, key: 'offlinePwa', color: 'from-indigo-500 to-blue-500' },
  ] as const;

  const STEPS = [
    { icon: Palette, key: 'create' },
    { icon: Layers, key: 'animate' },
    { icon: Play, key: 'preview' },
    { icon: Download, key: 'export' },
  ] as const;

  const SHOWCASE: { key: string; badge: string; thumb: string; source: ShowcaseSource }[] = [
    { key: 'demo2d', badge: '2D', thumb: '/demos/2d-thumb.jpg', source: { kind: 'video', demoUrl: '/demos/2d-demo.json' } },
    { key: 'demo3d', badge: '3D', thumb: '/demos/3d-thumb.jpg', source: { kind: 'video', demoUrl: '/demos/3d-demo.json' } },
    { key: 'demoGif', badge: 'GIF', thumb: '/demos/gif-thumb.gif', source: { kind: 'gif', gifUrl: '/demos/gif-thumb.gif' } },
  ];

  return (
    <div className="min-h-screen bg-ink-900 text-ink-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-ink-900/70 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icon-96.png" alt="MyMotionStudio" className="w-8 h-8 rounded-lg shadow-lg shadow-accent-violet/20 shrink-0" />
            <span className="font-semibold truncate text-sm sm:text-base">MyMotionStudio</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Link to="/docs" className="btn-ghost text-sm">{t('nav.docs')}</Link>
            <div className="flex items-center rounded-lg border border-ink-600 overflow-hidden text-xs font-bold" role="group" aria-label={tCommon('language.toggleAria')}>
              <button
                onClick={() => i18n.changeLanguage('fr')}
                aria-pressed={i18n.language === 'fr'}
                className={`px-2 py-1 transition-colors ${i18n.language === 'fr' ? 'bg-accent-violet text-white' : 'text-ink-300 hover:text-ink-50 hover:bg-ink-750'}`}
              >
                FR
              </button>
              <button
                onClick={() => i18n.changeLanguage('en')}
                aria-pressed={i18n.language === 'en'}
                className={`px-2 py-1 transition-colors ${i18n.language === 'en' ? 'bg-accent-violet text-white' : 'text-ink-300 hover:text-ink-50 hover:bg-ink-750'}`}
              >
                EN
              </button>
            </div>
            <button onClick={toggleTheme} className="icon-btn" aria-label={t('nav.themeToggleAria')}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/projects" className="btn-primary text-sm px-4">
              {t('nav.openApp')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile burger toggle */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="icon-btn sm:hidden"
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-ink-700 bg-ink-900/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2 animate-fade-in">
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-ghost text-sm w-full justify-start"
            >
              {t('nav.docs')}
            </Link>
            <div className="flex items-center rounded-lg border border-ink-700 overflow-hidden text-sm font-medium w-full" role="group" aria-label={tCommon('language.toggleAria')}>
              <button
                onClick={() => { i18n.changeLanguage('fr'); setMobileMenuOpen(false); }}
                aria-pressed={i18n.language === 'fr'}
                className={`flex-1 py-2 transition-colors ${i18n.language === 'fr' ? 'bg-accent-violet text-white' : 'text-ink-300'}`}
              >
                FR
              </button>
              <button
                onClick={() => { i18n.changeLanguage('en'); setMobileMenuOpen(false); }}
                aria-pressed={i18n.language === 'en'}
                className={`flex-1 py-2 transition-colors ${i18n.language === 'en' ? 'bg-accent-violet text-white' : 'text-ink-300'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              className="btn-ghost text-sm w-full justify-start"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            </button>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary text-sm w-full justify-center mt-1"
            >
              {t('nav.openApp')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-violet/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/30 text-sm text-accent-violet">
              <Sparkles className="w-3.5 h-3.5" />
              {t('hero.badge')}
            </div>
            {/* flow-root contains the float so it doesn't bleed into the
                paragraph/buttons below. The float uses shape-outside to make
                the heading wrap the logo instead of sitting in a rectangular
                box next to it. A raw alpha mask of the full PNG was tried
                first, but this artwork (play panel, cursor, cube, atom,
                sphere) fills almost the entire square canvas with barely any
                transparent margin, so every heading line saturated to the
                same near-full width -- no visible wrap. Circling just the
                core "M" medallion gives the first line real breathing room;
                the small decorative accents around it are allowed to sit
                behind the text where they overlap. */}
            <div className="flow-root">
              <div
                className="relative float-left mr-3 mb-2 h-20 sm:h-24 lg:h-28"
                style={{
                  shapeOutside: 'circle(37% at 50% 52%)',
                  shapeMargin: '14px',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-violet via-accent-pink to-accent-blue rounded-full blur-2xl opacity-40" />
                <img
                  src="/logo-sm.png"
                  alt="MyMotionStudio"
                  className="relative h-full w-auto drop-shadow-[0_0_30px_rgba(139,92,246,0.45)]"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                {t('hero.headingPrefix')}{' '}
                <span className="bg-gradient-to-r from-accent-violet via-accent-pink to-accent-blue bg-clip-text text-transparent">
                  {t('hero.headingHighlight')}
                </span>{' '}
                {t('hero.headingSuffix')}
              </h1>
            </div>
            <p className="text-lg text-ink-300 max-w-lg leading-relaxed">
              {t('hero.paragraph')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary text-base px-6 py-3">
                {t('hero.createProject')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/docs" className="btn-outline text-base px-6 py-3">
                {t('hero.viewDocs')}
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-400">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent-violet" /> {t('hero.offlineFirst')}</span>
              <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-accent-blue" /> {t('hero.installablePwa')}</span>
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-accent-pink" /> {t('hero.videoExport')}</span>
            </div>
          </div>
          <div className="animate-scale-in">
            <DemoPlayer paused={activeShowcase !== null} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('features.heading')}</h2>
            <p className="text-ink-300 max-w-2xl mx-auto">
              {t('features.subheading')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group panel p-6 hover:border-ink-500 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(`features.items.${f.key}.title`)}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{t(`features.items.${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800 bg-ink-850/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('howItWorks.heading')}</h2>
            <p className="text-ink-300">{t('howItWorks.subheading')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative h-full">
                <div className="panel p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-mono text-accent-violet mb-2">{t('howItWorks.step')} {i + 1}</div>
                  <h3 className="font-semibold mb-1">{t(`howItWorks.steps.${step.key}.title`)}</h3>
                  <p className="text-sm text-ink-300">{t(`howItWorks.steps.${step.key}.desc`)}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-ink-500 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('showcase.heading')}</h2>
            <p className="text-ink-300">{t('showcase.subheading')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {SHOWCASE.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveShowcase(i)}
                aria-label={t('showcase.viewAria', { title: t(`showcase.items.${item.key}`) })}
                className="group relative aspect-video rounded-xl overflow-hidden panel cursor-pointer text-left"
              >
                <img src={item.thumb} alt={t(`showcase.items.${item.key}`)} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-white truncate min-w-0">{t(`showcase.items.${item.key}`)}</h3>
                    <span className="shrink-0 px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white backdrop-blur">
                      {item.badge}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative panel p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 to-accent-blue/10" />
            <div className="relative">
              <Camera className="w-12 h-12 mx-auto mb-4 text-accent-violet" />
              <h2 className="text-3xl font-bold mb-3">{t('cta.heading')}</h2>
              <p className="text-ink-300 mb-6 max-w-md mx-auto">
                {t('cta.paragraph')}
              </p>
              <Link to="/projects" className="btn-primary text-base px-8 py-3">
                {t('cta.createProject')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-ink-800 bg-ink-850">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/icon-96.png" alt="MyMotionStudio" className="w-7 h-7 rounded-lg" />
              <span className="text-sm text-ink-300">{t('footer.copyright')}</span>
              <span className="text-xs text-ink-500 font-mono">v{__APP_VERSION__}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-ink-400">
              <Link to="/docs" className="hover:text-ink-100 transition-colors">{t('footer.docs')}</Link>
              <Link to="/projects" className="hover:text-ink-100 transition-colors">{t('footer.projects')}</Link>
              <a href="https://github.com/rodolphe37/my-motion-studio" target="_blank" rel="noopener noreferrer" className="hover:text-ink-100 transition-colors" aria-label={t('footer.githubAria')}><GitBranch className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      <ShowcaseLightbox
        source={activeShowcase !== null ? SHOWCASE[activeShowcase].source : null}
        label={activeShowcase !== null ? t(`showcase.items.${SHOWCASE[activeShowcase].key}`) : ''}
        closeAria={t('showcase.closeAria')}
        onClose={() => setActiveShowcase(null)}
      />
    </div>
  );
}
