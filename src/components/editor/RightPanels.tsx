import { useState } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight,
  Square, Type, Box, Lightbulb, Camera, Image, Layers as LayersIcon,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { Layer } from '@/lib/types';

function layerIcon(layer: Layer) {
  switch (layer.type) {
    case 'shape': return Square;
    case 'text': return Type;
    case 'image': return Image;
    case 'mesh': return Box;
    case 'light': return Lightbulb;
    case 'camera3d': return Camera;
    case 'text3d': return Type;
    case 'group': return LayersIcon;
    default: return Square;
  }
}

export function LayersPanel() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const setLayerVisibility = useEditorStore((s) => s.setLayerVisibility);
  const setLayerLocked = useEditorStore((s) => s.setLayerLocked);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  return (
    <div className="p-2 space-y-0.5">
      {scene.layers.length === 0 && (
        <div className="text-center py-8 text-sm text-ink-400">
          <LayersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucun calque. Utilisez la barre d'outils à gauche pour ajouter des éléments.
        </div>
      )}
      {[...scene.layers].reverse().map((layer) => {
        const Icon = layerIcon(layer);
        const isSelected = selectedLayerIds.includes(layer.id);
        return (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer.id)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
              isSelected ? 'bg-accent-violet/15 text-ink-50' : 'hover:bg-ink-750 text-ink-200'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate">{layer.name}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                className="p-1 hover:bg-ink-600 rounded"
                title="Dupliquer"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setLayerLocked(layer.id, !layer.locked); }}
              className="p-1 hover:bg-ink-600 rounded"
              title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {layer.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-50" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLayerVisibility(layer.id, !layer.visible); }}
              className="p-1 hover:bg-ink-600 rounded"
              title={layer.visible ? 'Masquer' : 'Afficher'}
            >
              {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 opacity-50" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function PropertiesPanel() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const updateLayer = useEditorStore((s) => s.updateLayer);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;
  const layer = scene.layers.find((l) => l.id === selectedLayerIds[0]);
  if (!layer) {
    return (
      <div className="p-4 text-center text-sm text-ink-400">
        Sélectionnez un élément pour voir ses propriétés.
      </div>
    );
  }

  const is3D = project.mode === '3d';

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="label">Nom</label>
        <input
          type="text"
          value={layer.name}
          onChange={(e) => updateLayer(layer.id, { name: e.target.value } as Partial<Layer>)}
          className="input text-sm"
        />
      </div>

      {is3D ? (
        <Properties3D layer={layer} updateLayer={updateLayer} />
      ) : (
        <Properties2D layer={layer} updateLayer={updateLayer} />
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        className="input text-sm font-mono"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-9 shrink-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input text-sm font-mono" />
      </div>
    </div>
  );
}

function Properties2D({ layer, updateLayer }: { layer: Layer; updateLayer: (id: string, patch: Partial<Layer>) => void }) {
  if (layer.type === 'shape') {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
          <NumberField label="Y" value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
          <NumberField label="Largeur" value={layer.width} onChange={(v) => updateLayer(layer.id, { width: v } as Partial<Layer>)} />
          <NumberField label="Hauteur" value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} />
          <NumberField label="Rotation" value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
          <NumberField label="Opacité" value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label="Remplissage" value={layer.fill} onChange={(v) => updateLayer(layer.id, { fill: v } as Partial<Layer>)} />
        <ColorField label="Contour" value={layer.stroke} onChange={(v) => updateLayer(layer.id, { stroke: v } as Partial<Layer>)} />
        <NumberField label="Épaisseur contour" value={layer.strokeWidth} onChange={(v) => updateLayer(layer.id, { strokeWidth: v } as Partial<Layer>)} />
        <NumberField label="Rayon coins" value={layer.cornerRadius} onChange={(v) => updateLayer(layer.id, { cornerRadius: v } as Partial<Layer>)} />
      </>
    );
  }
  if (layer.type === 'text') {
    return (
      <>
        <div>
          <label className="label">Texte</label>
          <textarea value={layer.text} onChange={(e) => updateLayer(layer.id, { text: e.target.value } as Partial<Layer>)} className="input text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
          <NumberField label="Y" value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
          <NumberField label="Taille" value={layer.fontSize} onChange={(v) => updateLayer(layer.id, { fontSize: v } as Partial<Layer>)} />
          <NumberField label="Rotation" value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
        </div>
        <ColorField label="Couleur" value={layer.fill} onChange={(v) => updateLayer(layer.id, { fill: v } as Partial<Layer>)} />
        <div>
          <label className="label">Police</label>
          <select value={layer.fontFamily} onChange={(e) => updateLayer(layer.id, { fontFamily: e.target.value } as Partial<Layer>)} className="input text-sm">
            <option value="Inter">Inter</option>
            <option value="Georgia">Georgia</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </div>
        <div>
          <label className="label">Graisse</label>
          <select value={layer.fontWeight} onChange={(e) => updateLayer(layer.id, { fontWeight: parseInt(e.target.value) } as Partial<Layer>)} className="input text-sm">
            <option value={400}>Normal</option>
            <option value={600}>Semi-bold</option>
            <option value={700}>Bold</option>
          </select>
        </div>
      </>
    );
  }
  if (layer.type === 'image') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
        <NumberField label="Y" value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
        <NumberField label="Largeur" value={layer.width} onChange={(v) => updateLayer(layer.id, { width: v } as Partial<Layer>)} />
        <NumberField label="Hauteur" value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} />
        <NumberField label="Rotation" value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
        <NumberField label="Opacité" value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
      </div>
    );
  }
  return null;
}

