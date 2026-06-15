import { useRef, useState } from 'react';
import { DOCUMENT_TEMPLATES, PEN_COLORS } from '../../data/templates';
import type { UseEditorStateReturn } from '../../hooks/useEditorState';
import type { DocumentTemplateId } from '../../types';
import { generateId } from '../../utils/textParser';
import { exportToStandaloneHtml } from '../../utils/exportHtml';
import { downloadFile } from '../../utils/textParser';

interface ControlPanelProps {
  editor: UseEditorStateReturn;
  onClearDrawing: () => void;
}

export function ControlPanel({ editor, onClearDrawing }: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emblemInputRef = useRef<HTMLInputElement>(null);
  const [imageLabel, setImageLabel] = useState('Підпис');

  const {
    document,
    drawingSettings,
    applyTemplate,
    updateDocument,
    updateDrawingSettings,
    addPlacedImage,
    getState,
  } = editor;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      addPlacedImage({
        id: generateId(),
        src: reader.result as string,
        x: 120,
        y: 400,
        width: 150,
        height: 80,
        label: imageLabel,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEmblemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateDocument({
        emblemSrc: reader.result as string,
        useDefaultEmblem: false,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const html = exportToStandaloneHtml(getState());
    const filename = `${document.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    downloadFile(html, filename, 'text/html;charset=utf-8');
  };

  return (
    <aside className="control-panel">
      <div className="control-panel__header">
        <h1 className="control-panel__title">Бланк-Редактор</h1>
        <p className="control-panel__subtitle">Інтерактивні офіційні документи</p>
      </div>

      <section className="panel-section">
        <h2 className="panel-section__title">Тип документа</h2>
        <div className="template-grid">
          {DOCUMENT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              className={`template-btn ${document.templateId === tpl.id ? 'template-btn--active' : ''}`}
              onClick={() => applyTemplate(tpl.id as DocumentTemplateId)}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h2 className="panel-section__title">Шапка документа</h2>
        <label className="field">
          <span>Назва</span>
          <input
            type="text"
            value={document.title}
            onChange={(e) => updateDocument({ title: e.target.value.toUpperCase() })}
          />
        </label>
        <label className="field">
          <span>Підзаголовок</span>
          <input
            type="text"
            value={document.subtitle}
            onChange={(e) => updateDocument({ subtitle: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Місто</span>
          <input
            type="text"
            value={document.city}
            onChange={(e) => updateDocument({ city: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Дата</span>
          <input
            type="text"
            value={document.date}
            onChange={(e) => updateDocument({ date: e.target.value })}
          />
        </label>
        <div className="emblem-controls">
          <button
            className={`btn btn--secondary ${document.useDefaultEmblem ? 'btn--active' : ''}`}
            onClick={() => updateDocument({ useDefaultEmblem: true })}
          >
            Стандартна емблема
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => emblemInputRef.current?.click()}
          >
            Завантажити емблему
          </button>
          <input
            ref={emblemInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleEmblemUpload}
          />
        </div>
      </section>

      <section className="panel-section">
        <h2 className="panel-section__title">Текст документа</h2>
        <p className="panel-hint">
          Використовуйте <code>_____</code> для інтерактивних полів
        </p>
        <textarea
          className="body-textarea"
          value={document.body}
          onChange={(e) => updateDocument({ body: e.target.value })}
          rows={10}
        />
      </section>

      <section className="panel-section">
        <h2 className="panel-section__title">Малювання від руки</h2>
        <button
          className={`btn btn--toggle ${drawingSettings.enabled ? 'btn--active' : ''}`}
          onClick={() => updateDrawingSettings({ enabled: !drawingSettings.enabled })}
        >
          {drawingSettings.enabled ? '✏️ Малювання увімкнено' : '✏️ Увімкнути малювання'}
        </button>
        <div className="color-picker">
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              className={`color-swatch ${drawingSettings.color === c.value ? 'color-swatch--active' : ''}`}
              style={{ backgroundColor: c.value }}
              title={c.label}
              onClick={() => updateDrawingSettings({ color: c.value })}
            />
          ))}
        </div>
        <label className="field field--range">
          <span>Товщина пера: {drawingSettings.width} px</span>
          <input
            type="range"
            min={1}
            max={10}
            value={drawingSettings.width}
            onChange={(e) => updateDrawingSettings({ width: Number(e.target.value) })}
          />
        </label>
        <button className="btn btn--danger" onClick={onClearDrawing}>
          🗑️ Очистити малюнок
        </button>
      </section>

      <section className="panel-section">
        <h2 className="panel-section__title">Підпис / Печатка / Логотип</h2>
        <label className="field">
          <span>Тип зображення</span>
          <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)}>
            <option value="Підпис">Підпис</option>
            <option value="Печатка">Печатка</option>
            <option value="Логотип">Логотип</option>
          </select>
        </label>
        <button className="btn btn--secondary" onClick={() => fileInputRef.current?.click()}>
          📎 Завантажити зображення
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />
        <p className="panel-hint">Перетягуйте та змінюйте розмір на аркуші</p>
      </section>

      <section className="panel-section panel-section--export">
        <button className="btn btn--export" onClick={handleExport}>
          📥 Зберегти інтерактивний файл на ПК
        </button>
        <p className="panel-hint">
          Створює автономний HTML-файл з усіма стилями, полями та малюнком
        </p>
      </section>
    </aside>
  );
}
