import { useEffect } from 'react';
import { useDrawingCanvas } from '../../hooks/useDrawingCanvas';
import type { PenColor } from '../../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../data/templates';

interface DrawingCanvasProps {
  enabled: boolean;
  color: PenColor;
  width: number;
  dataUrl: string | null;
  onDrawEnd: (dataUrl: string) => void;
  clearTrigger: number;
}

export function DrawingCanvas({
  enabled,
  color,
  width,
  dataUrl,
  onDrawEnd,
  clearTrigger,
}: DrawingCanvasProps) {
  const { canvasRef, clearCanvas } = useDrawingCanvas({
    enabled,
    color,
    width,
    initialDataUrl: dataUrl,
    onDrawEnd: (url) => onDrawEnd(url || ''),
  });

  useEffect(() => {
    if (clearTrigger > 0) {
      clearCanvas();
      onDrawEnd('');
    }
  }, [clearTrigger, clearCanvas, onDrawEnd]);

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-canvas ${enabled ? 'drawing-canvas--active' : ''}`}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
    />
  );
}
