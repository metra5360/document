import type { EditorState } from '../types';
import { DEFAULT_EMBLEM_SVG } from '../data/templates';
import { parseInteractiveText } from './textParser';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBodyHtml(body: string, fieldValues: Record<string, string>): string {
  const segments = parseInteractiveText(body);
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return escapeHtml(seg.content).replace(/\n/g, '<br>');
      }
      const value = fieldValues[seg.fieldId!] ?? '';
      return `<input class="field-input" type="text" data-field-id="${seg.fieldId}" value="${escapeHtml(value)}" placeholder="..." />`;
    })
    .join('');
}

function buildImagesHtml(images: EditorState['placedImages']): string {
  return images
    .map(
      (img) =>
        `<img class="placed-image" src="${img.src}" alt="${escapeHtml(img.label)}" style="left:${img.x}px;top:${img.y}px;width:${img.width}px;height:${img.height}px;" draggable="false" />`,
    )
    .join('\n');
}

export function exportToStandaloneHtml(state: EditorState): string {
  const { document: doc, fieldValues, drawingDataUrl, placedImages } = state;
  const emblemSrc = doc.useDefaultEmblem ? DEFAULT_EMBLEM_SVG : doc.emblemSrc ?? DEFAULT_EMBLEM_SVG;
  const bodyHtml = buildBodyHtml(doc.body, fieldValues);
  const imagesHtml = buildImagesHtml(placedImages);
  const canvasInit = drawingDataUrl
    ? `var img=new Image();img.onload=function(){ctx.drawImage(img,0,0,800,1130);};img.src='${drawingDataUrl}';`
    : '';

  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(doc.title)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',Times,serif;background:#e8eaed;display:flex;justify-content:center;padding:24px;min-height:100vh}
.toolbar{position:fixed;top:0;left:0;right:0;background:#202124;color:#e8eaed;padding:10px 20px;display:flex;gap:12px;align-items:center;z-index:100;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.toolbar button{background:#3c4043;border:1px solid #5f6368;color:#e8eaed;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px}
.toolbar button:hover{background:#5f6368}
.toolbar button.active{background:#1a73e8;border-color:#1a73e8}
.toolbar label{display:flex;align-items:center;gap:6px}
.toolbar input[type=color]{width:28px;height:28px;border:none;cursor:pointer;border-radius:4px}
.toolbar input[type=range]{width:80px}
.sheet{position:relative;width:210mm;min-height:297mm;background:#fff;color:#202124;padding:20mm 18mm 18mm;box-shadow:0 4px 24px rgba(0,0,0,.18);margin-top:48px}
.header{display:grid;grid-template-columns:1fr 80px;gap:16px;align-items:start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1a73e8}
.header-text{text-align:center}
.doc-title{font-size:18pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.doc-subtitle{font-size:11pt;color:#5f6368;font-style:italic;margin-bottom:12px}
.doc-meta{font-size:11pt;color:#3c4043}
.emblem{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid #dadce0}
.body{font-size:12pt;line-height:1.8;text-align:justify;white-space:pre-wrap}
.field-input{display:inline;border:none;border-bottom:1px solid #1a73e8;background:#e8f0fe;padding:1px 6px;font-family:inherit;font-size:inherit;color:#1a73e8;min-width:80px;outline:none;border-radius:2px}
.field-input:focus{background:#d2e3fc;box-shadow:0 1px 0 #1a73e8}
.field-input::placeholder{color:#9aa0a6}
.placed-image{position:absolute;mix-blend-mode:multiply;pointer-events:none;object-fit:contain}
#drawCanvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10}
#drawCanvas.drawing{pointer-events:auto;cursor:crosshair}
@media print{
  body{background:#fff;padding:0}
  .toolbar{display:none!important}
  .sheet{margin:0;box-shadow:none;width:210mm;min-height:297mm}
  .field-input{border-bottom:1px solid #000;background:transparent;color:#000}
  #drawCanvas{pointer-events:none}
}
</style>
</head>
<body>
<div class="toolbar" id="toolbar">
  <button onclick="window.print()">🖨️ Друк / PDF</button>
  <button id="drawToggle" onclick="toggleDraw()">✏️ Малювання</button>
  <label>Колір <input type="color" id="penColor" value="#1a73e8" onchange="penColor=this.value"></label>
  <label>Товщина <input type="range" id="penWidth" min="1" max="10" value="3" oninput="penWidth=+this.value"></label>
  <button onclick="clearCanvas()">🗑️ Очистити</button>
</div>
<div class="sheet" id="sheet">
  <div class="header">
    <div class="header-text">
      <div class="doc-title">${escapeHtml(doc.title)}</div>
      ${doc.subtitle ? `<div class="doc-subtitle">${escapeHtml(doc.subtitle)}</div>` : ''}
      <div class="doc-meta">${escapeHtml(doc.city)} &nbsp; ${escapeHtml(doc.date)}</div>
    </div>
    <img class="emblem" src="${emblemSrc}" alt="Емблема">
  </div>
  <div class="body">${bodyHtml}</div>
  ${imagesHtml}
  <canvas id="drawCanvas" width="800" height="1130"></canvas>
</div>
<script>
(function(){
  var canvas=document.getElementById('drawCanvas');
  var ctx=canvas.getContext('2d');
  var drawing=false,lastX=0,lastY=0,penColor='#1a73e8',penWidth=3,drawMode=false;
  ctx.lineCap='round';ctx.lineJoin='round';
  ${canvasInit}

  window.toggleDraw=function(){
    drawMode=!drawMode;
    canvas.classList.toggle('drawing',drawMode);
    document.getElementById('drawToggle').classList.toggle('active',drawMode);
  };
  window.clearCanvas=function(){ctx.clearRect(0,0,800,1130);};
  window.penColor=penColor;window.penWidth=penWidth;

  function getPos(e){
    var r=canvas.getBoundingClientRect();
    var sx=800/r.width,sy=1130/r.height;
    if(e.touches){return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};}
    return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
  }
  function startDraw(e){if(!drawMode)return;e.preventDefault();drawing=true;var p=getPos(e);lastX=p.x;lastY=p.y;}
  function draw(e){
    if(!drawing||!drawMode)return;e.preventDefault();
    var p=getPos(e);
    ctx.strokeStyle=penColor;ctx.lineWidth=penWidth;
    ctx.beginPath();ctx.moveTo(lastX,lastY);
    var mx=(lastX+p.x)/2,my=(lastY+p.y)/2;
    ctx.quadraticCurveTo(lastX,lastY,mx,my);ctx.stroke();
    lastX=p.x;lastY=p.y;
  }
  function endDraw(){drawing=false;}
  canvas.addEventListener('mousedown',startDraw);
  canvas.addEventListener('mousemove',draw);
  canvas.addEventListener('mouseup',endDraw);
  canvas.addEventListener('mouseleave',endDraw);
  canvas.addEventListener('touchstart',startDraw,{passive:false});
  canvas.addEventListener('touchmove',draw,{passive:false});
  canvas.addEventListener('touchend',endDraw);

  document.querySelectorAll('.field-input').forEach(function(inp){
    inp.addEventListener('input',function(){
      localStorage.setItem('field-'+inp.dataset.fieldId,inp.value);
    });
    var saved=localStorage.getItem('field-'+inp.dataset.fieldId);
    if(saved)inp.value=saved;
  });
})();
</script>
</body>
</html>`;
}
