import { useState, useRef } from 'react';
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
  const reorderLayers = useEditorStore((s) => s.reorderLayers);
  const [dragDisplayIndex, setDragDisplayIndex] = useState<number | null>(null);
  // A ref (not just the state above) so onDrop always reads the value set by
  // this drag's onDragStart — state set there is not guaranteed to have
  // flushed to a re-render yet by the time drop fires.
  const dragRef = useRef<number | null>(null);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  // The list is rendered newest-first (reversed), but reorderLayers works on
  // the underlying array order, so a displayed index has to be flipped back.
  const toActualIndex = (displayIndex: number) => scene.layers.length - 1 - displayIndex;

  return (
    <div className="p-2 space-y-0.5">
      {scene.layers.length === 0 && (
        <div className="text-center py-8 text-sm text-ink-400">
          <LayersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucun calque. Utilisez la barre d'outils à gauche pour ajouter des éléments.
        </div>
      )}
      {[...scene.layers].reverse().map((layer, displayIndex) => {
        const Icon = layerIcon(layer);
        const isSelected = selectedLayerIds.includes(layer.id);
        return (
          <div
            key={layer.id}
            draggable
            onDragStart={() => { dragRef.current = displayIndex; setDragDisplayIndex(displayIndex); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragRef.current;
              if (from !== null && from !== displayIndex) {
                reorderLayers(scene.id, toActualIndex(from), toActualIndex(displayIndex));
              }
              dragRef.current = null;
              setDragDisplayIndex(null);
            }}
            onDragEnd={() => { dragRef.current = null; setDragDisplayIndex(null); }}
            onClick={() => selectLayer(layer.id)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing text-sm transition-colors ${
              isSelected ? 'bg-accent-violet/15 text-ink-50' : 'hover:bg-ink-750 text-ink-200'
            } ${dragDisplayIndex === displayIndex ? 'opacity-50' : ''}`}
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

function ToggleField({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-ink-700">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-ink-400">{description}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-accent-violet' : 'bg-ink-600'}`}>
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
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
        {layer.shape === 'rectangle' && (
          <NumberField label="Rayon coins" value={layer.cornerRadius} onChange={(v) => updateLayer(layer.id, { cornerRadius: v } as Partial<Layer>)} />
        )}
        {(layer.shape === 'polygon' || layer.shape === 'star') && (
          <NumberField
            label={layer.shape === 'star' ? 'Branches' : 'Côtés'}
            value={layer.sides}
            onChange={(v) => updateLayer(layer.id, { sides: Math.max(3, Math.round(v)) } as Partial<Layer>)}
          />
        )}
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
        <div>
          <label className="label">Alignement</label>
          <select value={layer.align} onChange={(e) => updateLayer(layer.id, { align: e.target.value as never } as Partial<Layer>)} className="input text-sm">
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
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
    const isImported = layer.mesh === 'imported';
    return (
      <>
        {isImported && (
          <p className="text-xs text-ink-400 -mt-1">
            Modèle importé ({layer.importedFormat === 'obj' ? 'OBJ' : 'glTF/GLB'}) — conserve ses propres matériaux.
          </p>
        )}
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
        {!isImported && (
          <>
            <ColorField label="Couleur" value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="Metalness" value={layer.metalness} onChange={(v) => updateLayer(layer.id, { metalness: v } as Partial<Layer>)} step={0.1} />
              <NumberField label="Roughness" value={layer.roughness} onChange={(v) => updateLayer(layer.id, { roughness: v } as Partial<Layer>)} step={0.1} />
            </div>
          </>
        )}
        <NumberField label="Opacité" value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
        <ToggleField
          label="Ombre portée"
          description="Cet objet projette une ombre"
          value={layer.castShadow}
          onChange={(v) => updateLayer(layer.id, { castShadow: v } as Partial<Layer>)}
        />
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
        {layer.light === 'point' && (
          <NumberField
            label="Distance (0 = illimitée)"
            value={layer.distance}
            onChange={(v) => updateLayer(layer.id, { distance: Math.max(0, v) } as Partial<Layer>)}
            step={0.5}
          />
        )}
        {layer.light === 'spot' && (
          <NumberField
            label="Angle (rad)"
            value={layer.angle}
            onChange={(v) => updateLayer(layer.id, { angle: v } as Partial<Layer>)}
            step={0.05}
          />
        )}
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
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Rot X" value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Y" value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label="Rot Z" value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        {!layer.orthographic && <NumberField label="FOV" value={layer.fov} onChange={(v) => updateLayer(layer.id, { fov: v } as Partial<Layer>)} />}
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Near" value={layer.near} onChange={(v) => updateLayer(layer.id, { near: v } as Partial<Layer>)} step={0.1} />
          <NumberField label="Far" value={layer.far} onChange={(v) => updateLayer(layer.id, { far: v } as Partial<Layer>)} />
        </div>
        <ToggleField
          label="Orthographique"
          description="Projection sans perspective (au lieu de perspective)"
          value={layer.orthographic}
          onChange={(v) => updateLayer(layer.id, { orthographic: v } as Partial<Layer>)}
        />
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
  if (layer.type === 'camera3d') return ['position', 'rotation', 'fov'];
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

export function ScenePanel() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const setSceneBackground = useEditorStore((s) => s.setSceneBackground);
  const updateScene = useEditorStore((s) => s.updateScene);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;
  const is3D = project.mode === '3d';

  const bg = scene.background;
  const mode: 'default' | 'solid' | 'gradient' | 'spots' = bg?.type ?? 'default';

  const modes: { value: typeof mode; label: string }[] = [
    { value: 'default', label: 'Projet (défaut)' },
    { value: 'solid', label: 'Uni' },
    { value: 'gradient', label: 'Dégradé' },
    { value: 'spots', label: 'Spots' },
  ];

  const setMode = (m: typeof mode) => {
    if (m === 'default') setSceneBackground(scene.id, null);
    else if (m === 'solid') setSceneBackground(scene.id, { type: 'solid', color: project.settings.backgroundColor });
    else if (m === 'gradient') setSceneBackground(scene.id, { type: 'gradient', from: '#8b5cf6', to: '#3b82f6', angle: 45 });
    else setSceneBackground(scene.id, {
      type: 'spots',
      base: project.settings.backgroundColor,
      spots: [{ color: '#8b5cf6', x: project.settings.width / 2, y: project.settings.height / 2, radius: Math.round(project.settings.width / 5), opacity: 0.5 }],
    });
  };

  return (
    <div className="p-3 space-y-3">
      <NumberField
        label="Durée de la scène (s)"
        value={scene.duration}
        step={0.1}
        onChange={(v) => updateScene(scene.id, { duration: Math.max(0.1, v) })}
      />

      {!is3D && (
        <>
          <div>
            <label className="label">Fond de la scène</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {modes.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    mode === opt.value ? 'border-accent-violet bg-accent-violet/10 text-accent-violet' : 'border-ink-600 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {mode === 'default' && (
              <p className="text-xs text-ink-400 mt-2">Utilise la couleur de fond définie à la création du projet.</p>
            )}
          </div>

          {bg?.type === 'solid' && (
            <ColorField label="Couleur" value={bg.color} onChange={(v) => setSceneBackground(scene.id, { ...bg, color: v })} />
          )}

          {bg?.type === 'gradient' && (
            <>
              <ColorField label="Couleur de départ" value={bg.from} onChange={(v) => setSceneBackground(scene.id, { ...bg, from: v })} />
              <ColorField label="Couleur d'arrivée" value={bg.to} onChange={(v) => setSceneBackground(scene.id, { ...bg, to: v })} />
              <NumberField label="Angle (°)" value={bg.angle} onChange={(v) => setSceneBackground(scene.id, { ...bg, angle: v })} />
            </>
          )}

          {bg?.type === 'spots' && (
            <>
              <ColorField label="Couleur de fond" value={bg.base} onChange={(v) => setSceneBackground(scene.id, { ...bg, base: v })} />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label !mb-0">Spots ({bg.spots.length})</label>
                  <button
                    onClick={() => setSceneBackground(scene.id, {
                      ...bg,
                      spots: [...bg.spots, { color: '#3b82f6', x: project.settings.width / 2, y: project.settings.height / 2, radius: Math.round(project.settings.width / 6), opacity: 0.5 }],
                    })}
                    className="icon-btn w-6 h-6"
                    title="Ajouter un spot"
                  >
                    +
                  </button>
                </div>
                {bg.spots.map((spot, i) => (
                  <div key={i} className="p-2 rounded-lg border border-ink-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-400">Spot {i + 1}</span>
                      <button
                        onClick={() => setSceneBackground(scene.id, { ...bg, spots: bg.spots.filter((_, si) => si !== i) })}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                        title="Supprimer ce spot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <ColorField
                      label="Couleur"
                      value={spot.color}
                      onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, color: v } : s)) })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="X"
                        value={spot.x}
                        onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, x: v } : s)) })}
                      />
                      <NumberField
                        label="Y"
                        value={spot.y}
                        onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, y: v } : s)) })}
                      />
                      <NumberField
                        label="Rayon"
                        value={spot.radius}
                        onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, radius: v } : s)) })}
                      />
                      <NumberField
                        label="Opacité"
                        value={spot.opacity}
                        step={0.1}
                        onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, opacity: v } : s)) })}
                      />
                    </div>
                  </div>
                ))}
                {bg.spots.length === 0 && <p className="text-xs text-ink-400 px-1">Aucun spot — cliquez + pour en ajouter un.</p>}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