function Properties3D({ layer, updateLayer }: { layer: Layer; updateLayer: (id: string, patch: Partial<Layer>) => void }) {
  if (layer.type === 'mesh') {
    return (
      <>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Pos X" value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Y" value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Z" value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Rot X" value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Y" value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Z" value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Scale X" value={layer.scale.x} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Scale Y" value={layer.scale.y} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Scale Z" value={layer.scale.z} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label="Couleur" value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Metalness" value={layer.metalness} onChange={(v) => updateLayer(layer.id, { metalness: v } as Partial<Layer>)} step={0.1} />
          <NumberField label="Roughness" value={layer.roughness} onChange={(v) => updateLayer(layer.id, { roughness: v } as Partial<Layer>)} step={0.1} />
        </div>
        <NumberField label="Opacité" value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
      </>
    );
  }
  if (layer.type === 'light') {
    return (
      <>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Pos X" value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Y" value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Z" value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label="Couleur" value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
        <NumberField label="Intensité" value={layer.intensity} onChange={(v) => updateLayer(layer.id, { intensity: v } as Partial<Layer>)} step={0.1} />
      </>
    );
  }
  if (layer.type === 'camera3d') {
    return (
      <>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Pos X" value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Y" value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Z" value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <NumberField label="FOV" value={layer.fov} onChange={(v) => updateLayer(layer.id, { fov: v } as Partial<Layer>)} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Near" value={layer.near} onChange={(v) => updateLayer(layer.id, { near: v } as Partial<Layer>)} step={0.1} />
          <NumberField label="Far" value={layer.far} onChange={(v) => updateLayer(layer.id, { far: v } as Partial<Layer>)} />
        </div>
      </>
    );
  }
  if (layer.type === 'text3d') {
    return (
      <>
        <div>
          <label className="label">Texte</label>
          <textarea value={layer.text} onChange={(e) => updateLayer(layer.id, { text: e.target.value } as Partial<Layer>)} className="input text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Pos X" value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Y" value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Pos Z" value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Rot X" value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Y" value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Z" value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Scale X" value={layer.scale.x} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Scale Y" value={layer.scale.y} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Scale Z" value={layer.scale.z} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label="Couleur" value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Taille" value={layer.fontSize} onChange={(v) => updateLayer(layer.id, { fontSize: v } as Partial<Layer>)} step={0.1} />
          <NumberField label="Extrusion" value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} step={0.05} />
        </div>
        <NumberField label="Opacité" value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
      </>
    );
  }
  return null;
}

