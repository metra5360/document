import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  // Основні текстові поля документа
  const [docType, setDocType] = useState('ДОВІРЕНІСТЬ');
  const [docTitle, setDocTitle] = useState('на представництво інтересів');
  const [docDate, setDocDate] = useState('_____ 2026 року');
  const [docCity, setDocCity] = useState('м. _____');
  
  // Головне текстове наповнення бланка з використанням розумних полів "_____"
  const [docBody, setDocBody] = useState(
    `Я, громадянин України ________________________________________,\n` +
    `паспорт серії _____ № _____________, виданий ________________________________________,\n` +
    `надаю право громадянину ________________________________________\n` +
    `представляти мої інтереси та підписувати документи від мого імені.\n\n` +
    `Ця довіреність видана строком на _____ років.\n\n` +
    `Підпис довіреної особи: ___________________\n` +
    `Підпис довірителя: ___________________`
  );

  // Стан для завантаженого фото (зображення підпису або печатки)
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageSize, setImageSize] = useState(130); // розмір фото у пікселях
  const [imagePos, setImagePos] = useState({ x: 380, y: 620 }); // початкова позиція фото на бланку
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Стан для круглого значка/вибору
  const [showBadge, setShowBadge] = useState(true);
  const [badgeType, setBadgeType] = useState('standard'); // 'standard', 'custom'
  const [customBadgeUrl, setCustomBadgeUrl] = useState('');

  // СТАН ДЛЯ МАЛЮВАННЯ ВРУЧНУ
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#1d4ed8'); // Стартовий колір - класичний синій для чорнил
  const [brushWidth, setBrushWidth] = useState(3);
  const [strokes, setStrokes] = useState([]); // збережені лінії [[{x, y}, ...], ...]
  const [currentStroke, setCurrentStroke] = useState(null); // поточна лінія
  
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const badgeInputRef = useRef(null);

  // Малювання на полотні Canvas
  useEffect(() => {
    drawCanvas();
  }, [strokes, currentStroke]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 1130); // очищення віртуального полотна
    
    // Малюємо всі збережені лінії
    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Малюємо лінію, яка створюється прямо зараз
    if (currentStroke && currentStroke.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      ctx.stroke();
    }
  };

  // Розрахунок координат відносно віртуального А4 (800х1130)
  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 800;
    const y = ((clientY - rect.top) / rect.height) * 1130;
    return { x, y };
  };

  // Початок малювання
  const startDrawing = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);
    setCurrentStroke({
      color: brushColor,
      width: brushWidth,
      points: [coords]
    });
  };

  // Процес малювання
  const drawMove = (clientX, clientY) => {
    if (!currentStroke) return;
    const coords = getCanvasCoords(clientX, clientY);
    setCurrentStroke(prev => ({
      ...prev,
      points: [...prev.points, coords]
    }));
  };

  // Завершення лінії
  const stopDrawing = () => {
    if (currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  // Обробка миші для малювання
  const handleCanvasMouseDown = (e) => {
    if (!isDrawingMode) return;
    e.preventDefault();
    startDrawing(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawingMode || !currentStroke) return;
    e.preventDefault();
    drawMove(e.clientX, e.clientY);
  };

  // Обробка тач-подій для малювання на телефонах
  const handleCanvasTouchStart = (e) => {
    if (!isDrawingMode) return;
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      startDrawing(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!isDrawingMode || !currentStroke) return;
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      drawMove(touch.clientX, touch.clientY);
    }
  };

  // Очистити весь намальований підпис
  const clearDrawing = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  // Завантаження фото бланка/підпису
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Завантаження власного значка
  const handleBadgeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBadgeUrl(event.target.result);
        setBadgeType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop для картинок (тільки коли режим малювання вимкнено)
  const handleMouseDown = (e) => {
    if (isDrawingMode) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePos.x,
      y: e.clientY - imagePos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isDrawingMode) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const container = pageRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setImagePos({
        x: Math.max(0, Math.min(newX, rect.width - imageSize)),
        y: Math.max(0, Math.min(newY, rect.height - imageSize))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragStart, imagePos]);

  // Функція для перетворення "_____" на інтерактивні інпути для прев'ю
  const renderInteractiveText = (text) => {
    if (!text) return '';
    const parts = text.split(/(_{5,})/g);
    return parts.map((part, index) => {
      if (part.startsWith('_____')) {
        const widthPx = Math.max(80, part.length * 8);
        return (
          <input
            key={index}
            type="text"
            placeholder="заповнити..."
            style={{ width: `${widthPx}px` }}
            className="border-b border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 px-1 focus:bg-white text-slate-900 outline-none transition text-center mx-1 text-sm font-sans"
          />
        );
      }
      return part;
    });
  };

  // Розумний Експорт в Автономний Інтерактивний HTML-Документ з підтримкою малювання
  const handleSaveInteractiveDocument = () => {
    // Отримуємо поточний малюнок у форматі base64 png
    const canvas = canvasRef.current;
    const currentDrawingDataUrl = canvas ? canvas.toDataURL() : '';

    const convertToHtmlInputs = (rawText) => {
      if (!rawText) return '';
      let escaped = rawText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const regex = /(_{5,})/g;
      return escaped.replace(regex, (match) => {
        const width = Math.max(80, match.length * 8);
        return `<input type="text" placeholder="введіть дані..." style="width: ${width}px; border:none; border-bottom: 1px dashed #3b82f6; background-color: #eff6ff; text-align: center; font-family: sans-serif; font-size: 14px; padding: 0 4px; outline: none;" />`;
      });
    };

    const formattedBody = docBody.split('\n').map(line => convertToHtmlInputs(line)).join('<br>');
    const formattedType = convertToHtmlInputs(docType);
    const formattedTitle = convertToHtmlInputs(docTitle);
    const formattedCity = convertToHtmlInputs(docCity);
    const formattedDate = convertToHtmlInputs(docDate);

    const htmlContent = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docType || 'Документ'}</title>
  <style>
    body {
      background-color: #f1f5f9;
      margin: 0;
      padding: 20px;
      font-family: 'Courier New', Courier, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-user-select: none;
      user-select: none;
    }
    .panel {
      background-color: #1e293b;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      width: 100%;
      max-width: 210mm;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      font-family: sans-serif;
    }
    .panel-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .panel button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      transition: background 0.2s;
    }
    .panel button:hover {
      background-color: #1d4ed8;
    }
    .panel button.btn-danger {
      background-color: #ef4444;
    }
    .panel button.btn-danger:hover {
      background-color: #dc2626;
    }
    .panel button.active {
      background-color: #10b981;
      box-shadow: 0 0 0 2px #white;
    }
    #document-sheet {
      background-color: white;
      color: #0f172a;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      box-sizing: border-box;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      position: relative;
    }
    .header-block {
      display: flex;
      justify-content: space-between;
      align-items: start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .meta-line {
      display: flex;
      justify-content: space-between;
      font-family: sans-serif;
      font-weight: 600;
      color: #475569;
      margin-bottom: 30px;
    }
    .badge-box {
      width: 80px;
      height: 80px;
      border: 2px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8fafc;
      overflow: hidden;
    }
    .badge-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    #draggable-photo {
      position: absolute;
      left: ${imagePos.x}px;
      top: ${imagePos.y}px;
      width: ${imageSize}px;
      cursor: grab;
      user-select: none;
      z-index: 40;
    }
    #draggable-photo img {
      width: 100%;
      pointer-events: none;
      mix-blend-mode: multiply;
    }
    /* Полотна для малювання */
    #drawing-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      pointer-events: none; /* За замовчуванням кліки проходять крізь нього */
    }
    #drawing-canvas.active {
      pointer-events: auto; /* Вмикаємо кліки для малювання */
      cursor: crosshair;
    }
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
      font-family: sans-serif;
    }
    .color-picker {
      display: flex;
      gap: 5px;
    }
    .color-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #475569;
    }
    .color-dot.selected {
      border-color: white;
      transform: scale(1.1);
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .panel {
        display: none;
      }
      #document-sheet {
        box-shadow: none;
        border: none;
        padding: 20mm;
        margin: 0;
      }
      input {
        background-color: transparent !important;
        border-bottom: none !important;
      }
      input::placeholder {
        color: transparent;
      }
    }
  </style>
