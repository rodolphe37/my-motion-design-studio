import {
  Search, BookOpen, Layers, Box, Download, Camera, Palette, Film, Keyboard,
  HelpCircle, ChevronRight, Settings, Diamond, LayoutPanelLeft, FolderOpen,
} from 'lucide-react';

export { Search, ChevronRight };

export const SECTIONS = [
  { id: 'start', label: 'Prise en main', icon: BookOpen },
  { id: 'config', label: 'Configuration de projet', icon: Settings },
  { id: 'modes', label: 'Mode 2D vs Mode 3D', icon: Layers },
  { id: 'interface', label: "Interface de l'éditeur", icon: LayoutPanelLeft },
  { id: 'scenes', label: 'Scènes & Timeline', icon: Film },
  { id: 'tools2d', label: 'Outils de dessin (2D)', icon: Palette },
  { id: 'objects3d', label: 'Objets & matériaux (3D)', icon: Box },
  { id: 'camera3d', label: 'Caméra et éclairage (3D)', icon: Camera },
  { id: 'animation', label: 'Animations & Keyframes', icon: Diamond },
  { id: 'transitions', label: 'Transitions', icon: Layers },
  { id: 'export', label: 'Export vidéo', icon: Download },
  { id: 'projects', label: 'Gérer vos projets', icon: FolderOpen },
  { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export const CONTENT: Record<string, { title: string; body: { h?: string; p: string }[] }> = {
  start: {
    title: 'Prise en main',
    body: [
      { p: "MyMotionStudio est un éditeur de motion design 2D et 3D qui fonctionne entièrement dans votre navigateur. Aucune installation n'est nécessaire — l'application est une PWA (Progressive Web App) installable et fonctionne hors ligne une fois chargée une première fois." },
      { h: 'Créer un projet', p: "Rendez-vous sur la page « Mes projets », cliquez sur « Nouveau projet », puis suivez les 4 étapes de configuration : nom, mode 2D ou 3D, format d'image, réglages de base. Le projet est créé et enregistré localement dès la dernière étape, et vous êtes redirigé directement dans l'éditeur." },
      { h: "L'éditeur", p: "L'éditeur est composé d'une barre d'outils en haut (scènes, lecture, export...), d'une barre d'outils à gauche (ajout d'éléments), d'un canvas central, de panneaux à droite (Propriétés, Calques, Anim, Trans.) et d'une timeline en bas." },
      { h: 'Installer l\'application', p: "Depuis un navigateur compatible (Chrome, Edge...), une icône d'installation apparaît dans la barre d'adresse. Une fois installée, l'app se lance comme une application native et reste utilisable sans connexion réseau." },
      { h: 'Accès desktop / mobile', p: "La page d'accueil est utilisable sur mobile (menu de navigation en burger sous 640px de large). En revanche, la gestion de projets (« Mes projets ») et l'éditeur lui-même nécessitent un écran de bureau — un message dédié s'affiche si l'écran est trop étroit." },
    ],
  },
  config: {
    title: 'Configuration de projet',
    body: [
      { p: "La création d'un projet se fait en 4 étapes via la modale « Nouveau projet », accessible depuis la page Mes projets." },
      { h: '1. Nom', p: "Le nom du projet (modifiable plus tard directement dans l'éditeur, en cliquant sur le nom en haut à gauche, ou depuis la page Mes projets via le menu ⋮ → Renommer)." },
      { h: '2. Mode : 2D ou 3D', p: "Ce choix est définitif pour le projet — il ne peut pas être changé après création. Pour repartir dans l'autre mode, dupliquez le projet puis recréez-en un nouveau dans l'autre mode." },
      { h: '3. Format', p: "Un préréglage de dimensions parmi 16:9 (1920×1080), 9:16 (1080×1920), 1:1 (1080×1080), 4:5 (1080×1350), 4:3 (1440×1080), 3:4 (1080×1440), 16:10 (1920×1200), 21:9 (2560×1080), ou un format personnalisé (largeur/hauteur en pixels, avec verrouillage du ratio optionnel)." },
      { h: '4. Réglages', p: "FPS de travail (24/30/60), et selon le mode : couleur de fond par défaut (2D) ou environnement + ombres (3D). Durée par défaut d'une scène (en secondes) dans les deux cas." },
      { h: 'Modifier ces réglages après création', p: "Le format (dimensions/preset), le FPS, la couleur de fond, l'environnement, les ombres et la durée par défaut d'une scène restent modifiables après création, depuis le bouton en forme d'engrenage à côté du nom du projet dans la barre du haut de l'éditeur (« Réglages du projet »). Seul le mode (2D/3D) est figé définitivement. Le format d'export (résolution, qualité, FPS de sortie) se choisit indépendamment à chaque export, dans la modale Export." },
    ],
  },
  modes: {
    title: 'Mode 2D vs Mode 3D',
    body: [
      { p: "MyMotionStudio propose deux modes distincts et un projet ne peut pas mélanger 2D et 3D." },
      { h: 'Mode 2D', p: "Scène plane avec formes vectorielles (rectangle, ellipse, ligne, polygone, étoile), texte et images. Rendu via Konva.js sur un canvas HTML5. Léger et rapide, idéal pour les réseaux sociaux et le motion graphics classique." },
      { h: 'Mode 3D', p: "Scène volumétrique avec primitives géométriques, texte 3D extrudé, caméra et éclairage réglables. Rendu via Three.js / React Three Fiber (WebGL temps réel), avec ombres et matériaux PBR (metalness/roughness)." },
    ],
  },
  interface: {
    title: "Interface de l'éditeur",
    body: [
      { p: "L'éditeur est organisé en 4 zones : la barre d'outils du haut, la barre d'outils de gauche, le canvas central, les panneaux de droite, et la timeline en bas." },
      { h: 'Barre du haut', p: "Retour à Mes projets, nom du projet (cliquable pour le renommer), badge 2D/3D, bouton engrenage (Réglages du projet), onglets des scènes du projet (cliquez pour naviguer, « + » pour en ajouter une), indicateur d'enregistrement (Enregistré / Non enregistré / Enregistrement...), lecture/pause, stop, annuler/rétablir, zoom du canvas (10% à 400%, bouton « ajuster » pour revenir à 100%), bouton Visualisateur (aperçu plein écran), bascule thème clair/sombre, et bouton Exporter." },
      { h: 'Barre de gauche', p: "En 2D : outils de sélection et de création (rectangle, ellipse, ligne, polygone, étoile, texte, image). En 3D : outils de sélection/déplacement/rotation/échelle (gizmo dans le viewport — voir la section Objets & matériaux), primitives (cube, sphère, cône, cylindre, plan, tore), import de modèle (glTF/GLB/OBJ), texte 3D, lumière et caméra." },
      { h: 'Panneaux de droite', p: "Cinq onglets : Propriétés (édite l'élément sélectionné), Calques (liste des éléments de la scène courante), Anim (keyframes de l'élément sélectionné), Trans. (transition vers la scène suivante), Scène (durée et fond de la scène courante)." },
      { h: 'Timeline', p: "En bas de l'éditeur : liste des calques à gauche, piste temporelle à droite avec règle en secondes, curseur de lecture (playhead) déplaçable en cliquant/glissant sur la piste, et un losange par keyframe. Deux boutons +/- pour zoomer la timeline horizontalement." },
      { h: 'Visualisateur (Preview)', p: "Ouvre un mode plein écran qui rejoue le projet scène par scène, avec des boutons scène précédente/suivante et lecture/pause — utile pour vérifier le rendu sans les outils d'édition à l'écran." },
    ],
  },
  scenes: {
    title: 'Scènes & Timeline',
    body: [
      { p: "Un projet est composé d'une ou plusieurs scènes qui s'enchaînent dans l'ordre où elles ont été créées. Chaque scène a sa propre durée, ses propres calques, et une transition vers la scène suivante." },
      { h: 'Ajouter et naviguer', p: "Le bouton « + » à côté des onglets de scènes (barre du haut) ajoute une nouvelle scène vide, avec la durée par défaut définie à la création du projet. Cliquez un onglet pour basculer dessus — le panneau Calques, Anim et la timeline reflètent alors cette scène." },
      { h: 'Renommer, réordonner, durée, suppression', p: "Double-cliquez un onglet de scène pour le renommer, glissez-le pour réordonner les scènes, et utilisez le « × » qui apparaît au survol pour la supprimer (une scène au moins doit toujours rester). La durée de la scène courante se règle dans l'onglet Scène du panneau de droite." },
      { h: 'Timeline et keyframes', p: "La piste de chaque calque affiche ses keyframes sous forme de losanges roses. Cliquez-glissez un losange horizontalement pour changer son instant. Cliquez n'importe où sur la piste pour déplacer le playhead à cet instant précis." },
    ],
  },
  tools2d: {
    title: 'Outils de dessin (2D)',
    body: [
      { p: "La barre d'outils gauche en mode 2D propose : Sélection, Rectangle, Ellipse, Ligne, Polygone, Étoile, Texte, Image." },
      { h: 'Ajouter un élément', p: "Cliquer un outil de forme (Rectangle, Ellipse, Ligne, Polygone, Étoile) l'insère immédiatement au centre de la scène avec une taille par défaut (200×200 px) — il n'y a pas de tracé au clic-glissé. Repositionnez-le ensuite en le faisant glisser directement sur le canvas, et ajustez sa taille précise via les champs Largeur/Hauteur du panneau Propriétés." },
      { h: 'Texte', p: "L'outil Texte ajoute un calque texte modifiable dans le panneau Propriétés : contenu, taille, police (Inter, Georgia, JetBrains Mono), graisse (normal/semi-bold/bold), couleur, rotation." },
      { h: 'Image', p: "L'outil Image ouvre le sélecteur de fichier de votre appareil. L'image est intégrée directement dans le projet (encodée en base64), redimensionnée automatiquement si nécessaire pour que son plus grand côté ne dépasse pas 500 px, puis ajoutée comme calque déplaçable et redimensionnable comme les formes." },
      { h: 'Propriétés communes', p: "Selon le type de calque : position X/Y, largeur/hauteur, rotation, opacité, couleur de remplissage, couleur et épaisseur de contour, rayon des coins (rectangle), nombre de côtés (polygone) ou de branches (étoile), alignement du texte (gauche/centre/droite)." },
      { h: 'Fond de scène', p: "Chaque scène (2D ou 3D) peut définir son propre fond dans l'onglet « Scène » du panneau de droite : uni, en dégradé (deux couleurs + angle), ou avec des spots de couleur sur un fond uni (ajout/suppression de spots, position, rayon, opacité réglables). Sans réglage spécifique, la scène utilise la couleur de fond définie dans les Réglages du projet. En 3D, le rendu du dégradé/spots est légèrement plus coûteux qu'un fond uni (une texture est générée), sans impact notable sur les scènes courantes." },
    ],
  },
  objects3d: {
    title: 'Objets & matériaux (3D)',
    body: [
      { p: "En mode 3D, la barre d'outils gauche permet d'ajouter des primitives géométriques et du texte 3D. Chaque objet est placé à l'origine de la scène par défaut." },
      { h: 'Primitives disponibles', p: "Cube, Sphère, Cône, Cylindre, Plan, Tore." },
      { h: 'Texte 3D', p: "Texte extrudé (relief réglable) avec biseau automatique. La police intégrée couvre les caractères accentués français. Taille, extrusion (hauteur du relief), couleur et opacité sont réglables dans le panneau Propriétés." },
      { h: 'Matériaux', p: "Chaque objet 3D (primitive ou texte) a une couleur, une metalness (aspect métallique, 0 à 1) et une roughness (aspect mat/brillant, 0 à 1) au format PBR (Physically Based Rendering), plus une opacité." },
      { h: 'Positionnement', p: "Sélectionnez un objet (cube, texte 3D ou modèle importé) puis choisissez l'outil Déplacer, Tourner ou Échelle dans la barre de gauche (ou les raccourcis G/R/S) pour faire apparaître un gizmo de manipulation directement sur l'objet dans le viewport. Touche V ou Échap pour revenir à la simple sélection. La position, la rotation et l'échelle (X/Y/Z) restent aussi modifiables via les champs numériques du panneau Propriétés. Cliquer un objet dans le viewport le sélectionne (il s'entoure d'un contour violet)." },
      { h: 'Import de modèles', p: "Le bouton d'import de la barre d'outils gauche accepte des fichiers glTF, GLB ou OBJ. Le modèle est intégré au projet (encodé en base64) et se manipule comme les autres objets 3D (position, rotation, échelle, gizmo, opacité, ombres)." },
    ],
  },
  camera3d: {
    title: 'Caméra et éclairage (3D)',
    body: [
      { p: "Le mode 3D offre un contrôle de la caméra et de l'éclairage de la scène." },
      { h: 'Caméra', p: "Ajoutez une caméra depuis la barre d'outils gauche. Sa position (X/Y/Z), sa rotation (X/Y/Z), son champ de vision (FOV), ses plans near/far et le mode orthographique (projection sans perspective) se règlent dans le panneau Propriétés. Une seule caméra est active par scène : s'il y en a plusieurs, seule la première ajoutée pilote réellement le rendu." },
      { h: 'Navigation dans le viewport', p: "Dans le canvas de l'éditeur, tant que la lecture est en pause, la vue peut être orbitée à la souris (clic-glisser), déplacée latéralement (clic droit-glisser) et zoomée (molette) — ceci ne modifie que votre point de vue d'édition, pas la caméra du projet. Cette navigation libre n'existe pas dans le Visualisateur (Preview) ni pendant l'export : ces deux modes affichent toujours la scène telle que pilotée par la caméra 3D du projet (et ses keyframes), garantissant que la vidéo exportée correspond à ce que vous avez configuré." },
      { h: 'Lumières', p: "Quatre types existent au niveau des données (directionnelle, point, spot, ambiante), mais le bouton « Lumière » de la barre d'outils ajoute toujours une lumière directionnelle. Position, couleur et intensité sont réglables dans le panneau Propriétés, ainsi que la distance (lumière point) ou l'angle du cône en radians (lumière spot). S'il n'y a aucune lumière dans la scène, un éclairage ambiant + directionnel par défaut est utilisé automatiquement." },
      { h: 'Ombres', p: "Activées ou non pour tout le projet (réglage « Ombres » des Réglages du projet, modifiable à tout moment via le bouton engrenage de la barre du haut). Les lumières directionnelles et spot projettent des ombres si ce réglage est actif ; les lumières ponctuelles (point) n'en projettent jamais, pour des raisons de performance de rendu. Chaque objet 3D a par ailleurs son propre interrupteur « Ombre portée » dans le panneau Propriétés." },
      { h: 'Reflets (environnement)', p: "Aucun, Ville (reflets d'un environnement urbain) ou HDRI Studio (reflets d'un studio photo) — modifiable à tout moment via les Réglages du projet. N'affecte que l'aspect des matériaux métalliques/lisses (visible surtout à forte metalness et faible roughness) ; le fond visible de la scène se règle séparément (Réglages du projet et onglet Scène)." },
      { h: 'Grille de repère', p: "Une grille au sol n'apparaît qu'en mode édition, pour vous aider à vous repérer — elle disparaît automatiquement en mode Visualisateur et dans les vidéos exportées." },
    ],
  },
  animation: {
    title: 'Animations & Keyframes',
    body: [
      { p: "Le moteur d'animation interpole les propriétés d'un calque entre ses keyframes, sur la scène courante." },
      { h: 'Propriétés animables', p: "Formes : position X/Y, largeur, hauteur, rotation, opacité, couleur de remplissage. Texte : position X/Y, taille de police, rotation, opacité, couleur. Objets 3D : position, rotation, échelle, couleur, opacité. Lumières : position, intensité, couleur. Caméra 3D : position, champ de vision (FOV). Les images n'ont pas encore de propriétés animables dédiées dans le panneau Anim." },
      { h: 'Ajouter un keyframe', p: "Dans le panneau Anim, dépliez la propriété voulue et cliquez « + » : un keyframe est créé à l'instant courant du playhead, avec la valeur actuelle du calque. Un keyframe existant exactement au même instant est mis à jour plutôt que dupliqué." },
      { h: 'Modifier un keyframe', p: "Le temps se change en le faisant glisser dans la timeline. Pour changer sa valeur : placez le playhead exactement sur son instant, modifiez la propriété dans le panneau Propriétés, puis cliquez de nouveau « + » sur cette propriété dans le panneau Anim pour ce même instant — cela remplace le keyframe existant. Chaque keyframe a son propre easing, modifiable via le menu déroulant à côté de lui." },
      { h: 'Types d\'easing', p: "Linéaire, Ease In, Ease Out, Ease InOut, Spring (rebond amorti). L'easing d'un keyframe s'applique à l'interpolation qui mène jusqu'à lui depuis le keyframe précédent." },
      { h: 'Supprimer', p: "L'icône corbeille à côté d'un keyframe le supprime définitivement." },
    ],
  },
  transitions: {
    title: 'Transitions',
    body: [
      { p: "Chaque scène peut avoir une transition vers la scène suivante, réglée dans l'onglet Trans. du panneau de droite (pas de transition pour la dernière scène du projet, puisqu'il n'y a pas de scène après elle)." },
      { h: 'Types', p: "Aucune, Fondu, Glissement, Zoom, Dissolve, Wipe." },
      { h: 'Réglages', p: "Durée en secondes et type d'easing (Linéaire, Ease In, Ease Out, Ease InOut, Spring), une fois un type de transition (autre que Aucune) sélectionné." },
    ],
  },
  export: {
    title: 'Export vidéo',
    body: [
      { p: "Le bouton Exporter (barre du haut) ouvre la modale d'export, où tout se choisit sur un seul écran avant de lancer le rendu." },
      { h: 'Formats', p: "MP4 (H.264, compatibilité maximale, recommandé par défaut), WebM (VP9, fichier plus léger pour le web), GIF animé (extraits courts/loop, sans son), MOV (usage montage pro)." },
      { h: 'Définition', p: "480p, 720p, 1080p Full HD, 1440p 2K, 2160p 4K — la largeur est calculée automatiquement à partir du ratio du projet." },
      { h: 'FPS et qualité', p: "24, 30 ou 60 images/seconde. Trois niveaux de qualité (Standard, Haute, Maximale), correspondant à des débits vidéo croissants (4, 8, 16 Mbps), qui influent sur la taille de fichier estimée affichée à l'écran." },
      { h: 'Rendu', p: "L'export se fait entièrement dans le navigateur : chaque image de la vidéo est générée en pilotant la scène et l'instant du projet, capturée depuis le canvas, puis encodée à la volée. Une barre de progression s'affiche pendant le rendu, avec un bouton Annuler. Une fois terminé, le fichier est téléchargé automatiquement et une miniature du projet est enregistrée pour l'affichage dans Mes projets." },
      { h: 'Rendu long', p: "Un avertissement s'affiche pour les exports en résolution supérieure à 1080p ou pour tout projet 3D : prévoyez un temps de rendu plus long et une charge mémoire plus importante, en particulier avec plusieurs scènes ou une durée totale élevée." },
    ],
  },
  projects: {
    title: 'Gérer vos projets',
    body: [
      { p: "Tous vos projets vivent dans le navigateur (IndexedDB), sur cet appareil — il n'y a pas de compte ni de synchronisation en ligne." },
      { h: 'Enregistrement automatique', p: "Dans l'éditeur, toute modification déclenche un enregistrement automatique environ 2 secondes après la dernière action (visible via l'indicateur en haut à droite : Non enregistré → Enregistrement... → Enregistré à HH:MM)." },
      { h: 'Annuler / Rétablir', p: "Ctrl+Z / Ctrl+Y (ou bouton dédié) permettent de revenir en arrière ou en avant, sur un historique des 50 dernières actions du projet ouvert." },
      { h: 'Page Mes projets', p: "Accessible uniquement sur desktop. Affiche tous vos projets en grille, avec recherche par nom et tri (date, nom, mode). Chaque carte permet, via le menu ⋮ : Ouvrir, Renommer, Dupliquer, Exporter en JSON, Supprimer (avec confirmation)." },
      { h: 'Export / Import JSON', p: "Exporter un projet télécharge un fichier .json contenant l'intégralité du projet (scènes, calques, keyframes, réglages). Importer ce même type de fichier (bouton « Importer ») recrée un nouveau projet dans votre bibliothèque à partir de son contenu — c'est aussi le moyen de transférer un projet vers un autre appareil/navigateur." },
      { h: 'Miniatures', p: "La vignette affichée sur chaque carte de projet est capturée automatiquement à la fin d'un export vidéo réussi ; un projet jamais exporté affiche une icône générique à la place." },
      { h: 'Paramètres et réinitialisation', p: "L'avatar en haut à droite (sur Documentation et Mes projets) ouvre la page Paramètres : bascule du thème, nombre de projets stockés, et un bouton « Réinitialiser » en zone dangereuse qui supprime définitivement tous les projets de ce navigateur (après confirmation)." },
    ],
  },
  shortcuts: {
    title: 'Raccourcis clavier',
    body: [
      { p: "Les raccourcis clavier globaux ci-dessous fonctionnent dans l'éditeur, tant que le focus n'est pas dans un champ de texte." },
      { h: 'Général', p: "Espace = lecture / pause. Suppr ou Retour arrière = supprimer le calque sélectionné. Ctrl+Z = annuler. Ctrl+Maj+Z ou Ctrl+Y = rétablir. Ctrl+D = dupliquer le calque sélectionné." },
      { h: 'Mode 2D', p: "R = ajouter un rectangle. T = ajouter un texte. Les autres éléments (ellipse, ligne, polygone, étoile, image) s'ajoutent en cliquant leur icône dans la barre d'outils gauche." },
      { h: 'Mode 3D', p: "V = outil Sélection. G = outil Déplacer. R = outil Tourner. S = outil Échelle. Échap = revenir à la sélection. L'ajout d'objets (primitives, texte 3D, lumière, caméra, import de modèle) se fait en cliquant les icônes de la barre d'outils gauche." },
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      { h: 'Mes données sont-elles sauvegardées ?', p: "Oui, tout est enregistré localement dans le navigateur via IndexedDB, avec un enregistrement automatique pendant l'édition. Ces données restent sur cet appareil et ce navigateur — videz le cache du site ou changez de navigateur/appareil et vos projets ne seront plus là, sauf à les avoir exportés en JSON au préalable." },
      { h: 'Comment transférer un projet vers un autre ordinateur ?', p: "Exportez-le en JSON depuis la page Mes projets (menu ⋮ → Exporter JSON), puis importez ce fichier sur l'autre appareil via le bouton Importer." },
      { h: 'Puis-je mélanger 2D et 3D dans un même projet ?', p: "Non, le mode est figé à la création du projet. Dupliquez un projet 2D existant si vous voulez repartir sur les mêmes bases en 3D — le contenu du projet dupliqué reste dans son mode d'origine, seule sa structure sert de point de départ visuel/organisationnel." },
      { h: "L'app fonctionne-t-elle hors ligne ?", p: "Oui, une fois chargée une première fois, c'est une PWA offline-first : l'interface, l'édition et l'export vidéo fonctionnent sans connexion réseau." },
      { h: 'Pourquoi je ne peux pas ouvrir Mes projets ou l\'éditeur sur mon téléphone ?', p: "La gestion de projets et l'éditeur demandent un écran de bureau (grilles denses, menus contextuels, panneaux multiples) — un message s'affiche à la place sur les petits écrans. Seule la page d'accueil est pensée pour le mobile." },
      { h: 'Le thème clair est-il complet ?', p: "Oui, l'ensemble de l'interface (landing page, dashboard, éditeur, documentation) s'adapte au thème clair ou sombre, basculable via l'icône lune/soleil. Le choix est mémorisé sur cet appareil (le canvas/viewport reste volontairement sombre dans les deux thèmes, comme dans la plupart des logiciels de création)." },
    ],
  },
};
