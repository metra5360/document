import { useEffect } from 'react';
import type { PlacedImage } from '../../types';
import { useImageDrag } from '../../hooks/useImageDrag';

interface PlacedImageLayerProps {
  images: PlacedImage[];
  onUpdate: (id: string, updates: Partial<PlacedImage>) => void;
  onRemove: (id: string) => void;
}

export function PlacedImageLayer({ images, onUpdate, onRemove }: PlacedImageLayerProps) {
  const { startDrag, startResize, handleMove, handleEnd, activeId } = useImageDrag(onUpdate);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e);
    const onTouchMove = (e: TouchEvent) => handleMove(e);
    const onEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <>
      {images.map((img) => (
        <div
          key={img.id}
          className={`placed-image-wrapper ${activeId === img.id ? 'placed-image-wrapper--active' : ''}`}
          style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
        >
          <img
            className="placed-image"
            src={img.src}
            alt={img.label}
            draggable={false}
            onMouseDown={(e) => startDrag(e, img)}
            onTouchStart={(e) => startDrag(e, img)}
          />
          <button
            className="placed-image__remove"
            onClick={() => onRemove(img.id)}
            title="Видалити"
          >
            ×
          </button>
          <div
            className="placed-image__resize"
            onMouseDown={(e) => startResize(e, img)}
            onTouchStart={(e) => startResize(e, img)}
          />
        </div>
      ))}
    </>
  );
}
