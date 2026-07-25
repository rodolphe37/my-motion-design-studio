import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MousePointer2, Square, Circle, Triangle, Star, Type, Image, Minus,
  Box, Disc, Cone, Cylinder, Plane, Lightbulb, Camera, Move, RotateCw,
  Scale3d, Sparkles, Upload,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { createShapeLayer, createTextLayer, createImageLayer, createMeshLayer, createLightLayer, createCamera3DLayer, createText3DLayer, createImportedMeshLayer } from '@/lib/factories';
import type { MeshKind, LightKind, ImportedMeshFormat } from '@/lib/types';

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

function readModelFile(file: File): Promise<{ src: string; format: ImportedMeshFormat }> {
  const ext = file.name.toLowerCase().split('.').pop();
  const format: ImportedMeshFormat = ext === 'obj' ? 'obj' : 'gltf';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve({ src: reader.result as string, format });
    reader.readAsDataURL(file);
  });
}

type Tool2D = 'select' | 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star' | 'text' | 'image';
type Tool3D = 'select' | 'move' | 'rotate' | 'scale';

export function LeftToolbar2D() {
  const { t } = useTranslation('editor');
  const [tool, setTool] = useState<Tool2D>('select');
  const addLayer = useEditorStore((s) => s.addLayer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TOOLS_2D: { id: Tool2D; icon: typeof Square; label: string; shortcut: string }[] = [
    { id: 'select', icon: MousePointer2, label: t('leftToolbar.tools2d.select'), shortcut: 'V' },
    { id: 'rectangle', icon: Square, label: t('leftToolbar.tools2d.rectangle'), shortcut: 'R' },
    { id: 'ellipse', icon: Circle, label: t('leftToolbar.tools2d.ellipse'), shortcut: 'O' },
    { id: 'line', icon: Minus, label: t('leftToolbar.tools2d.line'), shortcut: 'L' },
    { id: 'polygon', icon: Triangle, label: t('leftToolbar.tools2d.polygon'), shortcut: 'P' },
    { id: 'star', icon: Star, label: t('leftToolbar.tools2d.star'), shortcut: 'S' },
    { id: 'text', icon: Type, label: t('leftToolbar.tools2d.text'), shortcut: 'T' },
    { id: 'image', icon: Image, label: t('leftToolbar.tools2d.image'), shortcut: 'I' },
  ];

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
      l.name = t('leftToolbar.tools2d.ellipse');
      addLayer(l);
    } else if (id === 'line') {
      const l = createShapeLayer();
      l.shape = 'line';
      l.name = t('leftToolbar.tools2d.line');
      l.height = 2;
      addLayer(l);
    } else if (id === 'polygon') {
      const l = createShapeLayer();
      l.shape = 'polygon';
      l.name = t('leftToolbar.tools2d.polygon');
      l.sides = 6;
      addLayer(l);
    } else if (id === 'star') {
      const l = createShapeLayer();
      l.shape = 'star';
      l.name = t('leftToolbar.tools2d.star');
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
      {TOOLS_2D.map((tool2d) => (
        <button
          key={tool2d.id}
          onClick={() => handleSelect(tool2d.id)}
          title={`${tool2d.label} (${tool2d.shortcut})`}
          className={`icon-btn ${tool === tool2d.id ? 'icon-btn-active' : ''}`}
        >
          <tool2d.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}

const TRANSFORM_MODE_BY_TOOL: Record<Tool3D, 'translate' | 'rotate' | 'scale' | null> = {
  select: null,
  move: 'translate',
  rotate: 'rotate',
  scale: 'scale',
};

export function LeftToolbar3D() {
  const { t } = useTranslation('editor');
  const transformMode = useEditorStore((s) => s.transformMode);
  const setTransformMode = useEditorStore((s) => s.setTransformMode);
  const tool: Tool3D = transformMode === 'translate' ? 'move' : transformMode === 'rotate' ? 'rotate' : transformMode === 'scale' ? 'scale' : 'select';
  const setTool = (tool: Tool3D) => setTransformMode(TRANSFORM_MODE_BY_TOOL[tool]);
  const addLayer = useEditorStore((s) => s.addLayer);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const MESHES: { kind: MeshKind; icon: typeof Box; label: string }[] = [
    { kind: 'box', icon: Box, label: t('leftToolbar.meshes.box') },
    { kind: 'sphere', icon: Disc, label: t('leftToolbar.meshes.sphere') },
    { kind: 'cone', icon: Cone, label: t('leftToolbar.meshes.cone') },
    { kind: 'cylinder', icon: Cylinder, label: t('leftToolbar.meshes.cylinder') },
    { kind: 'plane', icon: Plane, label: t('leftToolbar.meshes.plane') },
    { kind: 'torus', icon: Sparkles, label: t('leftToolbar.meshes.torus') },
  ];

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

  const handleImportModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { src, format } = await readModelFile(file);
      const name = file.name.replace(/\.(gltf|glb|obj)$/i, '');
      addLayer(createImportedMeshLayer(name || t('defaultNames.importedModel'), src, format));
    } catch {
      // ignore invalid/unreadable file
    }
  };

  return (
    <div className="w-14 shrink-0 border-r border-ink-700 bg-ink-850 flex flex-col items-center py-2 gap-1 overflow-y-auto scrollbar-thin">
      {/* Transform tools */}
      <button onClick={() => setTool('select')} title={t('leftToolbar.select')} className={`icon-btn ${tool === 'select' ? 'icon-btn-active' : ''}`}>
        <MousePointer2 className="w-5 h-5" />
      </button>
      <button onClick={() => setTool('move')} title={t('leftToolbar.move')} className={`icon-btn ${tool === 'move' ? 'icon-btn-active' : ''}`}>
        <Move className="w-5 h-5" />
      </button>
      <button onClick={() => setTool('rotate')} title={t('leftToolbar.rotate')} className={`icon-btn ${tool === 'rotate' ? 'icon-btn-active' : ''}`}>
        <RotateCw className="w-5 h-5" />
      </button>
      <button onClick={() => setTool('scale')} title={t('leftToolbar.scale')} className={`icon-btn ${tool === 'scale' ? 'icon-btn-active' : ''}`}>
        <Scale3d className="w-5 h-5" />
      </button>

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Meshes */}
      {MESHES.map((m) => (
        <button key={m.kind} onClick={() => handleAddMesh(m.kind)} title={m.label} className="icon-btn">
          <m.icon className="w-5 h-5" />
        </button>
      ))}

      {/* Import model */}
      <input
        ref={modelInputRef}
        type="file"
        accept=".gltf,.glb,.obj"
        className="hidden"
        onChange={handleImportModel}
      />
      <button onClick={() => modelInputRef.current?.click()} title={t('leftToolbar.importModel')} className="icon-btn">
        <Upload className="w-5 h-5" />
      </button>

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Text 3D */}
      <button onClick={handleAddText3D} title={t('leftToolbar.text3d')} className="icon-btn">
        <Type className="w-5 h-5" />
      </button>

      <div className="w-8 h-px bg-ink-700 my-1" />

      {/* Lights */}
      <button onClick={() => handleAddLight('directional')} title={t('leftToolbar.light')} className="icon-btn">
        <Lightbulb className="w-5 h-5" />
      </button>

      {/* Camera */}
      <button onClick={handleAddCamera} title={t('leftToolbar.camera')} className="icon-btn">
        <Camera className="w-5 h-5" />
      </button>
    </div>
  );
}