export function AnimationPanel() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const addKeyframe = useEditorStore((s) => s.addKeyframe);
  const deleteKeyframe = useEditorStore((s) => s.deleteKeyframe);
  const currentTime = useEditorStore((s) => s.currentTime);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;
  const layer = scene.layers.find((l) => l.id === selectedLayerIds[0]);
  if (!layer) {
    return <div className="p-4 text-center text-sm text-ink-400">Sélectionnez un élément pour l'animer.</div>;
  }

  const animatableProps = getAnimatableProps(layer);
  const keyframesByProp = layer.keyframes.reduce<Record<string, typeof layer.keyframes>>((acc, kf) => {
    (acc[kf.property] = acc[kf.property] || []).push(kf);
    return acc;
  }, {});

  const getCurrentValue = (prop: string): number | string => {
    const val = (layer as unknown as Record<string, unknown>)[prop];
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return val;
    return 0;
  };

  return (
    <div className="p-3 space-y-1">
      <p className="text-xs text-ink-400 mb-2">Temps: {currentTime.toFixed(2)}s</p>
      {animatableProps.map((prop) => {
        const kfs = keyframesByProp[prop] || [];
        const isExpanded = expanded[prop];
        return (
          <div key={prop} className="rounded-lg border border-ink-700 overflow-hidden">
            <div
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-ink-750"
              onClick={() => setExpanded({ ...expanded, [prop]: !isExpanded })}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span className="text-sm font-medium flex-1">{prop}</span>
              <span className="text-xs text-ink-400">{kfs.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addKeyframe(layer.id, {
                    id: Math.random().toString(36).slice(2, 10),
                    time: currentTime,
                    property: prop,
                    value: getCurrentValue(prop),
                    easing: 'easeInOut',
                  });
                }}
                className="icon-btn w-6 h-6"
                title="Ajouter keyframe"
              >
                +
              </button>
            </div>
            {isExpanded && (
              <div className="px-2 pb-2 space-y-1">
                {kfs.sort((a, b) => a.time - b.time).map((kf) => (
                  <div key={kf.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-ink-300 w-12">{kf.time.toFixed(2)}s</span>
                    <span className="font-mono text-ink-200 flex-1">{String(kf.value)}</span>
                    <select
                      value={kf.easing}
                      onChange={(e) => useEditorStore.getState().updateKeyframe(layer.id, kf.id, { easing: e.target.value as never })}
                      className="bg-ink-900 border border-ink-600 rounded px-1 py-0.5 text-xs"
                    >
                      <option value="linear">Linéaire</option>
                      <option value="easeIn">Ease In</option>
                      <option value="easeOut">Ease Out</option>
                      <option value="easeInOut">Ease InOut</option>
                      <option value="spring">Spring</option>
                    </select>
                    <button
                      onClick={() => deleteKeyframe(layer.id, kf.id)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {kfs.length === 0 && <p className="text-xs text-ink-400 px-2 py-1">Aucun keyframe</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getAnimatableProps(layer: Layer): string[] {
  if (layer.type === 'shape') return ['x', 'y', 'width', 'height', 'rotation', 'opacity', 'fill'];
  if (layer.type === 'text') return ['x', 'y', 'fontSize', 'rotation', 'opacity', 'fill'];
  if (layer.type === 'mesh') return ['position', 'rotation', 'scale', 'color', 'opacity'];
  if (layer.type === 'light') return ['position', 'intensity', 'color'];
  if (layer.type === 'camera3d') return ['position', 'fov'];
  return [];
}

export function TransitionsPanel() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const setSceneTransition = useEditorStore((s) => s.setSceneTransition);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  const transition = scene.transitionToNext;
  const types: { value: string; label: string }[] = [
    { value: 'none', label: 'Aucune' },
    { value: 'fade', label: 'Fondu' },
    { value: 'slide', label: 'Glissement' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'dissolve', label: 'Dissolve' },
    { value: 'wipe', label: 'Wipe' },
  ];

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="label">Transition vers la scène suivante</label>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSceneTransition(scene.id, transition?.type === t.value ? null : { type: t.value as never, duration: 0.5, easing: 'easeInOut' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                transition?.type === t.value ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {transition && (
        <>
          <NumberField
            label="Durée (s)"
            value={transition.duration}
            onChange={(v) => setSceneTransition(scene.id, { ...transition, duration: v })}
            step={0.1}
          />
          <div>
            <label className="label">Easing</label>
            <select
              value={transition.easing}
              onChange={(e) => setSceneTransition(scene.id, { ...transition, easing: e.target.value as never })}
              className="input text-sm"
            >
              <option value="linear">Linéaire</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="easeInOut">Ease InOut</option>
              <option value="spring">Spring</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
