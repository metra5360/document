import { FIELD_PLACEHOLDER } from '../data/templates';

export interface TextSegment {
  type: 'text' | 'field';
  content: string;
  fieldId?: string;
}

export function parseInteractiveText(text: string): TextSegment[] {
  const parts = text.split(FIELD_PLACEHOLDER);
  const segments: TextSegment[] = [];

  parts.forEach((part, index) => {
    if (part) {
      segments.push({ type: 'text', content: part });
    }
    if (index < parts.length - 1) {
      segments.push({
        type: 'field',
        content: FIELD_PLACEHOLDER,
        fieldId: `field-${index}`,
      });
    }
  });

  return segments;
}

export function countFields(text: string): number {
  return (text.match(new RegExp(FIELD_PLACEHOLDER.replace(/_/g, '_'), 'g')) ?? []).length;
}

export function formatDateUk(date: Date = new Date()): string {
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
