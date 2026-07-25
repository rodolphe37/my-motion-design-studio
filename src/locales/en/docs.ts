import {
  Search, BookOpen, Layers, Box, Download, Camera, Palette, Film, Keyboard,
  HelpCircle, ChevronRight, Settings, Diamond, LayoutPanelLeft, FolderOpen,
} from 'lucide-react';

export { Search, ChevronRight };

export const SECTIONS = [
  { id: 'start', label: 'Getting started', icon: BookOpen },
  { id: 'config', label: 'Project configuration', icon: Settings },
  { id: 'modes', label: '2D mode vs 3D mode', icon: Layers },
  { id: 'interface', label: 'Editor interface', icon: LayoutPanelLeft },
  { id: 'scenes', label: 'Scenes & Timeline', icon: Film },
  { id: 'tools2d', label: 'Drawing tools (2D)', icon: Palette },
  { id: 'objects3d', label: 'Objects & materials (3D)', icon: Box },
  { id: 'camera3d', label: 'Camera and lighting (3D)', icon: Camera },
  { id: 'animation', label: 'Animations & Keyframes', icon: Diamond },
  { id: 'transitions', label: 'Transitions', icon: Layers },
  { id: 'export', label: 'Video export', icon: Download },
  { id: 'projects', label: 'Manage your projects', icon: FolderOpen },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export const CONTENT: Record<string, { title: string; body: { h?: string; p: string }[] }> = {
  start: {
    title: 'Getting started',
    body: [
      { p: "MyMotionStudio is a 2D and 3D motion design editor that runs entirely in your browser. No installation is required — the app is an installable PWA (Progressive Web App) and works offline once it has been loaded a first time." },
      { h: 'Create a project', p: 'Go to the "My projects" page, click "New project", then follow the 4 setup steps: name, 2D or 3D mode, image format, basic settings. The project is created and saved locally as soon as the last step is completed, and you\'re taken directly into the editor.' },
      { h: 'The editor', p: 'The editor is made up of a top toolbar (scenes, playback, export...), a left toolbar (adding elements), a central canvas, right-side panels (Properties, Layers, Anim, Trans.), and a timeline at the bottom.' },
      { h: 'Installing the app', p: 'From a compatible browser (Chrome, Edge...), an install icon appears in the address bar. Once installed, the app launches like a native application and remains usable without a network connection.' },
      { h: 'Desktop / mobile access', p: 'The home page is usable on mobile (burger navigation menu under 640px wide). Project management ("My projects") and the editor itself, however, require a desktop screen — a dedicated message is shown if the screen is too narrow.' },
    ],
  },
  config: {
    title: 'Project configuration',
    body: [
      { p: 'Creating a project takes 4 steps via the "New project" modal, accessible from the My projects page.' },
      { h: '1. Name', p: 'The project name (renameable later directly in the editor by clicking the name at the top left, or from the My projects page via the ⋮ menu → Rename).' },
      { h: '2. Mode: 2D or 3D', p: "This choice is final for the project — it can't be changed after creation. To switch to the other mode, duplicate the project and then recreate a new one in the other mode." },
      { h: '3. Format', p: 'A dimension preset among 16:9 (1920×1080), 9:16 (1080×1920), 1:1 (1080×1080), 4:5 (1080×1350), 4:3 (1440×1080), 3:4 (1080×1440), 16:10 (1920×1200), 21:9 (2560×1080), or a custom format (width/height in pixels, with optional ratio lock).' },
      { h: '4. Settings', p: 'Working FPS (24/30/60), and depending on the mode: default background color (2D) or environment + shadows (3D). Default scene duration (in seconds) in both cases.' },
      { h: 'Changing these settings after creation', p: 'The format (dimensions/preset), FPS, background color, environment, shadows, and default scene duration remain editable after creation, from the gear-shaped button next to the project name in the editor\'s top bar ("Project settings"). Only the mode (2D/3D) is permanently locked. The export format (resolution, quality, output FPS) is chosen independently on each export, in the Export modal.' },
    ],
  },
  modes: {
    title: '2D mode vs 3D mode',
    body: [
      { p: "MyMotionStudio offers two distinct modes, and a project can't mix 2D and 3D." },
      { h: '2D mode', p: 'Flat scene with vector shapes (rectangle, ellipse, line, polygon, star), text, and images. Rendered via Konva.js on an HTML5 canvas. Light and fast, ideal for social media and classic motion graphics.' },
      { h: '3D mode', p: 'Volumetric scene with geometric primitives, extruded 3D text, adjustable camera and lighting. Rendered via Three.js / React Three Fiber (real-time WebGL), with shadows and PBR materials (metalness/roughness).' },
    ],
  },
  interface: {
    title: 'Editor interface',
    body: [
      { p: 'The editor is organized into 4 zones: the top toolbar, the left toolbar, the central canvas, the right-side panels, and the timeline at the bottom.' },
      { h: 'Top bar', p: 'Back to My projects, project name (clickable to rename), 2D/3D badge, gear button (Project settings), the project\'s scene tabs (click to navigate, "+" to add one), save indicator (Saved / Unsaved / Saving...), play/pause, stop, undo/redo, canvas zoom (10% to 400%, "fit" button to return to 100%), Viewer button (fullscreen preview), light/dark theme toggle, and Export button.' },
      { h: 'Left bar', p: 'In 2D: selection and creation tools (rectangle, ellipse, line, polygon, star, text, image). In 3D: select/move/rotate/scale tools (gizmo in the viewport — see the Objects & materials section), primitives (cube, sphere, cone, cylinder, plane, torus), model import (glTF/GLB/OBJ), 3D text, light, and camera.' },
      { h: 'Right-side panels', p: 'Five tabs: Properties (edits the selected element), Layers (list of elements in the current scene), Anim (keyframes of the selected element), Trans. (transition to the next scene), Scene (duration and background of the current scene).' },
      { h: 'Timeline', p: 'At the bottom of the editor: layer list on the left, time track on the right with a ruler in seconds, a playback cursor (playhead) that can be dragged by clicking/dragging on the track, and a diamond per keyframe. Two +/- buttons to zoom the timeline horizontally.' },
      { h: 'Viewer (Preview)', p: 'Opens a fullscreen mode that replays the project scene by scene, with previous/next scene buttons and play/pause — useful for checking the render without the editing tools on screen.' },
    ],
  },
  scenes: {
    title: 'Scenes & Timeline',
    body: [
      { p: 'A project is made up of one or more scenes that play in the order they were created. Each scene has its own duration, its own layers, and a transition to the next scene.' },
      { h: 'Adding and navigating', p: 'The "+" button next to the scene tabs (top bar) adds a new empty scene, with the default duration set when the project was created. Click a tab to switch to it — the Layers panel, Anim panel, and timeline then reflect that scene.' },
      { h: 'Rename, reorder, duration, delete', p: 'Double-click a scene tab to rename it, drag it to reorder scenes, and use the "×" that appears on hover to delete it (at least one scene must always remain). The current scene\'s duration is set in the Scene tab of the right-side panel.' },
      { h: 'Timeline and keyframes', p: "Each layer's track displays its keyframes as pink diamonds. Click and drag a diamond horizontally to change its time. Click anywhere on the track to move the playhead to that exact time." },
    ],
  },
  tools2d: {
    title: 'Drawing tools (2D)',
    body: [
      { p: 'The left toolbar in 2D mode offers: Select, Rectangle, Ellipse, Line, Polygon, Star, Text, Image.' },
      { h: 'Adding an element', p: 'Clicking a shape tool (Rectangle, Ellipse, Line, Polygon, Star) inserts it immediately at the center of the scene with a default size (200×200 px) — there\'s no click-and-drag drawing. Reposition it afterward by dragging it directly on the canvas, and fine-tune its size via the Width/Height fields in the Properties panel.' },
      { h: 'Text', p: 'The Text tool adds a text layer editable in the Properties panel: content, size, font (Inter, Georgia, JetBrains Mono), weight (normal/semi-bold/bold), color, rotation.' },
      { h: 'Image', p: "The Image tool opens your device's file picker. The image is embedded directly into the project (base64-encoded), automatically resized if needed so its longest side doesn't exceed 500 px, then added as a movable, resizable layer just like shapes." },
      { h: 'Common properties', p: 'Depending on the layer type: X/Y position, width/height, rotation, opacity, fill color, stroke color and width, corner radius (rectangle), number of sides (polygon) or branches (star), text alignment (left/center/right).' },
      { h: 'Scene background', p: 'Each scene (2D or 3D) can define its own background in the "Scene" tab of the right-side panel: solid, gradient (two colors + angle), or color spots on a solid background (add/remove spots, adjustable position, radius, opacity). Without a specific setting, the scene uses the background color defined in Project settings. In 3D, rendering a gradient/spots background is slightly more costly than a solid one (a texture is generated), with no noticeable impact on typical scenes.' },
    ],
  },
  objects3d: {
    title: 'Objects & materials (3D)',
    body: [
      { p: 'In 3D mode, the left toolbar lets you add geometric primitives and 3D text. Each object is placed at the scene origin by default.' },
      { h: 'Available primitives', p: 'Cube, Sphere, Cone, Cylinder, Plane, Torus.' },
      { h: '3D Text', p: 'Extruded text (adjustable depth) with automatic bevel. The embedded font covers accented French characters. Size, extrusion (depth), color, and opacity are adjustable in the Properties panel.' },
      { h: 'Materials', p: 'Each 3D object (primitive or text) has a color, a metalness (metallic look, 0 to 1) and a roughness (matte/glossy look, 0 to 1) in PBR (Physically Based Rendering) format, plus an opacity.' },
      { h: 'Positioning', p: 'Select an object (cube, 3D text, or imported model) then choose the Move, Rotate, or Scale tool in the left bar (or the G/R/S shortcuts) to bring up a manipulation gizmo directly on the object in the viewport. Press V or Escape to go back to plain selection. Position, rotation, and scale (X/Y/Z) also remain editable via the numeric fields in the Properties panel. Clicking an object in the viewport selects it (it gets a purple outline).' },
      { h: 'Importing models', p: 'The import button in the left toolbar accepts glTF, GLB, or OBJ files. The model is embedded into the project (base64-encoded) and is manipulated like other 3D objects (position, rotation, scale, gizmo, opacity, shadows).' },
    ],
  },
  camera3d: {
    title: 'Camera and lighting (3D)',
    body: [
      { p: '3D mode offers control over the scene camera and lighting.' },
      { h: 'Camera', p: "Add a camera from the left toolbar. Its position (X/Y/Z), rotation (X/Y/Z), field of view (FOV), near/far planes, and orthographic mode (projection without perspective) are set in the Properties panel. Only one camera is active per scene: if there are several, only the first one added actually drives the render." },
      { h: 'Viewport navigation', p: 'In the editor canvas, as long as playback is paused, the view can be orbited with the mouse (click-drag), panned sideways (right-click-drag), and zoomed (scroll wheel) — this only changes your editing viewpoint, not the project camera. This free navigation does not exist in the Viewer (Preview) or during export: both of these modes always display the scene as driven by the project\'s 3D camera (and its keyframes), guaranteeing the exported video matches what you configured.' },
      { h: 'Lights', p: 'Four types exist at the data level (directional, point, spot, ambient), but the "Light" button in the toolbar always adds a directional light. Position, color, and intensity are adjustable in the Properties panel, as well as distance (point light) or cone angle in radians (spot light). If there are no lights in the scene, a default ambient + directional lighting is used automatically.' },
      { h: 'Shadows', p: 'Enabled or not for the whole project ("Shadows" setting in Project settings, editable at any time via the gear button in the top bar). Directional and spot lights cast shadows if this setting is on; point lights never cast shadows, for rendering performance reasons. Each 3D object also has its own "Cast shadow" toggle in the Properties panel.' },
      { h: 'Reflections (environment)', p: 'None, City (reflections from an urban environment) or HDRI Studio (reflections from a photo studio) — editable at any time via Project settings. Only affects the look of metallic/smooth materials (most visible at high metalness and low roughness); the scene\'s visible background is set separately (Project settings and Scene tab).' },
      { h: 'Reference grid', p: 'A ground grid only appears in edit mode, to help you orient yourself — it automatically disappears in Viewer mode and in exported videos.' },
    ],
  },
  animation: {
    title: 'Animations & Keyframes',
    body: [
      { p: "The animation engine interpolates a layer's properties between its keyframes, on the current scene." },
      { h: 'Animatable properties', p: 'Shapes: X/Y position, width, height, rotation, opacity, fill color. Text: X/Y position, font size, rotation, opacity, color. 3D objects: position, rotation, scale, color, opacity. Lights: position, intensity, color. 3D camera: position, field of view (FOV). Images don\'t yet have dedicated animatable properties in the Anim panel.' },
      { h: 'Adding a keyframe', p: 'In the Anim panel, expand the desired property and click "+": a keyframe is created at the playhead\'s current time, with the layer\'s current value. An existing keyframe at exactly the same time is updated rather than duplicated.' },
      { h: 'Editing a keyframe', p: 'Time is changed by dragging it in the timeline. To change its value: place the playhead exactly on its time, edit the property in the Properties panel, then click "+" again on that property in the Anim panel for that same time — this replaces the existing keyframe. Each keyframe has its own easing, editable via the dropdown next to it.' },
      { h: 'Easing types', p: 'Linear, Ease In, Ease Out, Ease InOut, Spring (damped bounce). A keyframe\'s easing applies to the interpolation leading up to it from the previous keyframe.' },
      { h: 'Deleting', p: 'The trash icon next to a keyframe permanently deletes it.' },
    ],
  },
  transitions: {
    title: 'Transitions',
    body: [
      { p: 'Each scene can have a transition to the next scene, set in the Trans. tab of the right-side panel (no transition for the last scene in the project, since there\'s no scene after it).' },
      { h: 'Types', p: 'None, Fade, Slide, Zoom, Dissolve, Wipe.' },
      { h: 'Settings', p: 'Duration in seconds and easing type (Linear, Ease In, Ease Out, Ease InOut, Spring), once a transition type (other than None) is selected.' },
    ],
  },
  export: {
    title: 'Video export',
    body: [
      { p: 'The Export button (top bar) opens the export modal, where everything is chosen on a single screen before starting the render.' },
      { h: 'Formats', p: 'MP4 (H.264, maximum compatibility, recommended by default), WebM (VP9, lighter file for the web), animated GIF (short clips/loops, no sound), MOV (pro editing use).' },
      { h: 'Resolution', p: '480p, 720p, 1080p Full HD, 1440p 2K, 2160p 4K — width is calculated automatically from the project\'s ratio.' },
      { h: 'FPS and quality', p: '24, 30, or 60 frames per second. Three quality levels (Standard, High, Maximum), corresponding to increasing video bitrates (4, 8, 16 Mbps), which affect the estimated file size shown on screen.' },
      { h: 'Rendering', p: 'The export happens entirely in the browser: each video frame is generated by driving the scene and project time, captured from the canvas, then encoded on the fly. A progress bar is shown during rendering, with a Cancel button. Once done, the file is downloaded automatically and a project thumbnail is saved for display in My projects.' },
      { h: 'Long renders', p: 'A warning is shown for exports above 1080p resolution or for any 3D project: expect a longer render time and higher memory usage, especially with several scenes or a long total duration.' },
    ],
  },
  projects: {
    title: 'Manage your projects',
    body: [
      { p: 'All your projects live in the browser (IndexedDB), on this device — there is no account or online sync.' },
      { h: 'Auto-save', p: 'In the editor, any change triggers an automatic save about 2 seconds after the last action (visible via the indicator at the top right: Unsaved → Saving... → Saved at HH:MM).' },
      { h: 'Undo / Redo', p: 'Ctrl+Z / Ctrl+Y (or a dedicated button) let you step backward or forward, over a history of the last 50 actions in the open project.' },
      { h: 'My projects page', p: 'Accessible on desktop only. Shows all your projects in a grid, with search by name and sorting (date, name, mode). Each card offers, via the ⋮ menu: Open, Rename, Duplicate, Export as JSON, Delete (with confirmation).' },
      { h: 'JSON export / import', p: 'Exporting a project downloads a .json file containing the entire project (scenes, layers, keyframes, settings). Importing that same type of file (the "Import" button) recreates a new project in your library from its content — this is also how you transfer a project to another device/browser.' },
      { h: 'Thumbnails', p: "The thumbnail shown on each project card is captured automatically at the end of a successful video export; a project that's never been exported shows a generic icon instead." },
      { h: 'Settings and reset', p: 'The avatar at the top right (on Documentation and My projects) opens the Settings page: theme toggle, number of stored projects, and a "Reset" button in the danger zone that permanently deletes all projects in this browser (after confirmation).' },
    ],
  },
  shortcuts: {
    title: 'Keyboard shortcuts',
    body: [
      { p: "The global keyboard shortcuts below work in the editor, as long as focus isn't in a text field." },
      { h: 'General', p: 'Space = play / pause. Delete or Backspace = delete the selected layer. Ctrl+Z = undo. Ctrl+Shift+Z or Ctrl+Y = redo. Ctrl+D = duplicate the selected layer.' },
      { h: '2D mode', p: 'R = add a rectangle. T = add text. Other elements (ellipse, line, polygon, star, image) are added by clicking their icon in the left toolbar.' },
      { h: '3D mode', p: 'V = Select tool. G = Move tool. R = Rotate tool. S = Scale tool. Escape = return to selection. Objects (primitives, 3D text, light, camera, model import) are added by clicking the icons in the left toolbar.' },
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      { h: 'Is my data saved?', p: "Yes, everything is saved locally in the browser via IndexedDB, with auto-save during editing. This data stays on this device and this browser — clear the site's cache or switch browser/device and your projects will be gone, unless you exported them to JSON beforehand." },
      { h: 'How do I transfer a project to another computer?', p: 'Export it as JSON from the My projects page (⋮ menu → Export JSON), then import that file on the other device via the Import button.' },
      { h: 'Can I mix 2D and 3D in the same project?', p: "No, the mode is locked at project creation. Duplicate an existing 2D project if you want to start from the same base in 3D — the duplicated project's content stays in its original mode, only its structure serves as a visual/organizational starting point." },
      { h: 'Does the app work offline?', p: "Yes, once loaded a first time, it's an offline-first PWA: the interface, editing, and video export all work without a network connection." },
      { h: "Why can't I open My projects or the editor on my phone?", p: 'Project management and the editor require a desktop screen (dense grids, context menus, multiple panels) — a message is shown instead on small screens. Only the home page is designed for mobile.' },
      { h: 'Is the light theme complete?', p: 'Yes, the entire interface (landing page, dashboard, editor, documentation) adapts to the light or dark theme, toggled via the moon/sun icon. The choice is remembered on this device (the canvas/viewport deliberately stays dark in both themes, as in most creative software).' },
    ],
  },
};
