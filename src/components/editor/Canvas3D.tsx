import { useRef, useEffect, useState, useMemo, Suspense, Component, type ReactNode } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera, OrthographicCamera, Text3D, Center, TransformControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { useEditorStore } from '@/lib/store';
import { getLayerAtTime } from '@/lib/animation';
import type { Layer, MeshLayer, LightLayer, Camera3DLayer, Text3DLayer, BackgroundFill } from '@/lib/types';

// A broken/invalid imported model file would otherwise throw during render
// and take down the whole 3D canvas — isolate each import so the rest of the
// scene (and the Calques panel, to delete the offending layer) stays usable.
class ImportErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// optimer_bold, not helvetiker: helvetiker's glyph set is ASCII+Greek only
// and silently renders accented Latin characters (é, à, ç…) as "?" — a
// dealbreaker for French UI text. optimer_bold covers Latin-1.
const TEXT3D_FONT = '/fonts/optimer_bold.typeface.json';

function drawBackgroundFill(ctx: CanvasRenderingContext2D, fill: BackgroundFill, width: number, height: number) {
  if (fill.type === 'gradient') {
    const rad = (fill.angle * Math.PI) / 180;
    const cx = width / 2, cy = height / 2;
    const dx = Math.cos(rad) * cx, dy = Math.sin(rad) * cy;
    const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    grad.addColorStop(0, fill.from);
    grad.addColorStop(1, fill.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (fill.type === 'spots') {
    ctx.fillStyle = fill.base;
    ctx.fillRect(0, 0, width, height);
    for (const spot of fill.spots) {
      const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, Math.max(1, spot.radius));
      grad.addColorStop(0, spot.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalAlpha = spot.opacity;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = fill.color;
  ctx.fillRect(0, 0, width, height);
}

// Three.js scene.background only accepts a Color or a Texture — a solid
// fill sets it directly (cheap, no GPU upload), while gradient/spots fills
// are rasterized once onto an offscreen canvas (same math as Canvas2D's
// SceneBackground) and uploaded as a CanvasTexture. Keyed on the fill's
// serialized value rather than its object identity, since the store clones
// the whole project on every edit — using identity would regenerate (and
// re-upload) the texture on every unrelated keystroke.
function SceneBackground3D({ fill, width, height }: { fill: BackgroundFill; width: number; height: number }) {
  const { scene } = useThree();
  const fillKey = JSON.stringify(fill);

  useEffect(() => {
    if (fill.type === 'solid') {
      scene.background = new THREE.Color(fill.color);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    if (ctx) drawBackgroundFill(ctx, fill, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
    return () => texture.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, fillKey, width, height]);

  return null;
}

export function Canvas3D() {
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const currentTime = useEditorStore((s) => s.currentTime);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const viewMode = useEditorStore((s) => s.viewMode);
  const isExporting = useEditorStore((s) => s.isExporting);
  const transformMode = useEditorStore((s) => s.transformMode);
  const updateLayer = useEditorStore((s) => s.updateLayer);

  // currentTime/setCurrentTime deliberately excluded from deps — see the
  // identical fix and rationale in Canvas2D.tsx.
  useEffect(() => {
    if (!isPlaying || !project) return;
    const scene = project.scenes.find((s) => s.id === currentSceneId);
    if (!scene) return;
    let raf = 0;
    const start = performance.now();
    const startTime = currentTime;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setCurrentTime(Math.min(startTime + elapsed, scene.duration));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentSceneId, project]);

  if (!project) return null;
  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  const time = currentTime;
  const background: BackgroundFill = scene.background ?? { type: 'solid', color: project.settings.backgroundColor };

  // Find camera layer — evaluated at the current time so its keyframes
  // (position/rotation/fov…) actually animate instead of showing the static
  // base values.
  const staticCameraLayer = scene.layers.find((l) => l.type === 'camera3d') as Camera3DLayer | undefined;
  const cameraLayer = staticCameraLayer ? (getLayerAtTime(staticCameraLayer, time) as Camera3DLayer) : undefined;

  return (
    <div className="w-full h-full relative">
      <Canvas
        // R3F's boolean shadows shorthand sets shadowMap.type to the now-
        // deprecated PCFSoftShadowMap (three.js warns and silently falls
        // back to PCFShadowMap every frame). Request PCFShadowMap directly
        // via the "percentage" preset to get the same look without the
        // console spam.
        shadows={project.settings.shadows ? 'percentage' : false}
        // MSAA roughly doubles GPU cost per frame; skip it while exporting
        // (real-time capture is already fighting for frame budget) — video
        // compression smooths hard edges anyway.
        gl={{ preserveDrawingBuffer: true, antialias: !isExporting }}
        dpr={isExporting ? 1 : undefined}
        onPointerMissed={() => selectLayer(null)}
      >
        <SceneBackground3D fill={background} width={project.settings.width} height={project.settings.height} />
        {project.settings.environment === 'gradient' && (
          <Environment preset="city" background={false} />
        )}
        {project.settings.environment === 'hdri' && (
          <Environment preset="studio" background={false} />
        )}

        {/* Camera */}
        {cameraLayer ? (
          cameraLayer.orthographic ? (
            <OrthographicCamera
              makeDefault
              position={[cameraLayer.position.x, cameraLayer.position.y, cameraLayer.position.z]}
              rotation={[cameraLayer.rotation.x, cameraLayer.rotation.y, cameraLayer.rotation.z]}
              near={cameraLayer.near}
              far={cameraLayer.far}
              zoom={100}
            />
          ) : (
            <PerspectiveCamera
              makeDefault
              position={[cameraLayer.position.x, cameraLayer.position.y, cameraLayer.position.z]}
              rotation={[cameraLayer.rotation.x, cameraLayer.rotation.y, cameraLayer.rotation.z]}
              fov={cameraLayer.fov}
              near={cameraLayer.near}
              far={cameraLayer.far}
            />
          )
        ) : (
          <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        )}

        {/* Default lighting if no light layers */}
        {!scene.layers.some((l) => l.type === 'light') && (
          <>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          </>
        )}

        {/* Lights */}
        {scene.layers.filter((l) => l.type === 'light' && l.visible).map((layer) => {
          const l = getLayerAtTime(layer, time) as LightLayer;
          if (l.light === 'ambient') return <ambientLight key={l.id} intensity={l.intensity} color={l.color} />;
          if (l.light === 'directional') return (
            <directionalLight
              key={l.id}
              position={[l.position.x, l.position.y, l.position.z]}
              intensity={l.intensity}
              color={l.color}
              castShadow={project.settings.shadows}
            />
          );
          if (l.light === 'point') return (
            <pointLight
              key={l.id}
              position={[l.position.x, l.position.y, l.position.z]}
              intensity={l.intensity}
              color={l.color}
              distance={l.distance || 0}
              // Point-light shadows render a full 6-face cubemap pass each —
              // several of these at once tanks frame time. Point lights are
              // typically fill/accent lights, not the primary shadow source
              // (that's the directional/spot light), so they don't cast.
              castShadow={false}
            />
          );
          if (l.light === 'spot') return (
            <spotLight
              key={l.id}
              position={[l.position.x, l.position.y, l.position.z]}
              intensity={l.intensity}
              color={l.color}
              angle={l.angle}
              castShadow={project.settings.shadows}
            />
          );
          return null;
        })}

        {/* Meshes */}
        {scene.layers.filter((l) => l.type === 'mesh' && l.visible).map((layer) => {
          const m = getLayerAtTime(layer, time) as MeshLayer;
          const isSelected = selectedLayerIds.includes(m.id);
          if (m.mesh === 'imported' && m.src) {
            return (
              <ImportErrorBoundary key={m.id}>
                <Suspense fallback={null}>
                  <ImportedMeshObject
                    layer={m}
                    selected={isSelected}
                    onSelect={() => selectLayer(m.id)}
                    showShadows={project.settings.shadows}
                  />
                </Suspense>
              </ImportErrorBoundary>
            );
          }
          return (
            <MeshObject
              key={m.id}
              layer={m}
              selected={isSelected}
              onSelect={() => selectLayer(m.id)}
              showShadows={project.settings.shadows}
            />
          );
        })}

        {/* Text 3D */}
        {scene.layers.filter((l) => l.type === 'text3d' && l.visible).map((layer) => {
          const t = getLayerAtTime(layer, time) as Text3DLayer;
          const isSelected = selectedLayerIds.includes(t.id);
          return (
            <Text3DObject
              key={t.id}
              layer={t}
              selected={isSelected}
              onSelect={() => selectLayer(t.id)}
              showShadows={project.settings.shadows}
            />
          );
        })}

        {/* Reference grid: editor-only. It's a real scene object, not an HTML
            overlay, so it must be hidden in Preview mode and during export or
            it gets baked into the rendered video. */}
        {viewMode === 'editor' && !isExporting && (
          <Grid
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#2b2b34"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#3a3a45"
            fadeDistance={30}
            fadeStrength={1}
            position={[0, -0.01, 0]}
          />
        )}

        {/* Transform gizmo: drags the current selection directly in the
            viewport. TransformControls auto-disables the (makeDefault)
            OrbitControls for the duration of the drag via its own
            dragging-changed listener, so the two never fight over input. */}
        {viewMode === 'editor' && !isPlaying && !isExporting && transformMode && selectedLayerIds.length === 1 && (() => {
          const selected = scene.layers.find((l) => l.id === selectedLayerIds[0]);
          if (!selected || !selected.visible || (selected.type !== 'mesh' && selected.type !== 'text3d')) return null;
          return <SelectionGizmo key={selected.id} layerId={selected.id} mode={transformMode} onCommit={updateLayer} />;
        })()}

        {/* OrbitControls recomputes camera position from its own internal
            spherical state every frame, silently overriding any animated
            camera3d layer. Only mount it in the editor viewport while
            paused — never in Preview or during export, or it hijacks the
            authored camera3d layer and the rendered video no longer shows
            what was actually set up in the scene. */}
        {viewMode === 'editor' && !isPlaying && !isExporting && <OrbitControls makeDefault enableDamping dampingFactor={0.1} />}
      </Canvas>
    </div>
  );
}

// Looks the selected object up by name (set to the layer id on its mesh/group
// below) rather than threading refs down through three separate object
// components — TransformControls attaches directly to the live Object3D and
// drives it every frame while dragging, so the store is only updated once,
// on mouseUp, to avoid flooding undo history with per-frame writes.
function SelectionGizmo({ layerId, mode, onCommit }: { layerId: string; mode: 'translate' | 'rotate' | 'scale'; onCommit: (id: string, patch: Partial<Layer>) => void }) {
  const { scene } = useThree();
  const [target, setTarget] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    setTarget(scene.getObjectByName(layerId) ?? null);
  }, [scene, layerId]);

  if (!target) return null;

  return (
    <TransformControls
      object={target}
      mode={mode}
      onMouseUp={() => {
        onCommit(layerId, {
          position: { x: target.position.x, y: target.position.y, z: target.position.z },
          rotation: { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          scale: { x: target.scale.x, y: target.scale.y, z: target.scale.z },
        } as Partial<Layer>);
      }}
    />
  );
}

function MeshObject({ layer, selected, onSelect, showShadows }: { layer: MeshLayer; selected: boolean; onSelect: () => void; showShadows: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    switch (layer.mesh) {
      case 'box': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'plane': return <planeGeometry args={[1, 1]} />;
      case 'torus': return <torusGeometry args={[0.4, 0.15, 16, 32]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [layer.mesh]);

  return (
    <mesh
      ref={meshRef}
      name={layer.id}
      position={[layer.position.x, layer.position.y, layer.position.z]}
      rotation={[layer.rotation.x, layer.rotation.y, layer.rotation.z]}
      scale={[layer.scale.x, layer.scale.y, layer.scale.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      castShadow={showShadows && layer.castShadow}
      receiveShadow={showShadows}
    >
      {geometry}
      <meshStandardMaterial
        color={layer.color}
        metalness={layer.metalness}
        roughness={layer.roughness}
        opacity={layer.opacity}
        transparent={layer.opacity < 1}
        emissive={selected ? '#8b5cf6' : '#000000'}
        emissiveIntensity={selected ? 0.2 : 0}
      />
      {selected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </mesh>
  );
}

function ImportedMeshObject({ layer, selected, onSelect, showShadows }: { layer: MeshLayer; selected: boolean; onSelect: () => void; showShadows: boolean }) {
  const format = layer.importedFormat ?? 'gltf';
  // useLoader caches by (loader, url) — clone before mutating so tweaking
  // shadows/opacity on one instance can't bleed into others sharing the file.
  const loaded = useLoader(format === 'obj' ? OBJLoader : GLTFLoader, layer.src!);
  const root = useMemo(() => {
    const source = format === 'obj' ? (loaded as THREE.Group) : (loaded as { scene: THREE.Group }).scene;
    const clone = source.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = showShadows && layer.castShadow;
        child.receiveShadow = showShadows;
        const mats = (Array.isArray(child.material) ? child.material : [child.material]).map((mat) => mat.clone());
        if (layer.opacity < 1) {
          mats.forEach((mat) => {
            mat.transparent = true;
            mat.opacity = layer.opacity;
          });
        }
        child.material = mats.length === 1 ? mats[0] : mats;
      }
    });
    return clone;
  }, [loaded, format, showShadows, layer.castShadow, layer.opacity]);

  const bbox = useMemo(() => new THREE.Box3().setFromObject(root), [root]);
  const size = useMemo(() => bbox.getSize(new THREE.Vector3()), [bbox]);
  const center = useMemo(() => bbox.getCenter(new THREE.Vector3()), [bbox]);

  return (
    <group
      name={layer.id}
      position={[layer.position.x, layer.position.y, layer.position.z]}
      rotation={[layer.rotation.x, layer.rotation.y, layer.rotation.z]}
      scale={[layer.scale.x, layer.scale.y, layer.scale.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <primitive object={root} />
      {selected && (
        <mesh position={[center.x, center.y, center.z]}>
          <boxGeometry args={[Math.max(size.x, 0.01) * 1.05, Math.max(size.y, 0.01) * 1.05, Math.max(size.z, 0.01) * 1.05]} />
          <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function Text3DObject({ layer, selected, onSelect, showShadows }: { layer: Text3DLayer; selected: boolean; onSelect: () => void; showShadows: boolean }) {
  return (
    <group
      name={layer.id}
      position={[layer.position.x, layer.position.y, layer.position.z]}
      rotation={[layer.rotation.x, layer.rotation.y, layer.rotation.z]}
      scale={[layer.scale.x, layer.scale.y, layer.scale.z]}
    >
      <Center>
        <Text3D
          font={TEXT3D_FONT}
          size={layer.fontSize}
          height={layer.height}
          curveSegments={6}
          bevelEnabled
          bevelThickness={layer.height * 0.15}
          bevelSize={layer.height * 0.08}
          bevelSegments={2}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          castShadow={showShadows}
          receiveShadow={showShadows}
        >
          {layer.text}
          <meshStandardMaterial
            color={layer.color}
            metalness={0.3}
            roughness={0.4}
            opacity={layer.opacity}
            transparent={layer.opacity < 1}
            emissive={selected ? '#8b5cf6' : '#000000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </Text3D>
      </Center>
    </group>
  );
}
