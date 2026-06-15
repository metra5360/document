import { parseInteractiveText } from '../../utils/textParser';

interface InteractiveTextProps {
  text: string;
  fieldValues: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  editable?: boolean;
}

export function InteractiveText({
  text,
  fieldValues,
  onFieldChange,
  editable = true,
}: InteractiveTextProps) {
  const segments = parseInteractiveText(text);

  return (
    <div className="interactive-text">
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>;
        }

        return (
          <input
            key={seg.fieldId}
            className="field-input"
            type="text"
            value={fieldValues[seg.fieldId!] ?? ''}
            onChange={(e) => onFieldChange(seg.fieldId!, e.target.value)}
            placeholder="..."
            readOnly={!editable}
          />
        );
      })}
    </div>
  );
}
