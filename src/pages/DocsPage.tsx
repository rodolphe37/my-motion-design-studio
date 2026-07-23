import { useState, useMemo } from 'react';
import { Search, BookOpen, Layers, Box, Download, Camera, Palette, Film, Keyboard, HelpCircle, ChevronRight, Settings, Diamond } from 'lucide-react';

const SECTIONS = [
  { id: 'start', label: 'Prise en main', icon: BookOpen },
  { id: 'config', label: 'Configuration de projet', icon: Settings },
  { id: 'modes', label: 'Mode 2D vs Mode 3D', icon: Layers },
  { id: 'scenes', label: 'Scènes & Timeline', icon: Film },
  { id: 'tools2d', label: 'Outils de dessin (2D)', icon: Palette },
  { id: 'objects3d', label: 'Objets & matériaux (3D)', icon: Box },
  { id: 'camera3d', label: 'Caméra et éclairage (3D)', icon: Camera },
  { id: 'animation', label: 'Animations & Keyframes', icon: Diamond },
  { id: 'transitions', label: 'Transitions', icon: Layers },
  { id: 'export', label: 'Export vidéo', icon: Download },
  { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const CONTENT: Record<string, { title: string; body: { h?: string; p: string }[] }> = {
  start: {
    title: 'Prise en main',
    body: [
      { p: "MyMotionDesignStudio est un éditeur de motion design 2D et 3D qui fonctionne entièrement dans votre navigateur. Aucune installation n'est nécessaire — l'application est une PWA installable et fonctionne offline." },
      { h: 'Créer un projet', p: "Rendez-vous sur la page Mes projets, cliquez sur « Nouveau projet », puis suivez la configuration initiale : nom, mode 2D ou 3D, format, et réglages de base." },
      { h: 'L\'éditeur', p: "L'éditeur est composé d'une barre d'outils en haut, d'une barre d'outils à gauche (outils de création), d'un canvas central, et de panneaux à droite (calques, propriétés, animation, transitions). La timeline se trouve en bas." },
    ],
  },
  config: {
    title: 'Configuration de projet',
    body: [
      { p: "La modale de configuration initiale vous permet de définir les paramètres structurants de votre projet dès sa création." },
      { h: 'Mode 2D ou 3D', p: "Ce choix est définitif pour le projet. Le mode 2D est idéal pour le motion graphics classique (réseaux sociaux, textes animés). Le mode 3D est adapté aux logo reveals, présentations produit, et showreels." },
      { h: 'Format', p: "Choisissez parmi les préréglages (16:9, 9:16, 1:1, 4:5, 4:3, 3:4, 16:10, 21:9) ou un format personnalisé. Le format est modifiable ultérieurement dans les paramètres du projet." },
      { h: 'Réglages de base', p: "FPS (24/30/60), couleur de fond (2D) ou environnement (3D), durée par défaut d'une scène." },
    ],
  },
  modes: {
    title: 'Mode 2D vs Mode 3D',
    body: [
      { p: "MyMotionDesignStudio propose deux modes distincts. Un projet ne peut pas mélanger 2D et 3D en V1." },
      { h: 'Mode 2D', p: "Scène plane avec formes vectorielles, texte, images. Léger et rapide, idéal pour les réseaux sociaux et le motion graphics classique. Utilise Konva.js pour le rendu canvas." },
      { h: 'Mode 3D', p: "Scène volumétrique avec objets 3D, caméra et éclairage réglables. Utilise Three.js via React Three Fiber pour un rendu WebGL temps réel avec ombres et matériaux PBR." },
    ],
  },
  scenes: {
    title: 'Scènes & Timeline',
    body: [
      { p: "Un projet est composé de plusieurs scènes qui s'enchaînent. Chaque scène a sa propre durée, ses propres calques, et une transition vers la scène suivante." },
      { h: 'Timeline', p: "La timeline en bas affiche une piste par calque. Les keyframes apparaissent sous forme de losanges déplaçables. Le playhead indique la position courante. Vous pouvez zoomer temporellement." },
      { h: 'Navigation entre scènes', p: "Les onglets de scènes en haut permettent de naviguer, réordonner (glisser-déposer), ajouter ou supprimer des scènes." },
    ],
  },
  tools2d: {
    title: 'Outils de dessin (2D)',
    body: [
      { p: "La barre d'outils gauche en mode 2D propose : sélection, formes (rectangle, ellipse, ligne, polygone, étoile), texte, image, et caméra virtuelle." },
      { h: 'Formes', p: "Cliquez sur un outil de forme puis cliquez-glissez sur le canvas pour créer. Les propriétés (couleur, contour, radius, opacité) se règlent dans le panneau Propriétés." },
      { h: 'Texte', p: "Ajoutez du texte avec police, taille, graisse, couleur et alignement personnalisables." },
      { h: 'Snapping', p: "Des guides magnétiques apparaissent pour aligner vos éléments au centre et aux bords." },
    ],
  },
  objects3d: {
    title: 'Objets & matériaux (3D)',
    body: [
      { p: "En mode 3D, ajoutez des primitives (cube, sphère, cône, cylindre, plan, tore), importez des modèles glTF/GLB ou OBJ, ou créez du texte 3D extrudé." },
      { h: 'Matériaux PBR', p: "Réglez la couleur, la metalness, la roughness, et l'opacité. Appliquez des textures image et des normal maps." },
      { h: 'Import de modèles', p: "Importez vos propres fichiers glTF/GLB ou OBJ pour les utiliser dans vos scènes." },
    ],
  },
  camera3d: {
    title: 'Caméra et éclairage (3D)',
    body: [
      { p: "Le mode 3D offre un contrôle complet de la caméra et de l'éclairage." },
      { h: 'Caméra', p: "Caméra perspective ou orthographique avec réglage du FOV, near et far. Navigation orbit/pan/zoom à la souris. Vues prédéfinies : face, dessus, côté, perspective." },
      { h: 'Lumières', p: "Ajoutez des lumières directionnelles, points, spots ou ambiantes. Réglez couleur et intensité. Les ombres sont activables par objet." },
      { h: 'Environnement', p: "Choisissez un environnement coloré, en dégradé, ou HDRI studio pour des reflets réalistes." },
    ],
  },
  animation: {
    title: 'Animations & Keyframes',
    body: [
      { p: "Le moteur d'animation de MyMotionDesignStudio est commun aux modes 2D et 3D. Il interpole position, rotation, échelle, opacité et couleur entre les keyframes." },
      { h: 'Keyframes', p: "Placez des keyframes sur n'importe quelle propriété animable. Chaque keyframe a un type d'easing : linéaire, ease-in, ease-out, ease-in-out, spring, ou bézier custom." },
      { h: 'Préréglages', p: "Des préréglages d'animation sont disponibles : Fade in, Slide + bounce, Zoom pop (2D), Orbit reveal, Drop + rebond, Rotation continue (3D)." },
    ],
  },
  transitions: {
    title: 'Transitions',
    body: [
      { p: "Les transitions s'appliquent entre deux scènes, en 2D comme en 3D, lors du rendu final." },
      { h: 'Types', p: "Fondu, glissement, morphing, wipe, zoom, dissolve. Chaque transition a une durée et un easing réglables." },
    ],
  },
  export: {
    title: 'Export vidéo',
    body: [
      { p: "L'export se fait en deux étapes : choix du format (MP4, WebM, GIF, MOV) puis choix de la définition (480p à 4K)." },
      { h: 'Formats', p: "MP4 (H.264) pour compatibilité maximale, WebM (VP9) pour le web, GIF pour les extraits courts, MOV pour le montage pro." },
      { h: 'Rendu', p: "Le rendu se fait frame-by-frame via MediaRecorder. Pour une qualité maximale, ffmpeg.wasm peut être utilisé. Une barre de progression et un bouton Annuler sont disponibles." },
      { h: 'Attention', p: "Au-delà de 1080p ou pour les scènes 3D complexes, prévoir un temps de rendu et une mémoire plus importants." },
    ],
  },
  shortcuts: {
    title: 'Raccourcis clavier',
    body: [
      { p: "Les raccourcis sont adaptés au mode actif (2D ou 3D)." },
      { h: 'Mode 2D', p: "V = sélection, R = rectangle, T = texte, Espace = pan. Ctrl+Z/Y = undo/redo, Ctrl+D = dupliquer, Delete = supprimer, flèches = nudge." },
      { h: 'Mode 3D', p: "G = déplacer, R = tourner, S = échelle (convention Blender). Clic-droit maintenu ou Alt+drag = orbit caméra." },
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      { h: 'Mes données sont-elles sauvegardées ?', p: "Oui, tout est persisté localement via IndexedDB. Vous pouvez aussi exporter/importer vos projets en JSON." },
      { h: 'Puis-je mélanger 2D et 3D ?', p: "Pas en V1. Le mode est figé à la création. Vous pouvez dupliquer un projet pour repartir sur l'autre mode." },
      { h: 'L\'app fonctionne-t-elle hors ligne ?', p: "Oui, MyMotionDesignStudio est une PWA offline-first. Seul l'export vidéo lourd peut nécessiter du temps de calcul local." },
    ],
  },
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('start');
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!query) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter((s) => s.label.toLowerCase().includes(q) || (CONTENT[s.id]?.title || '').toLowerCase().includes(q));
  }, [query]);

  const content = CONTENT[activeSection];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <nav className="space-y-1">
            {filteredSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  activeSection === s.id
                    ? 'bg-accent-violet/10 text-accent-violet'
                    : 'text-ink-300 hover:text-ink-50 hover:bg-ink-750'
                }`}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
                {activeSection === s.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{content?.title}</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-accent-violet to-accent-blue rounded-full" />
          </div>
          <div className="space-y-6">
            {content?.body.map((block, i) => (
              <div key={i}>
                {block.h && <h2 className="text-xl font-semibold mb-2 text-ink-50">{block.h}</h2>}
                <p className="text-ink-300 leading-relaxed">{block.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
