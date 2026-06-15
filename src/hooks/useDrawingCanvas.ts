import { useCallback, useEffect, useRef } from 'react';
import type { PenColor } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../data/templates';

interface UseDrawingCanvasOptions {
  enabled: boolean;
  color: PenColor;
  width: number;
  initialDataUrl: string | null;
  onDrawEnd: (dataUrl: string) => void;
}

export function useDrawingCanvas({
  enabled,
  color,
  width,
  initialDataUrl,
  onDrawEnd,
}: UseDrawingCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const onDrawEndRef = useRef(onDrawEnd);
  onDrawEndRef.current = onDrawEnd;

  const getPosition = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onDrawEndRef.current(canvas.toDataURL('image/png'));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = initialDataUrl;
    } else {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [initialDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      lastPoint.current = getPosition(e, canvas);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();

      const pos = getPosition(e, canvas);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);

      const midX = (lastPoint.current.x + pos.x) / 2;
      const midY = (lastPoint.current.y + pos.y) / 2;
      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
      ctx.stroke();

      lastPoint.current = pos;
    };

    const endDraw = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      saveCanvas();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseleave', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDraw);
    };
  }, [enabled, color, width, getPosition, saveCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    onDrawEndRef.current('');
  }, []);

  return { canvasRef, clearCanvas };
}
