'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CanvasState, Layer as LayerType, TextLayer, ImageLayer, ShapeLayer } from '../../lib/utils/types';

// Dynamically import react-konva components to avoid SSR issues
const Stage = dynamic(() => import('react-konva').then(mod => ({ default: mod.Stage })), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => ({ default: mod.Layer })), { ssr: false });
const Text = dynamic(() => import('react-konva').then(mod => ({ default: mod.Text })), { ssr: false });
const Image = dynamic(() => import('react-konva').then(mod => ({ default: mod.Image })), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(mod => ({ default: mod.Rect })), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => ({ default: mod.Circle })), { ssr: false });
const RegularPolygon = dynamic(() => import('react-konva').then(mod => ({ default: mod.RegularPolygon })), { ssr: false });

interface KonvaCanvasProps {
  canvasState: CanvasState;
  updateCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  onLayerSelect?: (layerId: string | null) => void;
  onLayerUpdate?: (layerId: string, updates: Partial<LayerType>) => void;
}

export const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  canvasState,
  updateCanvasSize,
  setBackgroundColor,
  onLayerSelect,
  onLayerUpdate,
}) => {
  const stageRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle dynamic imports loading
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle canvas size updates
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.width(canvasState.width);
      stageRef.current.height(canvasState.height);
    }
  }, [canvasState.width, canvasState.height]);

  // Handle background color updates
  useEffect(() => {
    if (stageRef.current) {
      const layer = stageRef.current.findOne('Layer');
      if (layer) {
        layer.fill(canvasState.backgroundColor);
        stageRef.current.batchDraw();
      }
    }
  }, [canvasState.backgroundColor]);

  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      onLayerSelect?.(null);
      return;
    }

    const id = e.target.id();
    setSelectedId(id);
    onLayerSelect?.(id);
  };

  const handleDragEnd = (e: any, layerId: string) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    
    onLayerUpdate?.(layerId, { x: newX, y: newY });
  };

  const handleTransformEnd = (e: any, layerId: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    // Reset scale to 1 and adjust width/height instead
    node.scaleX(1);
    node.scaleY(1);
    
    const newWidth = Math.max(5, node.width() * scaleX);
    const newHeight = Math.max(5, node.height() * scaleY);
    
    onLayerUpdate?.(layerId, {
      width: newWidth,
      height: newHeight,
      rotation,
    });
  };

  const renderTextLayer = (layer: TextLayer) => (
    <Text
      key={layer.id}
      id={layer.id}
      x={layer.x}
      y={layer.y}
      text={layer.text}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontWeight={layer.fontWeight}
      fontStyle={layer.fontStyle}
      fill={layer.color}
      opacity={layer.opacity}
      rotation={layer.rotation}
      align={layer.textAlign}
      underline={layer.underline}
      linethrough={layer.linethrough}
      draggable
      zIndex={1000}
      onClick={() => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      }}
      onTap={() => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      }}
      onDragEnd={(e) => handleDragEnd(e, layer.id)}
      onTransformEnd={(e) => handleTransformEnd(e, layer.id)}
    />
  );

  const renderImageLayer = (layer: ImageLayer) => (
    <Image
      key={layer.id}
      id={layer.id}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
      rotation={layer.rotation}
      draggable
      zIndex={100}
      onClick={() => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      }}
      onTap={() => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      }}
      onDragEnd={(e) => handleDragEnd(e, layer.id)}
      onTransformEnd={(e) => handleTransformEnd(e, layer.id)}
      image={(() => {
        const img = new window.Image();
        img.src = layer.src;
        return img;
      })()}
    />
  );

  const renderShapeLayer = (layer: ShapeLayer) => {
    const commonProps = {
      key: layer.id,
      id: layer.id,
      x: layer.x,
      y: layer.y,
      opacity: layer.opacity,
      rotation: layer.rotation,
      draggable: true,
      zIndex: 100,
      onClick: () => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      },
      onTap: () => {
        setSelectedId(layer.id);
        onLayerSelect?.(layer.id);
      },
      onDragEnd: (e: any) => handleDragEnd(e, layer.id),
      onTransformEnd: (e: any) => handleTransformEnd(e, layer.id),
    };

    switch (layer.shapeType) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={layer.width}
            height={layer.height}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(layer.width, layer.height) / 2}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            {...commonProps}
            sides={3}
            radius={Math.min(layer.width, layer.height) / 2}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
          />
        );
      default:
        return null;
    }
  };

  const renderLayer = (layer: LayerType) => {
    switch (layer.type) {
      case 'text':
        return renderTextLayer(layer as TextLayer);
      case 'image':
        return renderImageLayer(layer as ImageLayer);
      case 'shape':
        return renderShapeLayer(layer as ShapeLayer);
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Stage
        ref={stageRef}
        width={canvasState.width}
        height={canvasState.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ border: '1px solid #e5e7eb' }}
      >
        <Layer name="Layer" fill={canvasState.backgroundColor}>
          {canvasState.layers.map(renderLayer)}
        </Layer>
      </Stage>
    </div>
  );
};
