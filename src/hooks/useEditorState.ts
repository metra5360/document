import { useCallback, useState } from 'react';
import type { DocumentState, DrawingSettings, EditorState, PlacedImage } from '../types';
import { DOCUMENT_TEMPLATES } from '../data/templates';
import { formatDateUk } from '../utils/textParser';

const defaultTemplate = DOCUMENT_TEMPLATES[0];

function createInitialDocument(): DocumentState {
  return {
    templateId: defaultTemplate.id,
    title: defaultTemplate.title,
    subtitle: defaultTemplate.subtitle,
    city: 'м. Київ',
    date: formatDateUk(),
    body: defaultTemplate.body,
    emblemSrc: null,
    useDefaultEmblem: true,
  };
}

export function useEditorState() {
  const [document, setDocument] = useState<DocumentState>(createInitialDocument);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    enabled: false,
    color: '#1a73e8',
    width: 3,
  });
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);

  const applyTemplate = useCallback((templateId: DocumentState['templateId']) => {
    const template = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setDocument((prev) => ({
      ...prev,
      templateId,
      title: template.title,
      subtitle: template.subtitle,
      body: template.body,
    }));
    setFieldValues({});
  }, []);

  const updateDocument = useCallback((updates: Partial<DocumentState>) => {
    setDocument((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateFieldValue = useCallback((fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const updateDrawingSettings = useCallback((updates: Partial<DrawingSettings>) => {
    setDrawingSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addPlacedImage = useCallback((image: PlacedImage) => {
    setPlacedImages((prev) => [...prev, image]);
  }, []);

  const updatePlacedImage = useCallback((id: string, updates: Partial<PlacedImage>) => {
    setPlacedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    );
  }, []);

  const removePlacedImage = useCallback((id: string) => {
    setPlacedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearDrawing = useCallback(() => {
    setDrawingDataUrl(null);
  }, []);

  const getState = useCallback(
    (): EditorState => ({
      document,
      fieldValues,
      drawingSettings,
      drawingDataUrl,
      placedImages,
    }),
    [document, fieldValues, drawingSettings, drawingDataUrl, placedImages],
  );

  return {
    document,
    fieldValues,
    drawingSettings,
    drawingDataUrl,
    placedImages,
    applyTemplate,
    updateDocument,
    updateFieldValue,
    updateDrawingSettings,
    setDrawingDataUrl,
    addPlacedImage,
    updatePlacedImage,
    removePlacedImage,
    clearDrawing,
    getState,
  };
}

export type UseEditorStateReturn = ReturnType<typeof useEditorState>;
