import { useEffect, useMemo, useRef, useState } from 'react';
import fundoLoginImage from '../imagens/fundoLogin.jpg';
import arrowIcon from '../imagens/icons/arrow_5613178.png';
import maceIcon from '../imagens/icons/mace_3893138.png';
import swordIcon from '../imagens/icons/sword_1030368.png';
import SidebarNav from '../components/SidebarNav.jsx';

const GRID_SIZE = 24;
const MIN_SIZE = 48;
const MAX_SIZE = 2400;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const PASTE_OFFSET = 32;
const ICON_TEMPLATES = [
  { id: 'flecha', name: 'Flecha', src: arrowIcon },
  { id: 'maca', name: 'Maça', src: maceIcon },
  { id: 'espada', name: 'Espada', src: swordIcon },
];

const parseWorldId = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((segment) => segment === 'worlds');
  if (idx !== -1 && parts[idx + 1]) return Number(parts[idx + 1]);
  return null;
};

const VisualGridEditor = () => {
  const workspaceRef = useRef(null);
  const pointerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const clipboardRef = useRef([]);
  const zCounter = useRef(1);
  const itemsRef = useRef([]);
  const selectedRef = useRef([]);
  const panRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');
  const [gridVisible, setGridVisible] = useState(true);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [iconName, setIconName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const worldId = useMemo(() => parseWorldId(), []);
  const DEFAULT_BACKGROUND = { src: fundoLoginImage, name: 'Plano de fundo padrão', isDefault: true };
  const NO_BACKGROUND = { src: '', name: 'Sem fundo', isDefault: false };
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [isDropping, setIsDropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const newId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const trackUrl = (url) => {
    if (url) objectUrlsRef.current.push(url);
  };

  const revokeUrl = (url) => {
    if (!url) return;
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    objectUrlsRef.current = objectUrlsRef.current.filter((saved) => saved !== url);
  };

  const detachListeners = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const detachPanListeners = () => {
    window.removeEventListener('pointermove', handlePanMove);
    window.removeEventListener('pointerup', handlePanUp);
  };

  const snapshotItems = () => {
    const snapshot = itemsRef.current.map((item) => ({ ...item }));
    setHistory((h) => [...h.slice(-29), snapshot]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const previous = h[h.length - 1].map((item) => ({ ...item }));
      setRedoStack((r) => [...r, itemsRef.current.map((item) => ({ ...item }))]);
      setItems(previous);
      setSelectedIds([]);
      return h.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const next = r[r.length - 1].map((item) => ({ ...item }));
      setHistory((h) => [...h.slice(-29), itemsRef.current.map((item) => ({ ...item }))]);
      setItems(next);
      setSelectedIds([]);
      return r.slice(0, -1);
    });
  };

  useEffect(() => () => {
    detachListeners();
    detachPanListeners();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    selectedRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    document.body.classList.add('visual-editor-mode');
    return () => {
      document.body.classList.remove('visual-editor-mode');
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key?.toLowerCase() === 'z') {
        event.preventDefault();
        handleUndo();
        return;
      }
      if (event.ctrlKey && event.key?.toLowerCase() === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }
      if (event.ctrlKey && event.key?.toLowerCase() === 'c') {
        event.preventDefault();
        copySelection();
        return;
      }
      if (event.ctrlKey && event.key?.toLowerCase() === 'v') {
        event.preventDefault();
        pasteSelection();
        return;
      }
      const currentSelected = selectedRef.current || [];
      if (!event.ctrlKey && event.key === 'Delete' && currentSelected.length) {
        event.preventDefault();
        removeItems(currentSelected);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validateFile = (file) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Apenas PNG, JPG ou WEBP são aceitos.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo maior que 8MB. Use imagens menores.');
      return false;
    }
    return true;
  };

  const addImages = (fileList) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList).filter((file) => validateFile(file));
    if (!files.length) return;

    setError('');
    snapshotItems();
    setItems((prev) => {
      const next = [...prev];
      files.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        trackUrl(url);
        next.push({
          id: newId(),
          name: file.name,
          src: url,
          x: 80 + (prev.length + idx) * 18,
          y: 80 + (prev.length + idx) * 12,
          width: 260,
          height: 180,
          rotation: 0,
          zIndex: zCounter.current++,
          locked: false,
        });
      });
      return next;
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropping(false);
    if (event.dataTransfer?.files?.length) {
      addImages(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropping(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropping(false);
  };

  const handleFileInput = (event) => {
    addImages(event.target.files);
    event.target.value = '';
  };

  const handleBackgroundFiles = (files) => {
    if (!files?.length) return;
    const file = files[0];
    if (!validateFile(file)) return;
    const url = URL.createObjectURL(file);
    trackUrl(url);
    if (!background.isDefault) revokeUrl(background.src);
    setBackground({ src: url, name: file.name, isDefault: false });
    setBgModalOpen(false);
    setError('');
  };

  const removeBackground = () => {
    if (!background.isDefault) revokeUrl(background.src);
    setBackground(NO_BACKGROUND);
  };

  const snapValue = (value) => value;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateItem = (id, updater) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const handleCanvasClick = () => {
    setSelectedIds([]);
  };

  const createIcon = () => {
    if (!selectedIcon) {
      setError('Escolha um ícone para criar.');
      return;
    }
    const template = ICON_TEMPLATES.find((icon) => icon.id === selectedIcon);
    if (!template) return;
    snapshotItems();
    const label = iconName?.trim() || template.name;
    const newEntry = {
      id: newId(),
      name: label,
      label,
      src: template.src,
      x: 120,
      y: 120,
      width: 96,
      height: 120,
      rotation: 0,
      zIndex: zCounter.current++,
      locked: false,
      type: 'icon',
    };
    setItems((prev) => [...prev, newEntry]);
    setSelectedIds([newEntry.id]);
    setIconModalOpen(false);
    setIconName('');
    setSelectedIcon(null);
    setError('');
  };

  const startMove = (event, id) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.locked) return;
    event.stopPropagation();
    event.preventDefault();
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const existingSelection = selectedRef.current || [];

    // Ctrl/Shift adjust selection; dragging starts when modifiers are released
    if (event.ctrlKey || event.shiftKey) {
      let nextSelection;
      if (event.ctrlKey) {
        nextSelection = existingSelection.includes(id)
          ? existingSelection.filter((selected) => selected !== id)
          : [...existingSelection, id];
      } else {
        nextSelection = existingSelection.includes(id)
          ? existingSelection
          : [...existingSelection, id];
      }
      setSelectedIds(nextSelection);
      return;
    }

    const nextSelection = existingSelection.length && existingSelection.includes(id)
      ? existingSelection
      : [id];
    setSelectedIds(nextSelection);

    const selectionItems = items.filter((item) => nextSelection.includes(item.id) && !item.locked);
    if (!selectionItems.length) return;

    snapshotItems();
    pointerRef.current = {
      mode: 'move',
      rect,
      startX: event.clientX,
      startY: event.clientY,
      zoom,
      moved: false,
      items: selectionItems.map((item) => ({
        id: item.id,
        startX: item.x,
        startY: item.y,
        width: item.width,
        height: item.height,
      })),
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const startResize = (event, id, handle) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.locked) return;
    event.stopPropagation();
    event.preventDefault();
    snapshotItems();
    setSelectedIds([id]);
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      mode: 'resize',
      id,
      handle,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      start: { ...target },
      keepRatio: event.shiftKey,
      zoom,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const startRotate = (event, id) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.locked) return;
    event.stopPropagation();
    event.preventDefault();
    snapshotItems();
    setSelectedIds([id]);
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + target.x + target.width / 2;
    const centerY = rect.top + target.y + target.height / 2;
    pointerRef.current = {
      mode: 'rotate',
      id,
      rect,
      centerX: rect.left + (target.x + target.width / 2) * zoom,
      centerY: rect.top + (target.y + target.height / 2) * zoom,
      startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
      startRotation: target.rotation,
      zoom,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (event) => {
    const data = pointerRef.current;
    if (!data) return;

    if (data.mode === 'move') {
      const { rect, startX, startY, items: movingItems = [], zoom: dragZoom = 1 } = data;
      if (!movingItems.length) return;
      const rectWidth = (rect?.width || 0) / dragZoom;
      const rectHeight = (rect?.height || 0) / dragZoom;

      // Calculate group-constrained delta to keep formation
      let minDx = -Infinity;
      let maxDx = Infinity;
      let minDy = -Infinity;
      let maxDy = Infinity;

      movingItems.forEach((item) => {
        minDx = Math.max(minDx, -item.startX);
        maxDx = Math.min(maxDx, rectWidth - (item.startX + item.width));
        minDy = Math.max(minDy, -item.startY);
        maxDy = Math.min(maxDy, rectHeight - (item.startY + item.height));
      });

      const rawDx = (event.clientX - startX) / dragZoom;
      const rawDy = (event.clientY - startY) / dragZoom;
      const traveled = Math.abs(rawDx) + Math.abs(rawDy);
      if (!data.moved && traveled < 3) return;
      if (!data.moved) pointerRef.current = { ...data, moved: true };

      const dx = snapValue(clamp(rawDx, minDx, maxDx));
      const dy = snapValue(clamp(rawDy, minDy, maxDy));

      const moveMap = new Map(movingItems.map((entry) => [entry.id, entry]));
      setItems((prev) =>
        prev.map((item) => {
          const ref = moveMap.get(item.id);
          if (!ref) return item;
          return { ...item, x: ref.startX + dx, y: ref.startY + dy };
        }),
      );
      return;
    }

    if (data.mode === 'resize') {
      const { startX, startY, start, handle, rect, id, keepRatio, zoom: dragZoom = 1 } = data;
      const dx = (event.clientX - startX) / dragZoom;
      const dy = (event.clientY - startY) / dragZoom;
      let { width, height, x, y } = start;

      const applyRatio = keepRatio || event.shiftKey;
      const ratio = start.width / start.height || 1;

      switch (handle) {
        case 'e':
          width = start.width + dx;
          break;
        case 'w':
          width = start.width - dx;
          x = start.x + dx;
          break;
        case 's':
          height = start.height + dy;
          break;
        case 'n':
          height = start.height - dy;
          y = start.y + dy;
          break;
        case 'se':
          width = start.width + dx;
          height = start.height + dy;
          break;
        case 'ne':
          width = start.width + dx;
          height = start.height - dy;
          y = start.y + dy;
          break;
        case 'sw':
          width = start.width - dx;
          height = start.height + dy;
          x = start.x + dx;
          break;
        case 'nw':
          width = start.width - dx;
          height = start.height - dy;
          x = start.x + dx;
          y = start.y + dy;
          break;
        default:
          break;
      }

      if (applyRatio) {
        if (['n', 's'].includes(handle)) {
          width = height * ratio;
          if (handle === 'n') x = start.x - (width - start.width) / 2;
        } else if (['e', 'w'].includes(handle)) {
          height = width / ratio;
          if (handle === 'w') y = start.y - (height - start.height) / 2;
        } else {
          height = width / ratio;
        }
      }

      width = snapValue(clamp(width, MIN_SIZE, MAX_SIZE));
      height = snapValue(clamp(height, MIN_SIZE, MAX_SIZE));

      const rectWidth = (rect?.width || width) / dragZoom;
      const rectHeight = (rect?.height || height) / dragZoom;
      const maxX = rectWidth - width;
      const maxY = rectHeight - height;
      x = snapValue(clamp(x, 0, maxX));
      y = snapValue(clamp(y, 0, maxY));

      updateItem(id, (item) => ({ ...item, width, height, x, y }));
      return;
    }

    if (data.mode === 'rotate') {
      const { centerX, centerY, startAngle, startRotation, id } = data;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const delta = angle - startAngle;
      const degrees = startRotation + (delta * 180) / Math.PI;
      updateItem(id, (item) => ({ ...item, rotation: degrees }));
    }
  };

  const handlePointerUp = () => {
    pointerRef.current = null;
    detachListeners();
  };

  const handlePanMove = (event) => {
    const data = panRef.current;
    if (!data || !workspaceRef.current) return;
    const dx = event.clientX - data.startX;
    const dy = event.clientY - data.startY;
    if (Math.abs(dx) + Math.abs(dy) > 2) data.moved = true;
    const wrapper = data.wrapper;
    if (wrapper) {
      wrapper.scrollLeft = data.scrollLeft - dx;
      wrapper.scrollTop = data.scrollTop - dy;
    }
  };

  const handlePanUp = () => {
    const data = panRef.current;
    detachPanListeners();
    setIsPanning(false);
    panRef.current = null;
    if (data && !data.moved) {
      handleCanvasClick();
    }
  };

  const bringToFront = (id) => {
    snapshotItems();
    const top = Math.max(...items.map((item) => item.zIndex || 1), 1);
    updateItem(id, (item) => ({ ...item, zIndex: top + 1 }));
    zCounter.current = top + 2;
  };

  const sendToBack = (id) => {
    snapshotItems();
    const lowest = Math.min(...items.map((item) => item.zIndex || 1), 1);
    updateItem(id, (item) => ({ ...item, zIndex: lowest - 1 }));
  };

  const toggleLock = (id) => {
    snapshotItems();
    updateItem(id, (item) => ({ ...item, locked: !item.locked }));
  };

  const removeItems = (ids) => {
    if (!ids?.length) return;
    snapshotItems();
    const idSet = new Set(ids);
    items.forEach((item) => {
      if (idSet.has(item.id) && item.src) revokeUrl(item.src);
    });
    setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
  };

  const removeItem = (id) => removeItems([id]);

  const copySelection = () => {
    const ids = selectedRef.current || [];
    if (!ids.length) return;
    const snapshot = itemsRef.current.filter((item) => ids.includes(item.id)).map((item) => ({ ...item }));
    clipboardRef.current = snapshot;
  };

  const pasteSelection = () => {
    if (!clipboardRef.current.length) return;
    const clones = clipboardRef.current.map((item) => ({
      ...item,
      id: newId(),
      x: item.x + PASTE_OFFSET,
      y: item.y + PASTE_OFFSET,
      zIndex: zCounter.current++,
    }));
    snapshotItems();
    setItems((prev) => [...prev, ...clones]);
    setSelectedIds(clones.map((item) => item.id));
    // Shift clipboard so repeated pastes cascade
    clipboardRef.current = clones.map((item) => ({ ...item, x: item.x, y: item.y }));
  };

  const canvasStyle = {
    ...(background.src
      ? { backgroundImage: `linear-gradient(rgba(13,10,20,0.7), rgba(13,10,20,0.7)), url(${background.src})` }
      : {}),
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    // Expand canvas logically to allow panning when zoomed in, and still cover when zoomed out
    width: `${(zoom >= 1 ? zoom : 1 / zoom) * 100}%`,
    height: `${(zoom >= 1 ? zoom : 1 / zoom) * 100}%`,
  };

  const adjustZoom = (delta) => setZoom((z) => clamp(parseFloat((z + delta).toFixed(2)), 0.5, 2));
  const resetZoom = () => setZoom(1);

  const startPan = (event) => {
    if (zoom === 1) return;
    if (event.button !== 0) return;
    if (event.target !== workspaceRef.current) return;
    const wrapper = workspaceRef.current?.parentElement;
    if (!wrapper) return;
    event.preventDefault();
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: wrapper.scrollLeft,
      scrollTop: wrapper.scrollTop,
      wrapper,
      moved: false,
    };
    setIsPanning(true);
    window.addEventListener('pointermove', handlePanMove);
    window.addEventListener('pointerup', handlePanUp);
  };

  return (
    <div className="visual-editor-page">
      <SidebarNav worldId={worldId} />
      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="visual-editor-body full">
        <div className={`visual-canvas-wrapper ${isDropping ? 'is-dropping' : ''} ${isPanning ? 'is-panning' : ''} ${zoom !== 1 ? 'is-zoomed' : ''}`}>
          <div
            ref={workspaceRef}
            className={`visual-canvas ${gridVisible ? 'show-grid' : ''}`}
            style={canvasStyle}
            onClick={handleCanvasClick}
            onPointerDown={startPan}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const singleSelected = isSelected && selectedIds.length === 1;
              return (
                <div
                  key={item.id}
                  className={`draggable ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
                  style={{
                    width: item.width,
                    height: item.height,
                    transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg)`,
                    zIndex: item.zIndex,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => startMove(e, item.id)}
                >
                  {item.type === 'icon' ? (
                    <div className="icon-item">
                      <img src={item.src} alt={item.name || 'Ícone'} draggable={false} />
                      <span className="icon-label">{item.label || item.name || 'Ícone'}</span>
                    </div>
                  ) : (
                    <img src={item.src} alt={item.name || 'Camada'} draggable={false} />
                  )}

                  {item.locked && <div className="lock-overlay" aria-hidden>🔒</div>}

                  {singleSelected && !item.locked && (
                    <>
                      <div className="resize-handle handle-nw" onPointerDown={(e) => startResize(e, item.id, 'nw')} />
                      <div className="resize-handle handle-ne" onPointerDown={(e) => startResize(e, item.id, 'ne')} />
                      <div className="resize-handle handle-sw" onPointerDown={(e) => startResize(e, item.id, 'sw')} />
                      <div className="resize-handle handle-se" onPointerDown={(e) => startResize(e, item.id, 'se')} />
                      <div className="resize-handle handle-n" onPointerDown={(e) => startResize(e, item.id, 'n')} />
                      <div className="resize-handle handle-s" onPointerDown={(e) => startResize(e, item.id, 's')} />
                      <div className="resize-handle handle-e" onPointerDown={(e) => startResize(e, item.id, 'e')} />
                      <div className="resize-handle handle-w" onPointerDown={(e) => startResize(e, item.id, 'w')} />
                      <div className="rotate-handle" onPointerDown={(e) => startRotate(e, item.id)}>
                        ↻
                      </div>
                    </>
                  )}

                  {singleSelected && (
                    <div className="floating-menu" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => bringToFront(item.id)} aria-label="Trazer para frente" title="Trazer para frente">
                        🔼
                      </button>
                      <button type="button" onClick={() => sendToBack(item.id)} aria-label="Enviar para trás" title="Enviar para trás">
                        🔽
                      </button>
                      <button type="button" onClick={() => toggleLock(item.id)} aria-label={item.locked ? 'Destravar posição' : 'Travar posição'} title={item.locked ? 'Destravar posição' : 'Travar posição'}>
                        {item.locked ? '🔓' : '🔒'}
                      </button>
                      <button type="button" className="danger" onClick={() => removeItem(item.id)} aria-label="Remover" title="Remover">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      </div>

      <div className="visual-editor-footer">
        <div className="footer-left">
          <button className="button-primary" type="button" onClick={() => setBgModalOpen(true)}>
            Adicionar imagem de fundo
          </button>
          <button className="ghost-button" type="button" onClick={removeBackground}>
            Remover fundo
          </button>
        </div>
        <div className="footer-center">Nada é salvo. Recarregue para limpar.</div>
        <div className="footer-actions">
          <button className="ghost-button" type="button" onClick={() => setIconModalOpen(true)}>
            Adicionar ícone
          </button>
          <div className="footer-toggles">
            <button className="ghost-button" type="button" onClick={() => setGridVisible((v) => !v)}>
              {gridVisible ? 'Ocultar grid' : 'Mostrar grid'}
            </button>
            <div className="zoom-controls">
              <button className="ghost-button" type="button" onClick={() => adjustZoom(-0.1)}>-</button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button className="ghost-button" type="button" onClick={() => adjustZoom(0.1)}>+</button>
              <button className="ghost-button" type="button" onClick={resetZoom}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {bgModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card wide">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Plano de fundo</p>
                <h3 className="modal-title">Adicionar imagem de fundo</h3>
              </div>
              <button className="icon-btn" type="button" aria-label="Fechar" onClick={() => setBgModalOpen(false)}>
                ✖
              </button>
            </div>
            <div className="background-drop"
              onDrop={(e) => {
                e.preventDefault();
                handleBackgroundFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <p className="muted">Arraste uma imagem ou clique abaixo</p>
              <label className="button-primary" htmlFor="bg-upload">Selecionar arquivo</label>
              <input
                id="bg-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleBackgroundFiles(e.target.files)}
                hidden
              />
              <p className="hint">Recomendado: 1920x1080 ou 2560x1440 (16:9).</p>
              {background.src && (
                <div className="bg-preview">
                  <span className="badge">Atual</span>
                  <img src={background.src} alt="Fundo atual" />
                  <p className="muted">{background.name || 'Plano de fundo'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {iconModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card wide">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Ícones</p>
                <h3 className="modal-title">Adicionar ícone</h3>
              </div>
              <button className="icon-btn" type="button" aria-label="Fechar" onClick={() => setIconModalOpen(false)}>
                ✖
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                <span className="field-label">Nome do ícone</span>
                <input
                  className="input"
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="Ex: Castelo, Taverna, Portal"
                />
              </label>

              <div className="field">
                <span className="field-label">Escolha um ícone</span>
                <div className="icon-grid">
                  {ICON_TEMPLATES.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      className={`icon-option ${selectedIcon === icon.id ? 'selected' : ''}`}
                      onClick={() => setSelectedIcon(icon.id)}
                    >
                      <img src={icon.src} alt={icon.name} />
                      <span>{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setIconModalOpen(false)}>Cancelar</button>
              <button className="button-primary" type="button" onClick={createIcon}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualGridEditor;
