export type DocumentTemplateId =
  | 'power-of-attorney'
  | 'application'
  | 'contract'
  | 'blank';

export interface DocumentTemplate {
  id: DocumentTemplateId;
  label: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface DocumentState {
  templateId: DocumentTemplateId;
  title: string;
  subtitle: string;
  city: string;
  date: string;
  body: string;
  emblemSrc: string | null;
  useDefaultEmblem: boolean;
}

export type PenColor = '#1a73e8' | '#000000' | '#d93025' | '#188038';

export interface DrawingSettings {
  enabled: boolean;
  color: PenColor;
  width: number;
}

export interface PlacedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface FieldValue {
  id: string;
  value: string;
}

export interface EditorState {
  document: DocumentState;
  fieldValues: Record<string, string>;
  drawingSettings: DrawingSettings;
  drawingDataUrl: string | null;
  placedImages: PlacedImage[];
}