</head>
<body>

  <div class="panel">
    <div>
      <span style="font-weight: bold; font-size: 14px;">📄 Інтерактивний документ готовий</span>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Заповніть поля, увімкніть режим малювання для підпису або просто друкуйте</div>
    </div>
    
    <div class="panel-controls">
      <!-- Налаштування кольору -->
      <div class="color-picker">
        <div class="color-dot selected" style="background: #1d4ed8;" onclick="changeColor('#1d4ed8', this)"></div>
        <div class="color-dot" style="background: #000000;" onclick="changeColor('#000000', this)"></div>
        <div class="color-dot" style="background: #b91c1c;" onclick="changeColor('#b91c1c', this)"></div>
      </div>
      
      <button id="btn-draw" onclick="toggleDrawing()">✍️ Увімкнути малювання</button>
      <button class="btn-danger" onclick="clearCanvas()">🧹 Стерти малюнок</button>
      <button onclick="window.print()">🖨️ Зберегти в PDF</button>
    </div>
  </div>

  <div id="document-sheet">
    
    <div class="header-block">
      <div>
        <div style="font-size: 12px; color: #64748b; font-family: sans-serif; letter-spacing: 1px; font-weight: bold;">ВИД ДОКУМЕНТА:</div>
        <h2 style="font-family: sans-serif; font-size: 24px; font-weight: 800; margin: 4px 0; text-transform: uppercase;">${formattedType}</h2>
        <div style="font-family: sans-serif; font-style: italic; color: #334155; font-size: 14px; font-weight: 600;">${formattedTitle}</div>
      </div>
      
      ${showBadge ? `
      <div class="badge-box">
        ${badgeType === 'standard' ? `
          <div style="text-align: center; font-family: sans-serif;">
            <svg style="width:30px; height:30px; margin: 0 auto; color:#0f172a;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14.5h-2v-2h2v2zm0-3.5h-2V7h2v6z" />
            </svg>
            <div style="font-size: 8px; font-weight: bold; margin-top:2px;">ЗАТВЕРДЖЕНО</div>
          </div>
        ` : `
          <img src="${customBadgeUrl}" alt="Емблема" />
        `}
      </div>
      ` : ''}
    </div>

    <div class="meta-line">
      <span>${formattedCity}</span>
      <span>${formattedDate}</span>
    </div>

    <div style="font-size: 16px; line-height: 1.8; white-space: pre-wrap; color: #0f172a; min-height: 120mm; position: relative; z-index: 10;">${formattedBody}</div>

    ${uploadedImage ? `
    <div id="draggable-photo">
      <img src="${uploadedImage}" alt="Підпис" />
    </div>
    ` : ''}

    <!-- Полотно малювання -->
    <canvas id="drawing-canvas" width="800" height="1130"></canvas>

    <div class="footer">
      <span>Інтерактивний бланк</span>
      <span>Код форми: Б-002-INT</span>
    </div>

  </div>

  <script>
    // Ініціалізація полотна та збереженого малюнка
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    
    // Завантажуємо малюнок, який був на момент збереження
    const initialImgSrc = "${currentDrawingDataUrl}";
    if (initialImgSrc) {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialImgSrc;
    }

    let isDrawingMode = false;
    let isDrawing = false;
    let strokes = [];
    let currentStroke = null;
    let brushColor = '#1d4ed8';
    let brushWidth = 3;

    function toggleDrawing() {
      isDrawingMode = !isDrawingMode;
      const btn = document.getElementById('btn-draw');
      if (isDrawingMode) {
        canvas.classList.add('active');
        btn.classList.add('active');
        btn.innerText = "✍️ Режим малювання: Увімкнено";
      } else {
        canvas.classList.remove('active');
        btn.classList.remove('active');
        btn.innerText = "✍️ Увімкнути малювання";
      }
    }

    function changeColor(color, element) {
      brushColor = color;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
      element.classList.add('selected');
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, 800, 1130);
    }

    // Отримання координат
    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * 800,
        y: ((clientY - rect.top) / rect.height) * 1130
      };
    }

    function start(e) {
      if (!isDrawingMode) return;
      isDrawing = true;
      const coords = getCoords(e);
      ctx.beginPath();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(coords.x, coords.y);
    }

    function draw(e) {
      if (!isDrawing || !isDrawingMode) return;
      e.preventDefault();
      const coords = getCoords(e);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    function stop() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stop);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stop);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Інтерактивний_${docType.replace(/\s+/g, '_') || 'документ'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* ШАПКА */}
      <header className="bg-slate-800 border-b border-slate-700 py-4 px-6 sticky top-0 z-20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">Інтерактивний Бланк-Редактор</h1>
            <p className="text-xs text-slate-400">Пишіть «_____» для полів або малюйте прямо на бланку</p>
          </div>
        </div>

        <button
          onClick={handleSaveInteractiveDocument}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2"
        >
          📥 Зберегти інтерактивний файл на ПК
        </button>
      </header>

      {/* ОСНОВНА ЧАСТИНА */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ЛІВА ПАНЕЛЬ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Блок 1: Текстові дані */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-2">
              1. Текст та Заголовки
            </h2>
            
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Вид документа</label>
              <input
                type="text"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Підзаголовок документа</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Місто</label>
                <input
                  type="text"
                  value={docCity}
                  onChange={(e) => setDocCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Дата</label>
                <input
                  type="text"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-slate-400 font-semibold">Основний текст</label>
                <span className="text-[10px] text-amber-400 font-bold">Пишіть _____ для інпутів</span>
              </div>
              <textarea
                rows={10}
                value={docBody}
                onChange={(e) => setDocBody(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none text-white resize-y"
              />
            </div>
          </div>

          {/* Блок 2: Малювання від руки */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-700 pb-2">
              2. ✍️ Малювання від руки / Підпис
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${isDrawingMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'}`}
              >
                <span>{isDrawingMode ? '🟢 Режим малювання: УВІМКНЕНО' : '✍️ УВІМКНУТИ режим малювання'}</span>
              </button>

              {isDrawingMode && (
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-4">
                  {/* Вибір кольору */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Оберіть колір пера:</label>
                    <div className="flex gap-2">
                      {[
                        { name: 'Синій', hex: '#1d4ed8' },
                        { name: 'Чорний', hex: '#000000' },
                        { name: 'Червоний', hex: '#b91c1c' },
                        { name: 'Зелений', hex: '#15803d' }
                      ].map(color => (
                        <button
                          key={color.hex}
                          onClick={() => setBrushColor(color.hex)}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                          className={`w-7 h-7 rounded-full border-2 transition ${brushColor === color.hex ? 'border-white scale-110' : 'border-transparent opacity-75 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Товщина */}
                  <div>
                    <label className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Товщина лінії:</span>
                      <span className="font-mono">{brushWidth}px</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={brushWidth}
                      onChange={(e) => setBrushWidth(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={clearDrawing}
                className="w-full bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/40 py-2 rounded-lg text-xs font-semibold transition"
              >
                🧹 Стерти весь малюнок з бланка
              </button>
            </div>
          </div>

          {/* Блок 3: Фото та емблеми */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-slate-700 pb-2">
              3. Завантаження малюнків / Фото
            </h2>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border border-dashed border-slate-500"
              >
                📸 Накласти готове фото підпису/печатки
              </button>
            </div>

            {uploadedImage && (
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400">✓ Фото додано</span>
                  <button onClick={() => setUploadedImage(null)} className="text-red-400 hover:underline">Видалити</button>
                </div>
                <input
                  type="range"
                  min="50"
                  max="280"
                  value={imageSize}
                  onChange={(e) => setImageSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}
          </div>

        </div>

        {/* ПРАВА ПАНЕЛЬ */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          <div className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl mb-4 text-center">
            {isDrawingMode ? (
              <span className="text-emerald-400 font-bold">✍️ РЕЖИМ МАЛЮВАННЯ АКТИВНИЙ! Малюйте мишкою або пальцем прямо на білому аркуші.</span>
            ) : (
              <span>📝 <strong>Звичайний режим:</strong> заповнюйте поля, вводьте текст, перетягуйте завантажені фото.</span>
            )}
          </div>

          <div className="bg-slate-800 p-2 sm:p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl w-full flex justify-center overflow-x-auto">
            
            <div
              id="blank-a4"
              ref={pageRef}
              className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl relative flex flex-col justify-between"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                boxSizing: 'border-box'
              }}
            >
              
              {/* Шапка бланка */}
              <div>
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <div className="text-xs text-slate-400 tracking-wider font-sans font-bold">ВИД ДОКУМЕНТА:</div>
                    <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 font-sans flex items-center">
                      {renderInteractiveText(docType)}
                    </h2>
                    <div className="text-sm font-semibold text-slate-700 italic mt-1 font-sans">
                      {renderInteractiveText(docTitle)}
                    </div>
                  </div>

                  {showBadge && (
                    <div className="w-20 h-20 border-2 border-slate-900 rounded-full flex items-center justify-center p-1.5 bg-slate-50">
                      {badgeType === 'standard' ? (
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14.5h-2v-2h2v2zm0-3.5h-2V7h2v6z" />
                          </svg>
                          <span className="text-[7px] font-sans font-bold text-slate-800 uppercase block mt-1">ЗАТВЕРДЖЕНО</span>
                        </div>
                      ) : badgeType === 'custom' && customBadgeUrl ? (
                        <img 
                          src={customBadgeUrl} 
                          alt="Логотип" 
                          className="w-full h-full object-contain rounded-full" 
                        />
                      ) : (
                        <div className="text-[8px] font-sans text-center text-slate-400 font-bold">ЗНАК</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Місто та Дата */}
                <div className="flex justify-between items-center text-sm font-sans font-semibold text-slate-700 mb-8">
                  <span>{renderInteractiveText(docCity)}</span>
                  <span>{renderInteractiveText(docDate)}</span>
                </div>

                {/* Основний вміст бланка з інпутами */}
                <div 
                  className="whitespace-pre-wrap text-base leading-relaxed text-slate-900 relative z-10"
                  style={{ minHeight: '120mm' }}
                >
                  {docBody.split('\n').map((line, index) => (
                    <div key={index} className="min-h-[1.5rem]">
                      {renderInteractiveText(line)}
                    </div>
                  ))}
                </div>
              </div>

              {/* НАКЛАДЕНЕ ЗОБРАЖЕННЯ (ФОТО) */}
              {uploadedImage && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${imagePos.x}px`,
                    top: `${imagePos.y}px`,
                    width: `${imageSize}px`,
                    height: 'auto',
                    cursor: isDrawingMode ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                    zIndex: 30,
                  }}
                  onMouseDown={handleMouseDown}
                  className={`group select-none ${!isDrawingMode && 'hover:ring-1 hover:ring-slate-300'}`}
                >
                  <img
                    src={uploadedImage}
                    alt="Накладений малюнок"
                    className="w-full h-auto pointer-events-none opacity-95 mix-blend-multiply"
                    draggable="false"
                  />
                </div>
              )}

              {/* ПОЛОТНО ДЛЯ МАЛЮВАННЯ (Canvas) */}
              <canvas
                ref={canvasRef}
                width="800"
                height="1130"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={stopDrawing}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: isDrawingMode ? 50 : 5, // ставимо наверх тільки під час малювання
                  pointerEvents: isDrawingMode ? 'auto' : 'none'
                }}
              />

              {/* Футер бланка */}
              <div className="border-t border-slate-300 pt-4 flex justify-between items-center text-xs text-slate-400 font-sans">
                <span>Інтерактивний бланк</span>
                <span>Код форми: Б-002-INT</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      <footer className="bg-slate-800 border-t border-slate-700 py-4 text-center text-xs text-slate-500">
        <p>© 2026 Конструктор Інтерактивних Бланків з можливістю підпису.</p>
      </footer>
    </div>
  );
}