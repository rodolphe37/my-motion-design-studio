import { useState, useEffect, useRef } from 'react';
import {
  MousePointer2, Square, Circle, Triangle, Star, Type, Image, Minus,
  Box, Disc, Cone, Cylinder, Plane, Lightbulb, Camera, Move, RotateCw,
  Scale3d, Sparkles, Layers,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { createShapeLayer, createTextLayer, createImageLayer, createMeshLayer, createLightLayer, createCamera3DLayer, createText3DLayer } from '@/lib/factories';
import type { ShapeKind, MeshKind, LightKind } from '@/lib/types';

function readImageFile(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Image invalide'));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

type Tool2D = 'select' | 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star' | 'text' | 'image';
type Tool3D = 'select' | 'move' | 'rotate' | 'scale';

const TOOLS_2D: { id: Tool2D; icon: typeof Square; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Sélection', shortcut: 'V' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
  { id: 'line', icon: Minus, label: 'Ligne', shortcut: 'L' },
  { id: 'polygon', icon: Triangle, label: 'Polygone', shortcut: 'P' },
  { id: 'star', icon: Star, label: 'Étoile', shortcut: 'S' },
  { id: 'text', icon: Type, label: 'Texte', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
];

const MESHES: { kind: MeshKind; icon: typeof Box; label: string }[] = [
  { kind: 'box', icon: Box, label: 'Cube' },
  { kind: 'sphere', icon: Disc, label: 'Sphère' },
  { kind: 'cone', icon: Cone, label: 'Cône' },
  { kind: 'cylinder', icon: Cylinder, label: 'Cylindre' },
  { kind: 'plane', icon: Plane, label: 'Plan' },
  { kind: 'torus', icon: Sparkles, label: 'Tore' },
];

const LIGHTS: { kind: LightKind; label: string }[] = [
  { kind: 'directional', label: 'Directionnelle' },
  { kind: 'point', label: 'Point' },
  { kind: 'spot', label: 'Spot' },
  { kind: 'ambient', label: 'Ambiante' },
];

export function LeftToolbar2D() {
  const [tool, setTool] = useState<Tool2D>('select');
  const addLayer = useEditorStore((s) => s.addLayer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (id: Tool2D) => {
    if (id === 'image') {
      fileInputRef.current?.click();
      return;
    }
    setTool(id);
    if (id === 'rectangle') addLayer(createShapeLayer());
    else if (id === 'ellipse') {
      const l = createShapeLayer();
      l.shape = 'ellipse';
      l.name = 'Ellipse';
      addLayer(l);
    } else if (id === 'line') {
      const l = createShapeLayer();
      l.shape = 'line';
      l.name = 'Ligne';
      l.height = 2;
      addLayer(l);
    } else if (id === 'polygon') {
      const l = createShapeLayer();
      l.shape = 'polygon';
      l.name = 'Polygone';
      l.sides = 6;
      addLayer(l);
    } else if (id === 'star') {
      const l = createShapeLayer();
      l.shape = 'star';
      l.name = 'Étoile';
      addLayer(l);
    } else if (id === 'text') addLayer(createTextLayer());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { src, width, height } = await readImageFile(file);
      const maxSize = 500;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      addLayer(createImageLayer(src, Math.round(width * scale), Math.round(height * scale)));
      setTool('select');
    } catch {
      // ignore invalid/unreadable file
    }
  };

  return (
    <div className="w-14 shrink-0 border-r border-ink-700 bg-ink-850 flex flex-col items-center py-2 gap-1 overflow-y-auto scrollbar-thin">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {TOOLS_2D.map((t) => (
        <div key={t.id} className="relative group">
          <button
            onClick={() => handleSelect(t.id)}
            className={`icon-btn ${tool === t.id ? 'icon-btn-active' : ''}`}
          >
            <t.icon className="w-5 h-5" />
          </button>
          <div className="tooltip left-14 top-1/2 -translate-y-1/2">
            {t.label} <span className="text-ink-400 ml-1">{t.shortcut}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeftToolbar3D() {
  const [tool, setTool] = useState<Tool3D>('select');
  const addLayer = useEditorStore((s) => s.addLayer);

  const handleAddMesh = (kind: MeshKind) => {
    addLayer(createMeshLayer(kind));
  };

  const handleAddLight = (kind: LightKind) => {
    addLayer(createLightLayer(kind));
  };

  const handleAddCamera = () => {
    addLayer(createCamera3DLayer());
  };

  const handleAddText3D = () => {
    addLayer(createText3DLayer());
  };

  return (
    <div className="w-14 shrink-0 border-r border-ink-700 bg-ink-850 flex flex-col items-center py-2 gap-1 overflow-y-auto scrollbar-thin">
      {/* Transform tools */}
      <div key="select" className="relative group">
        <button onClick={() => setTool('select')} className={`icon-btn ${tool === 'select' ? 'icon-btn-active' : ''}`}>
          <MousePointer2 className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Sélection</div>
      </div>
      <div key="move" className="relative group">
        <button onClick={() => setTool('move')} className={`icon-btn ${tool === 'move' ? 'icon-btn-active' : ''}`}>
          <Move className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Déplacer <span className="text-ink-400 ml-1">G</span></div>
      </div>
      <div key="rotate" className="relative group">
        <button onClick={() => setTool('rotate')} className={`icon-btn ${tool === 'rotate' ? 'icon-btn-active' : ''}`}>
          <RotateCw className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Tourner <span className="text-ink-400 ml-1">R</span></div>
      </div>
      <div key="scale" className="relative group">
        <button onClick={() => setTool('scale')} className={`icon-btn ${tool === 'scale' ? 'icon-btn-active' : ''}`}>
          <Scale3d className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Échelle <span className="text-ink-400 ml-1">S</span></div>
      </div>

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Meshes */}
      {MESHES.map((m) => (
        <div key={m.kind} className="relative group">
          <button onClick={() => handleAddMesh(m.kind)} className="icon-btn">
            <m.icon className="w-5 h-5" />
          </button>
          <div className="tooltip left-14 top-1/2 -translate-y-1/2">{m.label}</div>
        </div>
      ))}

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Text 3D */}
      <div className="relative group">
        <button onClick={handleAddText3D} className="icon-btn">
          <Type className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Texte 3D</div>
      </div>

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Lights */}
      <div className="relative group">
        <button onClick={() => handleAddLight('directional')} className="icon-btn">
          <Lightbulb className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Lumière</div>
      </div>

      {/* Camera */}
      <div className="relative group">
        <button onClick={handleAddCamera} className="icon-btn">
          <Camera className="w-5 h-5" />
        </button>
        <div className="tooltip left-14 top-1/2 -translate-y-1/2">Caméra</div>
      </div>
    </div>
  );
}
