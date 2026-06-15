import { useState } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { DocumentSheet } from './components/DocumentSheet/DocumentSheet';
import './App.css';

export default function App() {
  const editor = useEditorState();
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClearDrawing = () => {
    editor.clearDrawing();
    setClearTrigger((n) => n + 1);
  };

  return (
    <div className="app">
      <ControlPanel editor={editor} onClearDrawing={handleClearDrawing} />
      <main className="preview-area">
        <div className="preview-area__toolbar">
          <span className="preview-badge">Попередній перегляд A4</span>
          <span className="preview-size">210 × 297 мм</span>
        </div>
        <div className="preview-area__scroll">
          <DocumentSheet editor={editor} clearTrigger={clearTrigger} />
        </div>
      </main>
    </div>
  );
}
