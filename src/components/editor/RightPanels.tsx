import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('editor');
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
          {t('layersPanel.empty')}
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
                title={t('layersPanel.duplicate')}
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                title={t('layersPanel.deleteAction')}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setLayerLocked(layer.id, !layer.locked); }}
              className="p-1 hover:bg-ink-600 rounded"
              title={layer.locked ? t('layersPanel.unlock') : t('layersPanel.lock')}
            >
              {layer.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-50" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLayerVisibility(layer.id, !layer.visible); }}
              className="p-1 hover:bg-ink-600 rounded"
              title={layer.visible ? t('layersPanel.hide') : t('layersPanel.show')}
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
  const { t } = useTranslation('editor');
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
        {t('propertiesPanel.empty')}
      </div>
    );
  }

  const is3D = project.mode === '3d';

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="label">{t('propertiesPanel.name')}</label>
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
  const { t } = useTranslation('editor');
  if (layer.type === 'shape') {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('propertiesPanel.x')} value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.y')} value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.width')} value={layer.width} onChange={(v) => updateLayer(layer.id, { width: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.height')} value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.rotation')} value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.opacity')} value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label={t('propertiesPanel.fill')} value={layer.fill} onChange={(v) => updateLayer(layer.id, { fill: v } as Partial<Layer>)} />
        <ColorField label={t('propertiesPanel.stroke')} value={layer.stroke} onChange={(v) => updateLayer(layer.id, { stroke: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.strokeWidth')} value={layer.strokeWidth} onChange={(v) => updateLayer(layer.id, { strokeWidth: v } as Partial<Layer>)} />
        {layer.shape === 'rectangle' && (
          <NumberField label={t('propertiesPanel.cornerRadius')} value={layer.cornerRadius} onChange={(v) => updateLayer(layer.id, { cornerRadius: v } as Partial<Layer>)} />
        )}
        {(layer.shape === 'polygon' || layer.shape === 'star') && (
          <NumberField
            label={layer.shape === 'star' ? t('propertiesPanel.branches') : t('propertiesPanel.sides')}
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
          <label className="label">{t('propertiesPanel.text')}</label>
          <textarea value={layer.text} onChange={(e) => updateLayer(layer.id, { text: e.target.value } as Partial<Layer>)} className="input text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('propertiesPanel.x')} value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.y')} value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.size')} value={layer.fontSize} onChange={(v) => updateLayer(layer.id, { fontSize: v } as Partial<Layer>)} />
          <NumberField label={t('propertiesPanel.rotation')} value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
        </div>
        <ColorField label={t('propertiesPanel.color')} value={layer.fill} onChange={(v) => updateLayer(layer.id, { fill: v } as Partial<Layer>)} />
        <div>
          <label className="label">{t('propertiesPanel.font')}</label>
          <select value={layer.fontFamily} onChange={(e) => updateLayer(layer.id, { fontFamily: e.target.value } as Partial<Layer>)} className="input text-sm">
            <option value="Inter">Inter</option>
            <option value="Georgia">Georgia</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </div>
        <div>
          <label className="label">{t('propertiesPanel.weight')}</label>
          <select value={layer.fontWeight} onChange={(e) => updateLayer(layer.id, { fontWeight: parseInt(e.target.value) } as Partial<Layer>)} className="input text-sm">
            <option value={400}>{t('propertiesPanel.weightNormal')}</option>
            <option value={600}>{t('propertiesPanel.weightSemiBold')}</option>
            <option value={700}>{t('propertiesPanel.weightBold')}</option>
          </select>
        </div>
        <div>
          <label className="label">{t('propertiesPanel.align')}</label>
          <select value={layer.align} onChange={(e) => updateLayer(layer.id, { align: e.target.value as never } as Partial<Layer>)} className="input text-sm">
            <option value="left">{t('propertiesPanel.alignLeft')}</option>
            <option value="center">{t('propertiesPanel.alignCenter')}</option>
            <option value="right">{t('propertiesPanel.alignRight')}</option>
          </select>
        </div>
      </>
    );
  }
  if (layer.type === 'image') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberField label={t('propertiesPanel.x')} value={layer.x} onChange={(v) => updateLayer(layer.id, { x: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.y')} value={layer.y} onChange={(v) => updateLayer(layer.id, { y: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.width')} value={layer.width} onChange={(v) => updateLayer(layer.id, { width: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.height')} value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.rotation')} value={layer.rotation} onChange={(v) => updateLayer(layer.id, { rotation: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.opacity')} value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
      </div>
    );
  }
  return null;
}

function Properties3D({ layer, updateLayer }: { layer: Layer; updateLayer: (id: string, patch: Partial<Layer>) => void }) {
  const { t } = useTranslation('editor');
  if (layer.type === 'mesh') {
    const isImported = layer.mesh === 'imported';
    return (
      <>
        {isImported && (
          <p className="text-xs text-ink-400 -mt-1">
            {t('propertiesPanel.importedNote', { format: layer.importedFormat === 'obj' ? 'OBJ' : 'glTF/GLB' })}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.posX')} value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posY')} value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posZ')} value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.rotX')} value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotY')} value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotZ')} value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.scaleX')} value={layer.scale.x} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.scaleY')} value={layer.scale.y} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.scaleZ')} value={layer.scale.z} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        {!isImported && (
          <>
            <ColorField label={t('propertiesPanel.color')} value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
            <div className="grid grid-cols-2 gap-2">
              <NumberField label={t('propertiesPanel.metalness')} value={layer.metalness} onChange={(v) => updateLayer(layer.id, { metalness: v } as Partial<Layer>)} step={0.1} />
              <NumberField label={t('propertiesPanel.roughness')} value={layer.roughness} onChange={(v) => updateLayer(layer.id, { roughness: v } as Partial<Layer>)} step={0.1} />
            </div>
          </>
        )}
        <NumberField label={t('propertiesPanel.opacity')} value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
        <ToggleField
          label={t('propertiesPanel.castShadow')}
          description={t('propertiesPanel.castShadowDesc')}
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
          <NumberField label={t('propertiesPanel.posX')} value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posY')} value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posZ')} value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label={t('propertiesPanel.color')} value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
        <NumberField label={t('propertiesPanel.intensity')} value={layer.intensity} onChange={(v) => updateLayer(layer.id, { intensity: v } as Partial<Layer>)} step={0.1} />
        {layer.light === 'point' && (
          <NumberField
            label={t('propertiesPanel.distance')}
            value={layer.distance}
            onChange={(v) => updateLayer(layer.id, { distance: Math.max(0, v) } as Partial<Layer>)}
            step={0.5}
          />
        )}
        {layer.light === 'spot' && (
          <NumberField
            label={t('propertiesPanel.angle')}
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
          <NumberField label={t('propertiesPanel.posX')} value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posY')} value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posZ')} value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.rotX')} value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotY')} value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotZ')} value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        {!layer.orthographic && <NumberField label={t('propertiesPanel.fov')} value={layer.fov} onChange={(v) => updateLayer(layer.id, { fov: v } as Partial<Layer>)} />}
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('propertiesPanel.near')} value={layer.near} onChange={(v) => updateLayer(layer.id, { near: v } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.far')} value={layer.far} onChange={(v) => updateLayer(layer.id, { far: v } as Partial<Layer>)} />
        </div>
        <ToggleField
          label={t('propertiesPanel.orthographic')}
          description={t('propertiesPanel.orthographicDesc')}
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
          <label className="label">{t('propertiesPanel.text')}</label>
          <textarea value={layer.text} onChange={(e) => updateLayer(layer.id, { text: e.target.value } as Partial<Layer>)} className="input text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.posX')} value={layer.position.x} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posY')} value={layer.position.y} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.posZ')} value={layer.position.z} onChange={(v) => updateLayer(layer.id, { position: { ...layer.position, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.rotX')} value={layer.rotation.x} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotY')} value={layer.rotation.y} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.rotZ')} value={layer.rotation.z} onChange={(v) => updateLayer(layer.id, { rotation: { ...layer.rotation, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('propertiesPanel.scaleX')} value={layer.scale.x} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, x: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.scaleY')} value={layer.scale.y} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, y: v } } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.scaleZ')} value={layer.scale.z} onChange={(v) => updateLayer(layer.id, { scale: { ...layer.scale, z: v } } as Partial<Layer>)} step={0.1} />
        </div>
        <ColorField label={t('propertiesPanel.color')} value={layer.color} onChange={(v) => updateLayer(layer.id, { color: v } as Partial<Layer>)} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('propertiesPanel.size')} value={layer.fontSize} onChange={(v) => updateLayer(layer.id, { fontSize: v } as Partial<Layer>)} step={0.1} />
          <NumberField label={t('propertiesPanel.extrusion')} value={layer.height} onChange={(v) => updateLayer(layer.id, { height: v } as Partial<Layer>)} step={0.05} />
        </div>
        <NumberField label={t('propertiesPanel.opacity')} value={layer.opacity} onChange={(v) => updateLayer(layer.id, { opacity: v } as Partial<Layer>)} step={0.1} />
      </>
    );
  }
  return null;
}

