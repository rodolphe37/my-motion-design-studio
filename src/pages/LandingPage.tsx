import { Link } from 'react-router-dom';
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
  Send,
  Monitor,
} from 'lucide-react';
import { DemoPlayer } from '@/components/DemoPlayer';

const FEATURES = [
  {
    icon: Shapes,
    title: 'Édition 2D WYSIWYG',
    desc: 'Formes vectorielles, texte, images — manipulez tout directement sur le canvas.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Box,
    title: 'Scènes 3D complètes',
    desc: 'Primitives, import glTF, lumières, caméras, matériaux PBR — rendu WebGL temps réel.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Diamond,
    title: 'Keyframes & Easing',
    desc: 'Moteur d\'animation custom avec courbes d\'easing, spring et bézier custom.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Layers,
    title: 'Scènes & Transitions',
    desc: 'Enchaînez plusieurs scènes avec transitions fondu, slide, zoom, dissolve.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Download,
    title: 'Export vidéo',
    desc: 'Export MP4, WebM, GIF via MediaRecorder ou ffmpeg.wasm pour un rendu qualité.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Offline-first PWA',
    desc: 'Installez l\'app, travaillez sans réseau. Tout est persisté en local via IndexedDB.',
    color: 'from-indigo-500 to-blue-500',
  },
];

const STEPS = [
  { icon: Palette, title: 'Créer', desc: 'Configurez votre projet : mode 2D ou 3D, format, FPS.' },
  { icon: Layers, title: 'Animer', desc: 'Ajoutez des objets, keyframes, et réglez les propriétés.' },
  { icon: Play, title: 'Prévisualiser', desc: 'Lancez le visualisateur pour voir le rendu final.' },
  { icon: Download, title: 'Exporter', desc: 'Choisissez format et qualité, téléchargez votre vidéo.' },
];

const SHOWCASE = [
  { title: 'Motion Studio — Démo 2D', mode: '2D', thumb: '/demos/2d-thumb.jpg' },
  { title: 'Motion Studio — Démo 3D', mode: '3D', thumb: '/demos/3d-thumb.jpg' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-ink-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-ink-900/70 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center shadow-lg shadow-accent-violet/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Motion Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/docs" className="btn-ghost text-sm">Documentation</Link>
            <Link to="/projects" className="btn-primary text-sm">
              Ouvrir l'app
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
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
              Éditeur de motion design 2D & 3D dans le navigateur
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Créez des vidéos de{' '}
              <span className="bg-gradient-to-r from-accent-violet via-accent-pink to-accent-blue bg-clip-text text-transparent">
                motion design
              </span>{' '}
              dignes d'un pro
            </h1>
            <p className="text-lg text-ink-300 max-w-lg leading-relaxed">
              Motion Studio est un éditeur WYSIWYG complet, offline-first. Animez
              en 2D ou 3D, prévisualisez en temps réel, exportez en vidéo — sans
              installer aucun logiciel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary text-base px-6 py-3">
                Créer mon premier projet
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/docs" className="btn-outline text-base px-6 py-3">
                Voir la documentation
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-400">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent-violet" /> Offline-first</span>
              <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-accent-blue" /> PWA installable</span>
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-accent-pink" /> Export vidéo</span>
            </div>
          </div>
          <div className="animate-scale-in">
            <DemoPlayer />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Tout ce qu'il faut pour animer</h2>
            <p className="text-ink-300 max-w-2xl mx-auto">
              Un outil complet pour le motion design, du storyboard à l'export vidéo final.
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
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 border-t border-ink-800 bg-ink-850/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Comment ça marche</h2>
            <p className="text-ink-300">Quatre étapes, du début à la vidéo finale.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className="panel p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-mono text-accent-violet mb-2">ÉTAPE {i + 1}</div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-ink-300">{step.desc}</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Galerie d'exemples</h2>
            <p className="text-ink-300">Images extraites des démos exportées ci-dessus — le rendu réel de l'app.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {SHOWCASE.map((item, i) => (
              <div key={i} className="group relative aspect-video rounded-xl overflow-hidden panel cursor-pointer">
                <img src={item.thumb} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white backdrop-blur">
                      {item.mode}
                    </span>
                  </div>
                </div>
              </div>
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
              <h2 className="text-3xl font-bold mb-3">Prêt à créer ?</h2>
              <p className="text-ink-300 mb-6 max-w-md mx-auto">
                Lancez votre premier projet en quelques secondes. Aucune installation,
                aucun compte requis.
              </p>
              <Link to="/projects" className="btn-primary text-base px-8 py-3">
                Créer mon premier projet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-ink-800 bg-ink-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-ink-300">Motion Studio © 2026</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-ink-400">
              <Link to="/docs" className="hover:text-ink-100 transition-colors">Documentation</Link>
              <Link to="/projects" className="hover:text-ink-100 transition-colors">Mes projets</Link>
              <a href="#" className="hover:text-ink-100 transition-colors" aria-label="GitHub"><GitBranch className="w-4 h-4" /></a>
              <a href="#" className="hover:text-ink-100 transition-colors" aria-label="Twitter"><Send className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
