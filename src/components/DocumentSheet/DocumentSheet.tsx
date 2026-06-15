import type { UseEditorStateReturn } from '../../hooks/useEditorState';
import { DocumentHeader } from '../DocumentHeader/DocumentHeader';
import { InteractiveText } from '../InteractiveText/InteractiveText';
import { DrawingCanvas } from '../DrawingCanvas/DrawingCanvas';
import { PlacedImageLayer } from '../PlacedImageLayer/PlacedImageLayer';

interface DocumentSheetProps {
  editor: UseEditorStateReturn;
  clearTrigger: number;
}

export function DocumentSheet({ editor, clearTrigger }: DocumentSheetProps) {
  const {
    document,
    fieldValues,
    drawingSettings,
    drawingDataUrl,
    placedImages,
    updateFieldValue,
    setDrawingDataUrl,
    updatePlacedImage,
    removePlacedImage,
  } = editor;

  return (
    <div className="document-sheet">
      <DocumentHeader document={document} />

      <div className="document-sheet__body">
        <InteractiveText
          text={document.body}
          fieldValues={fieldValues}
          onFieldChange={updateFieldValue}
        />
      </div>

      <PlacedImageLayer
        images={placedImages}
        onUpdate={updatePlacedImage}
        onRemove={removePlacedImage}
      />

      <DrawingCanvas
        enabled={drawingSettings.enabled}
        color={drawingSettings.color}
        width={drawingSettings.width}
        dataUrl={drawingDataUrl}
        onDrawEnd={(url) => setDrawingDataUrl(url || null)}
        clearTrigger={clearTrigger}
      />
    </div>
  );
}
