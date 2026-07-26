<div align="center">
  <img src="public/logo-sm.png" alt="MyMotionStudio" width="140" />

  <h1>MyMotionStudio</h1>

  <p><strong>A free, open-source, offline-first 2D &amp; 3D motion design editor that runs entirely in your browser.</strong></p>

  <p>
    <a href="https://github.com/rodolphe37/my-motion-studio/actions/workflows/ci.yml"><img src="https://github.com/rodolphe37/my-motion-studio/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg" alt="Contributor Covenant"></a>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=061a23" alt="React 19">
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
  </p>

  <p>
    <a href="#-english">🇬🇧 English</a> ·
    <a href="#-français">🇫🇷 Français</a>
  </p>
</div>

---

## 🇬🇧 English

> **Note:** the application's UI and in-app documentation are available in **French and English**, with automatic detection from your browser's language and a manual switcher (see [Internationalization](CONTRIBUTING.md#internationalization)). This README is bilingual — the sections below are in English; jump to the [French version](#-français) further down.

### Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Data & privacy](#data--privacy)
- [Testing](#testing)
- [Browser support](#browser-support)
- [Deployment](#deployment)
- [Roadmap & known limitations](#roadmap--known-limitations)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Acknowledgments](#acknowledgments)

### Overview

**MyMotionStudio** is a WYSIWYG motion design editor for the web: create animated 2D scenes (shapes, text, images) or fully 3D scenes (primitives, imported glTF/OBJ models, PBR materials, lights, cameras), animate them with a keyframe/easing engine, chain multiple scenes with transitions, and export the result as a video (MP4/WebM/GIF/MOV) — all without installing anything or creating an account.

It's built as an **offline-first Progressive Web App**: install it once, and it keeps working — editing and exporting video — with no network connection. All project data lives locally in the browser (IndexedDB); there is no backend, no server-side rendering, and no telemetry.

This project started as a personal/portfolio build and is now open-sourced under the MIT license — see [Contributing](#contributing) if you'd like to help improve it.

### Screenshots

Frames captured from the app's own exported demo projects. On the landing page's example gallery, clicking a thumbnail plays the actual project live through the app's own renderer:

| 2D scene | 3D scene |
|---|---|
| ![2D demo](public/demos/2d-thumb.jpg) | ![3D demo](public/demos/3d-thumb.jpg) |

The two source projects behind these are available as `public/demos/*.json` and can be imported straight into the app (Projects page → **Importer**) to explore them yourself.

### Features

**2D mode** (Konva-based canvas renderer)
- Vector shapes — rectangle, ellipse, line, polygon (configurable side count), star (configurable branch count) — with fill, stroke, corner radius
- Text layers — font family, weight, size, color, alignment
- Image layers — drag in a file, auto-resized and embedded (base64) into the project
- Per-scene backgrounds — solid color, linear gradient (two colors + angle), or radial color spots on a base color, with a project-level default

**3D mode** (Three.js / react-three-fiber renderer)
- Primitives — box, sphere, cone, cylinder, plane, torus
- Model import — glTF, GLB, and OBJ, embedded into the project
- Extruded 3D text with automatic bevel (accented-character font included)
- PBR materials — color, metalness, roughness, opacity, per-object cast-shadow toggle
- Camera — perspective or orthographic, position/rotation/FOV/near/far, keyframable, free orbit navigation while editing
- Lights, shadows, and the same solid/gradient/spots background system as 2D, rendered via a generated texture
- A separate "reflections" preset (none / city / studio) affecting metallic materials, independent from the background

**Animation & scenes**
- Keyframe-based animation engine with linear, ease-in/out/in-out, and spring easing
- Multi-scene projects — reorder scenes by drag, rename inline, per-scene duration
- Transitions between scenes — fade, slide, zoom, dissolve, wipe — with duration and easing

**Project & export**
- Project settings (format/aspect ratio, FPS, background, environment, shadows, default scene duration) editable at any time, not just at creation
- Client-side export to MP4, WebM, or MOV (MediaRecorder-based, with quality/bitrate presets) and animated GIF (via [gifenc](https://github.com/mattdesl/gifenc), frame-by-frame quantization/encoding), with resolution presets up to 4K, progress reporting, and cancellation
- Auto-generated project thumbnail after a successful export
- JSON export/import for backup, sharing, or moving a project to another device
- Undo/redo history (50 steps) and debounced autosave to the browser's local database
- Installable PWA with full offline support once loaded once
- Light and dark theme across the entire app

### Tech stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vitejs.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Routing | [React Router](https://reactrouter.com/) |
| State management | [Zustand](https://github.com/pmndrs/zustand) |
| 2D rendering | [Konva](https://konvajs.org/) / [react-konva](https://github.com/konvajs/react-konva) |
| 3D rendering | [Three.js](https://threejs.org/) / [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) / [drei](https://github.com/pmndrs/drei) |
| Local persistence | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [Dexie.js](https://dexie.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Video export | [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) |
| GIF export | [gifenc](https://github.com/mattdesl/gifenc) |
| Internationalization | [react-i18next](https://react.i18next.com/) / [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) |

### Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) `20.19+` or `22.12+` (required by Vite 8), and npm.

```bash
# Clone the repository
git clone https://github.com/rodolphe37/my-motion-studio.git
cd my-motion-studio

# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev
```

> **npm only.** `package-lock.json` is the single source of truth for dependency versions — it's what CI installs from (`npm ci`) and what the commands throughout this README assume. `yarn.lock` isn't used or committed.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module reload |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally, to sanity-check it before deploying |
| `npm run lint` | Run ESLint over the codebase |
| `npm run typecheck` | Run the TypeScript compiler in `--noEmit` mode |
| `npm run test` | Run the test suite once ([Vitest](https://vitest.dev/)) |
| `npm run test:watch` | Run the test suite in watch mode |
| `npm run full-test` | Run `typecheck`, `lint`, and `test` in sequence, stopping at the first failure — the full pre-commit/pre-PR gate |

### Project structure

```
src/
├── App.tsx                          # Router setup (all routes)
├── main.tsx                         # Entry point, mounts <App/>
├── index.css                        # Tailwind layers, design tokens, shared component classes
├── components/
│   ├── Header.tsx                   # Shared nav header (Docs / Projects / Settings pages)
│   ├── DemoPlayer.tsx               # Landing-page autoplay preview player
│   ├── NewProjectModal.tsx          # 4-step "new project" creation wizard
│   └── editor/
│       ├── EditorToolbar.tsx        # Top bar: scene tabs, playback, undo/redo, export
│       ├── LeftToolbar.tsx          # Tool palette (2D shapes, or 3D primitives/lights/camera)
│       ├── Canvas2D.tsx             # Konva-based 2D renderer + scene background
│       ├── Canvas3D.tsx             # react-three-fiber 3D renderer, camera, lights, gizmo
│       ├── RightPanels.tsx          # Properties / Layers / Animation / Transitions / Scene panels
│       ├── Timeline.tsx             # Keyframe timeline + playhead
│       ├── ProjectSettingsModal.tsx # Post-creation project settings
│       ├── ExportModal.tsx          # Video export pipeline
│       └── PreviewMode.tsx          # Fullscreen scene-by-scene preview
├── pages/
│   ├── LandingPage.tsx              # Public marketing page ("/")
│   ├── DocsPage.tsx                 # In-app documentation ("/docs")
│   ├── ProjectsPage.tsx             # Project dashboard ("/projects")
│   ├── SettingsPage.tsx             # App settings — theme, storage, full reset ("/settings")
│   └── EditorPage.tsx               # Editor shell ("/editor/:projectId")
└── lib/
    ├── types.ts                     # Core data model (Project, Scene, Layer, …)
    ├── store.ts                     # Zustand store: state + undo/redo + all mutations
    ├── factories.ts                 # Default-value constructors for new layers/projects
    ├── animation.ts                 # Keyframe interpolation / easing engine
    ├── db.ts                        # Dexie (IndexedDB) wrapper — CRUD for projects
    ├── download.ts                  # Blob/JSON download helpers
    ├── useAutoSave.ts               # Debounced autosave hook
    ├── useKeyboardShortcuts.ts      # Global keyboard shortcut handling
    └── useTheme.ts                  # Light/dark theme persistence
```

### Data & privacy

- **Everything is local.** Projects are stored in the browser's IndexedDB, on the device you're using — there is no backend, no account, no server round-trip for your project data.
- **No telemetry.** The app doesn't ship any analytics or tracking.
- **No cross-device sync.** Since storage is per-browser/per-device, use **Export JSON** / **Import** (Projects page) to move a project to another machine or back it up outside the browser.
- Clearing your browser's site data for this app (or using a different browser/profile) will remove your local projects — export anything you want to keep.

### Testing

The project uses [Vitest](https://vitest.dev/) (+ [Testing Library](https://testing-library.com/) and [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB) for storage tests):

```bash
npm run test         # run once
npm run test:watch   # watch mode
npm run full-test    # typecheck + lint + test, in sequence — run this before opening a PR
```

Coverage today focuses on the framework-agnostic logic under `src/lib/` — the animation/easing engine, the Zustand store's mutations and undo/redo history, the IndexedDB persistence layer, and the autosave hook (including a regression test for a real race-condition bug that used to silently drop every save — see `useAutoSave.test.ts`).

Every push and pull request against `main` runs the full `typecheck` → `lint` → `test` → `build` sequence via GitHub Actions (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml), badge at the top of this README), on both the minimum supported Node 22 and Node 24.

Component tests for `Canvas2D`/`Canvas3D` aren't included: both need a real canvas/WebGL context that jsdom doesn't provide, and would require heavy mocking to be worth much. Contributions that add meaningful coverage there are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Browser support

- A recent evergreen browser (Chrome, Edge, Firefox, Safari) is expected. **3D mode requires WebGL2.**
- The **project dashboard and the editor are desktop-only** (dense grids, drag targets, and multi-panel layouts aren't adapted to small touch screens) — a dedicated message is shown on narrow viewports. The landing page itself is fully responsive.
- PWA install support varies by browser; it's most complete in Chromium-based browsers.

### Deployment

The app is a static site — `npm run build` outputs a self-contained `dist/` folder deployable to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.). The PWA service worker (via `vite-plugin-pwa`) is generated as part of the build.

### Roadmap & known limitations

A few things that are honestly still missing or rough, in no particular order:

- Test coverage is limited to `src/lib/` (store, animation, persistence, autosave) — no component tests for `Canvas2D`/`Canvas3D` yet.
- The 3D toolbar currently only adds **directional** lights; point/spot/ambient exist in the data model and are fully editable once present, but aren't reachable as a distinct "add" action yet.
- Layer grouping is defined in the data model (`GroupLayer`) but has no creation UI yet — nothing produces a group today.
- No cloud sync or multi-user collaboration — see [Data & privacy](#data--privacy).
- During interactive 3D editing, the on-screen viewport's aspect ratio can differ slightly from the project's target export resolution; the final exported video always renders at the configured resolution regardless.

If you'd like to tackle any of these, please see [Contributing](#contributing) — opening an issue first to discuss approach is appreciated for anything non-trivial.

### Contributing

Contributions are very welcome — bug reports, fixes, features, docs, or design/UX feedback. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for the development setup, coding conventions, commit style, and pull request process before opening one.

### Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you're expected to uphold it.

### License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for the full text.

### Acknowledgments

This project wouldn't exist without these open-source projects:
[React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), [Tailwind CSS](https://tailwindcss.com/), [Zustand](https://github.com/pmndrs/zustand), [Dexie.js](https://dexie.org/), [Konva](https://konvajs.org/) / [react-konva](https://github.com/konvajs/react-konva), [Three.js](https://threejs.org/), [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) / [drei](https://github.com/pmndrs/drei), [gifenc](https://github.com/mattdesl/gifenc), and [lucide-react](https://lucide.dev/).

---

## 🇫🇷 Français

> **Remarque :** l'interface de l'application et sa documentation intégrée sont disponibles en **français et en anglais**, avec détection automatique de la langue du navigateur et un sélecteur manuel (voir [Internationalization](CONTRIBUTING.md#internationalization)). Ce README, lui, est bilingue — cette section reprend en français l'essentiel de la section anglaise ci-dessus ; pour les commandes shell et l'arborescence du projet (identiques quelle que soit la langue), on renvoie directement aux blocs déjà donnés plus haut plutôt que de les dupliquer.

### Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Données & confidentialité](#données--confidentialité)
- [Tests](#tests)
- [Navigateurs supportés](#navigateurs-supportés)
- [Déploiement](#déploiement)
- [Feuille de route & limites connues](#feuille-de-route--limites-connues)
- [Contribuer](#contribuer)
- [Code de conduite](#code-de-conduite)
- [Licence](#licence)

### Présentation

**MyMotionStudio** est un éditeur de motion design WYSIWYG qui fonctionne entièrement dans le navigateur : créez des scènes 2D animées (formes, texte, images) ou des scènes 3D complètes (primitives, modèles glTF/OBJ importés, matériaux PBR, lumières, caméras), animez-les avec un moteur de keyframes/easing, enchaînez plusieurs scènes avec des transitions, puis exportez le résultat en vidéo (MP4/WebM/GIF/MOV) — sans rien installer et sans créer de compte.

C'est une **Progressive Web App offline-first** : installez-la une fois, et elle continue de fonctionner — édition et export vidéo compris — sans connexion réseau. Toutes les données de projet vivent localement dans le navigateur (IndexedDB) ; il n'y a ni backend, ni rendu côté serveur, ni télémétrie.

Ce projet a démarré comme réalisation personnelle/portfolio et est désormais publié en open source sous licence MIT — voir [Contribuer](#contribuer) si vous souhaitez aider à l'améliorer.

### Fonctionnalités

**Mode 2D** (rendu via Konva)
- Formes vectorielles — rectangle, ellipse, ligne, polygone (nombre de côtés réglable), étoile (nombre de branches réglable) — avec remplissage, contour, rayon des coins
- Calques texte — police, graisse, taille, couleur, alignement
- Calques image — import par fichier, redimensionné automatiquement et intégré (base64) au projet
- Fond par scène — couleur unie, dégradé linéaire (deux couleurs + angle), ou spots de couleur radiaux sur une couleur de base, avec une valeur par défaut au niveau du projet

**Mode 3D** (rendu via Three.js / react-three-fiber)
- Primitives — cube, sphère, cône, cylindre, plan, tore
- Import de modèles — glTF, GLB et OBJ, intégrés au projet
- Texte 3D extrudé avec biseau automatique (police couvrant les caractères accentués)
- Matériaux PBR — couleur, metalness, roughness, opacité, ombre portée réglable par objet
- Caméra — perspective ou orthographique, position/rotation/FOV/near/far, animable par keyframes, navigation libre à l'orbite pendant l'édition
- Lumières, ombres, et le même système de fond uni/dégradé/spots qu'en 2D, rendu via une texture générée
- Un préréglage de « reflets » séparé (aucun / ville / studio) affectant les matériaux métalliques, indépendant du fond

**Animation & scènes**
- Moteur d'animation par keyframes avec easing linéaire, ease-in/out/in-out et spring
- Projets multi-scènes — réordonnables par glisser-déposer, renommables directement, durée par scène
- Transitions entre scènes — fondu, glissement, zoom, dissolve, wipe — avec durée et easing

**Projet & export**
- Réglages du projet (format/ratio, FPS, fond, environnement, ombres, durée par défaut d'une scène) modifiables à tout moment, pas seulement à la création
- Export côté client en MP4, WebM ou MOV (via MediaRecorder, avec préréglages de qualité/débit) et en GIF animé (via [gifenc](https://github.com/mattdesl/gifenc), quantification/encodage image par image), avec préréglages de résolution jusqu'à la 4K, suivi de progression et annulation
- Miniature de projet générée automatiquement après un export réussi
- Export/import JSON pour sauvegarder, partager ou transférer un projet vers un autre appareil
- Historique annuler/rétablir (50 étapes) et enregistrement automatique différé vers la base locale du navigateur
- PWA installable, fonctionnant intégralement hors ligne une fois chargée
- Thème clair et sombre sur l'ensemble de l'application

### Stack technique

Voir le tableau de la section anglaise ci-dessus ([Tech stack](#tech-stack)) — les technologies utilisées sont les mêmes quel que soit le contexte de lecture : React 19 + TypeScript, Vite, React Router, Zustand, Konva, Three.js / react-three-fiber / drei, Dexie.js (IndexedDB), Tailwind CSS, lucide-react, l'API MediaRecorder pour l'export vidéo, et [gifenc](https://github.com/mattdesl/gifenc) pour l'export GIF.

### Démarrage rapide

**Prérequis :** [Node.js](https://nodejs.org/) `20.19+` ou `22.12+` (exigé par Vite 8), et npm.

Les commandes sont identiques à celles de la section anglaise ([Getting started](#getting-started)) :

```bash
git clone https://github.com/rodolphe37/my-motion-studio.git
cd my-motion-studio
npm install
npm run dev
```

L'app tourne alors sur `http://localhost:5173`. Voir la table des [scripts disponibles](#available-scripts) plus haut pour `build`, `preview`, `lint` et `typecheck`.

### Données & confidentialité

- **Tout est local.** Les projets sont stockés dans l'IndexedDB du navigateur, sur l'appareil utilisé — il n'y a ni backend, ni compte, ni aller-retour serveur pour vos données de projet.
- **Aucune télémétrie.** L'application n'embarque aucun outil d'analyse ou de tracking.
- **Pas de synchronisation multi-appareil.** Le stockage étant local au navigateur/appareil, utilisez **Exporter JSON** / **Importer** (page Mes projets) pour transférer un projet ou le sauvegarder ailleurs.
- Vider les données de site de ce navigateur (ou changer de navigateur/profil) supprime vos projets locaux — pensez à exporter ce que vous voulez conserver.

### Tests

Le projet utilise [Vitest](https://vitest.dev/) (+ Testing Library et fake-indexeddb pour les tests de persistance) :

```bash
npm run test         # une seule passe
npm run test:watch   # mode watch
npm run full-test    # typecheck + lint + test, dans l'ordre — à lancer avant d'ouvrir une PR
```

La couverture se concentre aujourd'hui sur la logique indépendante du rendu, dans `src/lib/` : moteur d'animation/easing, mutations du store Zustand et historique annuler/rétablir, couche de persistance IndexedDB, et le hook d'enregistrement automatique (avec un test de non-régression pour un vrai bug de *race condition* qui faisait échouer silencieusement chaque sauvegarde — voir `useAutoSave.test.ts`).

Chaque push et pull request vers `main` déclenche l'enchaînement complet `typecheck` → `lint` → `test` → `build` via GitHub Actions (voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml), badge en haut de ce README), sur Node 22 et Node 24 (les versions minimales supportées).

Il n'y a pas de tests de composants pour `Canvas2D`/`Canvas3D` : les deux ont besoin d'un vrai contexte canvas/WebGL que jsdom ne fournit pas, et demanderaient un *mocking* lourd pour être vraiment utiles. Les contributions qui y ajoutent une couverture pertinente sont bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md).

### Navigateurs supportés

- Un navigateur récent à jour (Chrome, Edge, Firefox, Safari) est attendu. **Le mode 3D nécessite WebGL2.**
- **La page Mes projets et l'éditeur sont réservés au bureau** (grilles denses, glisser-déposer, panneaux multiples non adaptés au tactile/petit écran) — un message dédié s'affiche sur les écrans étroits. La page d'accueil, elle, est entièrement responsive.
- Le support d'installation PWA varie selon le navigateur ; il est le plus complet sur les navigateurs à base Chromium.

### Déploiement

L'application est un site statique — `npm run build` génère un dossier `dist/` autonome, déployable sur n'importe quel hébergeur statique (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.). Le service worker PWA (via `vite-plugin-pwa`) est généré automatiquement lors du build.

### Feuille de route & limites connues

Quelques points honnêtement encore manquants ou perfectibles, sans ordre particulier :

- Couverture de tests limitée à `src/lib/` (store, animation, persistance, autosave) — pas encore de tests de composants pour `Canvas2D`/`Canvas3D`.
- La barre d'outils 3D n'ajoute aujourd'hui que des lumières **directionnelles** ; les types point/spot/ambiante existent dans le modèle de données et sont pleinement éditables une fois présents, mais ne sont pas encore accessibles comme action d'ajout dédiée.
- Le regroupement de calques existe dans le modèle de données (`GroupLayer`) mais n'a pas encore d'interface de création — rien ne produit de groupe aujourd'hui.
- Pas de synchronisation cloud ni de collaboration multi-utilisateur — voir [Données & confidentialité](#données--confidentialité).
- Pendant l'édition 3D interactive, le ratio d'aspect du viewport à l'écran peut différer légèrement de la résolution cible d'export du projet ; la vidéo exportée, elle, est toujours rendue à la résolution configurée.

Si vous souhaitez vous attaquer à l'un de ces points, voir [Contribuer](#contribuer) — ouvrir une issue au préalable est apprécié pour tout ce qui n'est pas trivial.

### Contribuer

Les contributions sont les bienvenues — rapports de bugs, corrections, fonctionnalités, documentation, ou retours design/UX. Merci de lire **[CONTRIBUTING.md](CONTRIBUTING.md)** (en anglais) pour la configuration de développement, les conventions de code, le style de commit et le processus de pull request avant d'en ouvrir une.

### Code de conduite

Ce projet suit le [Contributor Covenant](CODE_OF_CONDUCT.md) (en anglais). En y participant, vous êtes tenu de le respecter.

### Licence

Distribué sous **licence MIT**. Voir [`LICENSE`](LICENSE) pour le texte complet.