export function AnimationPanel() {
  const { t } = useTranslation('editor');
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
    return <div className="p-4 text-center text-sm text-ink-400">{t('animationPanel.selectElement')}</div>;
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
      <p className="text-xs text-ink-400 mb-2">{t('animationPanel.time', { time: currentTime.toFixed(2) })}</p>
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
                title={t('animationPanel.addKeyframe')}
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
                      <option value="linear">{t('animationPanel.easing.linear')}</option>
                      <option value="easeIn">{t('animationPanel.easing.easeIn')}</option>
                      <option value="easeOut">{t('animationPanel.easing.easeOut')}</option>
                      <option value="easeInOut">{t('animationPanel.easing.easeInOut')}</option>
                      <option value="spring">{t('animationPanel.easing.spring')}</option>
                    </select>
                    <button
                      onClick={() => deleteKeyframe(layer.id, kf.id)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {kfs.length === 0 && <p className="text-xs text-ink-400 px-2 py-1">{t('animationPanel.noKeyframes')}</p>}
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
  const { t } = useTranslation('editor');
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const setSceneTransition = useEditorStore((s) => s.setSceneTransition);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  const transition = scene.transitionToNext;
  const types: { value: string; label: string }[] = [
    { value: 'none', label: t('transitionsPanel.types.none') },
    { value: 'fade', label: t('transitionsPanel.types.fade') },
    { value: 'slide', label: t('transitionsPanel.types.slide') },
    { value: 'zoom', label: t('transitionsPanel.types.zoom') },
    { value: 'dissolve', label: t('transitionsPanel.types.dissolve') },
    { value: 'wipe', label: t('transitionsPanel.types.wipe') },
  ];

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="label">{t('transitionsPanel.label')}</label>
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
            label={t('transitionsPanel.duration')}
            value={transition.duration}
            onChange={(v) => setSceneTransition(scene.id, { ...transition, duration: v })}
            step={0.1}
          />
          <div>
            <label className="label">{t('transitionsPanel.easing')}</label>
            <select
              value={transition.easing}
              onChange={(e) => setSceneTransition(scene.id, { ...transition, easing: e.target.value as never })}
              className="input text-sm"
            >
              <option value="linear">{t('animationPanel.easing.linear')}</option>
              <option value="easeIn">{t('animationPanel.easing.easeIn')}</option>
              <option value="easeOut">{t('animationPanel.easing.easeOut')}</option>
              <option value="easeInOut">{t('animationPanel.easing.easeInOut')}</option>
              <option value="spring">{t('animationPanel.easing.spring')}</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export function ScenePanel() {
  const { t } = useTranslation('editor');
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const setSceneBackground = useEditorStore((s) => s.setSceneBackground);
  const updateScene = useEditorStore((s) => s.updateScene);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  const bg = scene.background;
  const mode: 'default' | 'solid' | 'gradient' | 'spots' = bg?.type ?? 'default';

  const modes: { value: typeof mode; label: string }[] = [
    { value: 'default', label: t('scenePanel.modes.default') },
    { value: 'solid', label: t('scenePanel.modes.solid') },
    { value: 'gradient', label: t('scenePanel.modes.gradient') },
    { value: 'spots', label: t('scenePanel.modes.spots') },
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
        label={t('scenePanel.duration')}
        value={scene.duration}
        step={0.1}
        onChange={(v) => updateScene(scene.id, { duration: Math.max(0.1, v) })}
      />

      <div>
        <label className="label">{t('scenePanel.background')}</label>
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
          <p className="text-xs text-ink-400 mt-2">{t('scenePanel.defaultHint')}</p>
        )}
      </div>

      {bg?.type === 'solid' && (
        <ColorField label={t('scenePanel.color')} value={bg.color} onChange={(v) => setSceneBackground(scene.id, { ...bg, color: v })} />
      )}

      {bg?.type === 'gradient' && (
        <>
          <ColorField label={t('scenePanel.startColor')} value={bg.from} onChange={(v) => setSceneBackground(scene.id, { ...bg, from: v })} />
          <ColorField label={t('scenePanel.endColor')} value={bg.to} onChange={(v) => setSceneBackground(scene.id, { ...bg, to: v })} />
          <NumberField label={t('scenePanel.angle')} value={bg.angle} onChange={(v) => setSceneBackground(scene.id, { ...bg, angle: v })} />
        </>
      )}

      {bg?.type === 'spots' && (
        <>
          <ColorField label={t('scenePanel.bgColor')} value={bg.base} onChange={(v) => setSceneBackground(scene.id, { ...bg, base: v })} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label !mb-0">{t('scenePanel.spots', { count: bg.spots.length })}</label>
              <button
                onClick={() => setSceneBackground(scene.id, {
                  ...bg,
                  spots: [...bg.spots, { color: '#3b82f6', x: project.settings.width / 2, y: project.settings.height / 2, radius: Math.round(project.settings.width / 6), opacity: 0.5 }],
                })}
                className="icon-btn w-6 h-6"
                title={t('scenePanel.addSpot')}
              >
                +
              </button>
            </div>
            {bg.spots.map((spot, i) => (
              <div key={i} className="p-2 rounded-lg border border-ink-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-400">{t('scenePanel.spot', { n: i + 1 })}</span>
                  <button
                    onClick={() => setSceneBackground(scene.id, { ...bg, spots: bg.spots.filter((_, si) => si !== i) })}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                    title={t('scenePanel.removeSpot')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <ColorField
                  label={t('scenePanel.color')}
                  value={spot.color}
                  onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, color: v } : s)) })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label={t('propertiesPanel.x')}
                    value={spot.x}
                    onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, x: v } : s)) })}
                  />
                  <NumberField
                    label={t('propertiesPanel.y')}
                    value={spot.y}
                    onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, y: v } : s)) })}
                  />
                  <NumberField
                    label={t('scenePanel.radius')}
                    value={spot.radius}
                    onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, radius: v } : s)) })}
                  />
                  <NumberField
                    label={t('propertiesPanel.opacity')}
                    value={spot.opacity}
                    step={0.1}
                    onChange={(v) => setSceneBackground(scene.id, { ...bg, spots: bg.spots.map((s, si) => (si === i ? { ...s, opacity: v } : s)) })}
                  />
                </div>
              </div>
            ))}
            {bg.spots.length === 0 && <p className="text-xs text-ink-400 px-1">{t('scenePanel.noSpots')}</p>}
          </div>
        </>
      )}
    </div>
  );
}
