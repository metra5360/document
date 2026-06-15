import { useCallback, useRef, useState } from 'react';
import type { PlacedImage } from '../types';

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface ResizeState {
  id: string;
  startX: number;
  startY: number;
  origWidth: number;
  origHeight: number;
}

export function useImageDrag(
  onUpdate: (id: string, updates: Partial<PlacedImage>) => void,
) {
  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, image: PlacedImage) => {
      e.stopPropagation();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        id: image.id,
        startX: clientX,
        startY: clientY,
        origX: image.x,
        origY: image.y,
      };
      setActiveId(image.id);
    },
    [],
  );

  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent, image: PlacedImage) => {
      e.stopPropagation();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      resizeRef.current = {
        id: image.id,
        startX: clientX,
        startY: clientY,
        origWidth: image.width,
        origHeight: image.height,
      };
      setActiveId(image.id);
    },
    [],
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (dragRef.current) {
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;
        onUpdate(dragRef.current.id, {
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        });
      }

      if (resizeRef.current) {
        const dx = clientX - resizeRef.current.startX;
        const dy = clientY - resizeRef.current.startY;
        const delta = Math.max(dx, dy);
        onUpdate(resizeRef.current.id, {
          width: Math.max(30, resizeRef.current.origWidth + delta),
          height: Math.max(30, resizeRef.current.origHeight + delta),
        });
      }
    },
    [onUpdate],
  );

  const handleEnd = useCallback(() => {
    dragRef.current = null;
    resizeRef.current = null;
    setActiveId(null);
  }, []);

  return { startDrag, startResize, handleMove, handleEnd, activeId };
}
