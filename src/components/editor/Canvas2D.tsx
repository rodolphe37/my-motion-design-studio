import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, RegularPolygon, Star as KStar, Image as KImage, Circle } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/store';
import { getLayerAtTime } from '@/lib/animation';
import type { ShapeLayer, TextLayer, ImageLayer, Layer as LayerType, BackgroundFill } from '@/lib/types';

let measureCtx: CanvasRenderingContext2D | null | undefined;
// Konva.Text auto-sizes to its content with no explicit width; we replicate
// that measurement so rotation can pivot around the text's actual center
// instead of an assumed one.
function measureTextWidth(text: string, fontSize: number, fontFamily: string, fontWeight: number): number {
  if (measureCtx === undefined) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  if (!measureCtx) return text.length * fontSize * 0.55;
  measureCtx.font = `${fontWeight >= 700 ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
}

function SceneBackground({
  fill, x, y, width, height, scale,
}: { fill: BackgroundFill; x: number; y: number; width: number; height: number; scale: number }) {
  if (fill.type === 'gradient') {
    const rad = (fill.angle * Math.PI) / 180;
    const cx = width / 2, cy = height / 2;
    const dx = Math.cos(rad) * cx, dy = Math.sin(rad) * cy;
    return (
      <Rect
        x={x} y={y} width={width} height={height}
        fillLinearGradientStartPoint={{ x: cx - dx, y: cy - dy }}
        fillLinearGradientEndPoint={{ x: cx + dx, y: cy + dy }}
        fillLinearGradientColorStops={[0, fill.from, 1, fill.to]}
        shadowColor="black" shadowBlur={20} shadowOpacity={0.5}
      />
    );
  }
  if (fill.type === 'spots') {
    return (
      <>
        <Rect x={x} y={y} width={width} height={height} fill={fill.base} shadowColor="black" shadowBlur={20} shadowOpacity={0.5} />
        {fill.spots.map((spot, i) => {
          const r = spot.radius * scale;
          return (
            <Circle
              key={i}
              x={x + spot.x * scale}
              y={y + spot.y * scale}
              radius={r}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndRadius={r}
              fillRadialGradientColorStops={[0, spot.color, 1, 'rgba(0,0,0,0)']}
              opacity={spot.opacity}
              listening={false}
            />
          );
        })}
      </>
    );
  }
  return <Rect x={x} y={y} width={width} height={height} fill={fill.color} shadowColor="black" shadowBlur={20} shadowOpacity={0.5} />;
}

function useLoadedImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return image;
}

function LayerImage(props: {
  layerId: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  src: string;
  draggable: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}) {
  const image = useLoadedImage(props.src);
  return (
    <KImage
      image={image ?? undefined}
      x={props.centerX}
      y={props.centerY}
      offsetX={props.width / 2}
      offsetY={props.height / 2}
      width={props.width}
      height={props.height}
      rotation={props.rotation}
      opacity={props.opacity}
      draggable={props.draggable}
      onClick={props.onSelect}
      onTap={props.onSelect}
      onDragEnd={props.onDragEnd}
    />
  );
}

export function Canvas2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const project = useEditorStore((s) => s.project);
  const currentSceneId = useEditorStore((s) => s.currentSceneId);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const zoom = useEditorStore((s) => s.zoom);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setCanvasViewport = useEditorStore((s) => s.setCanvasViewport);

  const stageScale = project
    ? Math.min(size.width / project.settings.width, size.height / project.settings.height) * zoom * 0.85
    : 1;
  const offsetX = project ? (size.width - project.settings.width * stageScale) / 2 : 0;
  const offsetY = project ? (size.height - project.settings.height * stageScale) / 2 : 0;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Playback loop. currentTime/setCurrentTime are deliberately excluded from
  // the deps: the start time is captured once per play session, and each
  // frame computes elapsed-since-start. Including currentTime here would
  // restart this effect on every frame (since it calls setCurrentTime),
  // stacking overlapping rAF loops and fast-forwarding playback.
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

  // Report the on-screen content rect (excluding letterbox padding) so export
  // can crop to it instead of stretching the whole padded canvas.
  useEffect(() => {
    if (!project) return;
    setCanvasViewport({ offsetX, offsetY, scale: stageScale });
  }, [project, offsetX, offsetY, stageScale, setCanvasViewport]);

  if (!project) return null;

  const scene = project.scenes.find((s) => s.id === currentSceneId);
  if (!scene) return null;

  const time = isPlaying ? currentTime : currentTime;

  const handleDragEnd = (layer: LayerType, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    updateLayer(layer.id, { x: (node.x() - offsetX) / stageScale, y: (node.y() - offsetY) / stageScale } as Partial<LayerType>);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#2b2b34 1px, transparent 1px), linear-gradient(90deg, #2b2b34 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) selectLayer(null);
        }}
      >
        <Layer>
          {/* Background */}
          <SceneBackground
            fill={scene.background ?? { type: 'solid', color: project.settings.backgroundColor }}
            x={offsetX}
            y={offsetY}
            width={project.settings.width * stageScale}
            height={project.settings.height * stageScale}
            scale={stageScale}
          />

          {/* Layers */}
          {scene.layers.filter((l) => l.visible).map((layer) => {
            const animated = getLayerAtTime(layer, time) as ShapeLayer | TextLayer | ImageLayer;
            const isSelected = selectedLayerIds.includes(layer.id);
            const lx = offsetX + animated.x * stageScale;
            const ly = offsetY + animated.y * stageScale;
            const scale = stageScale;

            if (layer.type === 'shape') {
              const s = animated as ShapeLayer;
              if (s.shape === 'rectangle') {
                const rw = s.width * scale, rh = s.height * scale;
                return (
                  <Rect
                    key={layer.id}
                    x={lx + rw / 2}
                    y={ly + rh / 2}
                    offsetX={rw / 2}
                    offsetY={rh / 2}
                    width={rw}
                    height={rh}
                    rotation={s.rotation}
                    cornerRadius={s.cornerRadius * scale}
                    fill={s.fill}
                    stroke={s.strokeWidth > 0 ? s.stroke : undefined}
                    strokeWidth={s.strokeWidth * scale}
                    opacity={s.opacity}
                    draggable={!layer.locked}
                    onClick={() => selectLayer(layer.id)}
                    onTap={() => selectLayer(layer.id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateLayer(layer.id, { x: (node.x() - offsetX) / scale - s.width / 2, y: (node.y() - offsetY) / scale - s.height / 2 } as Partial<LayerType>);
                    }}
                    strokeEnabled={isSelected}
                    strokeScaleEnabled={false}
                  />
                );
              }
              if (s.shape === 'ellipse') {
                return (
                  <Ellipse
                    key={layer.id}
                    x={lx + (s.width * scale) / 2}
                    y={ly + (s.height * scale) / 2}
                    radiusX={(s.width * scale) / 2}
                    radiusY={(s.height * scale) / 2}
                    rotation={s.rotation}
                    fill={s.fill}
                    stroke={s.strokeWidth > 0 ? s.stroke : undefined}
                    strokeWidth={s.strokeWidth * scale}
                    opacity={s.opacity}
                    draggable={!layer.locked}
                    onClick={() => selectLayer(layer.id)}
                    onTap={() => selectLayer(layer.id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateLayer(layer.id, { x: (node.x() - offsetX) / scale, y: (node.y() - offsetY) / scale } as Partial<LayerType>);
                    }}
                  />
                );
              }
              if (s.shape === 'line') {
                return (
                  <Line
                    key={layer.id}
                    points={[lx, ly, lx + s.width * scale, ly]}
                    stroke={s.fill}
                    strokeWidth={Math.max(2, s.strokeWidth * scale)}
                    rotation={s.rotation}
                    opacity={s.opacity}
                    draggable={!layer.locked}
                    onClick={() => selectLayer(layer.id)}
                    onDragEnd={(e) => handleDragEnd(layer, e)}
                  />
                );
              }
              if (s.shape === 'polygon') {
                return (
                  <RegularPolygon
                    key={layer.id}
                    x={lx + (s.width * scale) / 2}
                    y={ly + (s.height * scale) / 2}
                    sides={s.sides}
                    radius={(s.width * scale) / 2}
                    rotation={s.rotation}
                    fill={s.fill}
                    stroke={s.strokeWidth > 0 ? s.stroke : undefined}
                    strokeWidth={s.strokeWidth * scale}
                    opacity={s.opacity}
                    draggable={!layer.locked}
                    onClick={() => selectLayer(layer.id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateLayer(layer.id, { x: (node.x() - offsetX) / scale - s.width / 2, y: (node.y() - offsetY) / scale - s.height / 2 } as Partial<LayerType>);
                    }}
                  />
                );
              }
              if (s.shape === 'star') {
                return (
                  <KStar
                    key={layer.id}
                    x={lx + (s.width * scale) / 2}
                    y={ly + (s.height * scale) / 2}
                    numPoints={5}
                    innerRadius={(s.width * scale) / 4}
                    outerRadius={(s.width * scale) / 2}
                    rotation={s.rotation}
                    fill={s.fill}
                    opacity={s.opacity}
                    draggable={!layer.locked}
                    onClick={() => selectLayer(layer.id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      updateLayer(layer.id, { x: (node.x() - offsetX) / scale - s.width / 2, y: (node.y() - offsetY) / scale - s.height / 2 } as Partial<LayerType>);
                    }}
                  />
                );
              }
            }
            if (layer.type === 'image') {
              const im = animated as ImageLayer;
              const iw = im.width * scale, ih = im.height * scale;
              return (
                <LayerImage
                  key={layer.id}
                  layerId={layer.id}
                  src={im.src}
                  centerX={lx + iw / 2}
                  centerY={ly + ih / 2}
                  width={iw}
                  height={ih}
                  rotation={im.rotation}
                  opacity={im.opacity}
                  draggable={!layer.locked}
                  onSelect={() => selectLayer(layer.id)}
                  onDragEnd={(e) => {
                    const node = e.target;
                    updateLayer(layer.id, { x: (node.x() - offsetX) / scale - im.width / 2, y: (node.y() - offsetY) / scale - im.height / 2 } as Partial<LayerType>);
                  }}
                />
              );
            }
            if (layer.type === 'text') {
              const t = animated as TextLayer;
              const tw = measureTextWidth(t.text, t.fontSize, t.fontFamily, t.fontWeight) * scale;
              const th = t.fontSize * scale;
              return (
                <Text
                  key={layer.id}
                  x={lx + tw / 2}
                  y={ly + th / 2}
                  offsetX={tw / 2}
                  offsetY={th / 2}
                  text={t.text}
                  fontSize={t.fontSize * scale}
                  fontFamily={t.fontFamily}
                  fontStyle={t.fontWeight >= 700 ? 'bold' : 'normal'}
                  fill={t.fill}
                  rotation={t.rotation}
                  opacity={t.opacity}
                  align={t.align}
                  draggable={!layer.locked}
                  onClick={() => selectLayer(layer.id)}
                  onDragEnd={(e) => {
                    const node = e.target;
                    const twData = tw / scale;
                    const thData = th / scale;
                    updateLayer(layer.id, { x: (node.x() - offsetX) / scale - twData / 2, y: (node.y() - offsetY) / scale - thData / 2 } as Partial<LayerType>);
                  }}
                />
              );
            }
            return null;
          })}

          {/* Selection outline */}
          {selectedLayerIds.map((id) => {
            const layer = scene.layers.find((l) => l.id === id);
            if (!layer || layer.type === 'group') return null;
            const animated = getLayerAtTime(layer, time) as ShapeLayer | TextLayer | ImageLayer;
            const lx = offsetX + animated.x * stageScale;
            const ly = offsetY + animated.y * stageScale;
            const w = ('width' in animated
              ? (animated as ShapeLayer).width
              : measureTextWidth((animated as TextLayer).text, (animated as TextLayer).fontSize, (animated as TextLayer).fontFamily, (animated as TextLayer).fontWeight)
            ) * stageScale;
            const h = ('height' in animated ? (animated as ShapeLayer).height : (animated as TextLayer).fontSize) * stageScale;
            // Match the same center-pivot rotation used to render the shape
            // itself (Rect/Text/Image and Ellipse/Star/Polygon alike), so the
            // dashed outline stays aligned with the layer as it rotates.
            return (
              <Rect
                key={`sel-${id}`}
                x={lx + w / 2}
                y={ly + h / 2}
                offsetX={w / 2 + 2}
                offsetY={h / 2 + 2}
                width={w + 4}
                height={h + 4}
                rotation={animated.rotation}
                stroke="#8b5cf6"
                strokeWidth={2}
                dash={[4, 4]}
                listening={false}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
