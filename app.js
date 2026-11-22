/**
 * Prize Wheel of Fortune - Fintech Gradient Theme
 * Vanilla JavaScript implementation (No frameworks, no build step, no dependencies)
 */

(() => {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY_NAMES = 'sorteo_zk_participants_v2';
  const STORAGE_KEY_HISTORY = 'sorteo_zk_history';
  const STORAGE_KEY_THEME = 'sorteo_zk_theme';

  // Top pointer is at 12 o'clock (270 degrees / 1.5 * PI)
  const POINTER_ANGLE = 1.5 * Math.PI;
  const TWO_PI = 2 * Math.PI;

  const DEFAULT_NAMES = [
    'Marcelo Sosa',
    'Fernando Oscar Labarque',
    'Gabriel Britos',
    'Christian Silva',
    'Diego Gustavo Montane',
    'Edgardo Roig',
    'Gonzalo Ezequiel Cáceres',
    'Gustavo Acevedo',
    'Pablo Bernad',
    'Martin Contreras',
    'Martin Alejandro Dangelo',
    'Santino Nicola D\'Angelo',
    'Alfredo Gomez Pildain',
    'Hernan Palma del Rey',
    'Mariano Catarino',
    'Francisco Catarino',
    'Luana Sileoni',
    'Matias Ezequiel Titolo',
    'Patricio Faustino',
    'Mariano Forlenza',
    'Marcelo Trenner',
    'Miguel Ledesma',
    'Daniel Kiwowicz',
    'Romina Lucero',
    'Alejandro Ledesma',
    'Fiamma Ragone',
    'Claudio Rivero',
    'Andres Beraldo',
    'Gaston Castillo',
    'Gonzalo Mauro',
    'Esteban Muller',
    'Agustin Gambino',
    'Martin Gambino',
    'Marcelo Gonzalez',
    'Sebastian Scecconi',
    'Diego Rodriguez',
    'Jose M. Sittner',
    'Mariano De Giacomo',
    'Adrian Barrile',
    'Jose Arando',
    'Emilce Bustillos',
    'Alejandro Guillermo Munnich',
    'Flavio Marchini',
    'Marcelo Repetto',
    'Juan Miguierini',
    'Felipe Bogliolo',
    'Eduardo Bogliolo',
    'Diego Montane',
    'Guillermo Montane',
    'Federico Andrada Zamarbide',
    'Augusto Makar',
    'Enzo Martoccia',
    'Rocco Martoccia',
    'Germán Castillo',
    'Horacio Mengia',
    'Geraldine D´Elia',
    'Laura Alvarez',
    'Cristian Bois',
    'Fernando Briseño',
    'Ignacio Iglesias',
    'Juan Sebastian Iglesias',
    'Hernan Guastaferri',
    'Lucas Abdala',
    'Joel Rodriguez',
    'Jonatan Gutierrez',
    'Franco Fajardo',
    'Esteban Reina',
    'Pablo Huller'
  ];

  // Minimalist palette matching the new design system
  const FINTECH_PALETTE = [
    '#e8573a', // Coral
    '#c8e63c', // Electric Lime
    '#8ec5d4', // Sky Blue
    '#7fa88a', // Sage Green
    '#f0a132', // Amber
    '#d4c5a9', // Warm Sand
    '#b5d4c1', // Mint Sage
    '#f0d080', // Soft Yellow
    '#c4a882', // Tan
    '#a8c4d4', // Steel Blue
    '#d4a8a0', // Dusty Rose
    '#b8d4a0', // Light Green
  ];

  // --- State Object ---
  const state = {
    names: [],
    history: [],
    currentAngle: 0,        // Radians [0, 2*PI)
    isSpinning: false,
    lastWinner: null,
    lastWinnerIndex: -1,
    animFrameId: null,
    dpr: Math.min(window.devicePixelRatio || 1, 2)
  };

  // --- DOM Elements ---
  const wheelCanvas = document.getElementById('wheelCanvas');
  const wheelCtx = wheelCanvas.getContext('2d');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  const namesTextarea = document.getElementById('namesTextarea');
  const nameInput = document.getElementById('nameInput');
  const addNameForm = document.getElementById('addNameForm');
  const centerSpinBtn = document.getElementById('centerSpinBtn');
  const spinStatus = document.getElementById('spinStatus');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const clearBtn = document.getElementById('clearBtn');
  const participantHeroCount = document.getElementById('participantHeroCount');
  const sliceInfo = document.getElementById('sliceInfo');

  const tabParticipants = document.getElementById('tabParticipants');
  const tabHistory = document.getElementById('tabHistory');
  const panelParticipants = document.getElementById('panelParticipants');
  const panelHistory = document.getElementById('panelHistory');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const emptyHistoryMsg = document.getElementById('emptyHistoryMsg');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const winnerModalBackdrop = document.getElementById('winnerModalBackdrop');
  const winnerModal = document.getElementById('winnerModal');
  const modalTitle = document.getElementById('modalTitle');
  const winnerTrophy = document.getElementById('winnerTrophy');
  const winnerPretitle = document.getElementById('winnerPretitle');
  const winnerDisplay = document.getElementById('winnerDisplay');
  const removeWinnerBtn = document.getElementById('removeWinnerBtn');
  const keepWinnerBtn = document.getElementById('keepWinnerBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const srAnnounce = document.getElementById('srAnnounce');

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const fsIcon = document.getElementById('fsIcon');

  // ==========================================================================
  // PURE HELPER FUNCTIONS (Math, Crypto, Color, Rankings)
  // ==========================================================================

  /**
   * Helper to format position (Puesto) info in Spanish.
   * 1 -> Primer Puesto
   * 2 -> Segundo Puesto
   * 3 -> Tercer Puesto
   * 4 -> 4° Puesto
   */
  function getPuestoInfo(puestoNumber) {
    switch (puestoNumber) {
      case 1:
        return {
          number: 1,
          badge: '1° Puesto',
          short: '1°',
          title: 'Primer Puesto 🥇',
          modalTitle: '¡1° PUESTO!',
          modalPretitle: 'Primer Lugar 🥇',
          trophy: '🥇'
        };
      case 2:
        return {
          number: 2,
          badge: '2° Puesto',
          short: '2°',
          title: 'Segundo Puesto 🥈',
          modalTitle: '¡2° PUESTO!',
          modalPretitle: 'Segundo Lugar 🥈',
          trophy: '🥈'
        };
      case 3:
        return {
          number: 3,
          badge: '3° Puesto',
          short: '3°',
          title: 'Tercer Puesto 🥉',
          modalTitle: '¡3° PUESTO!',
          modalPretitle: 'Tercer Lugar 🥉',
          trophy: '🥉'
        };
      default:
        return {
          number: puestoNumber,
          badge: `${puestoNumber}° Puesto`,
          short: `${puestoNumber}°`,
          title: `${puestoNumber}° Puesto 🎖️`,
          modalTitle: `¡${puestoNumber}° PUESTO!`,
          modalPretitle: `Puesto N° ${puestoNumber} 🎖️`,
          trophy: '🏆'
        };
    }
  }

  /**
   * Unbiased crypto random integer in [0, max - 1] using rejection sampling.
   * Completely avoids modulo bias.
   */
  function getSecureRandomInt(max) {
    if (max <= 1) return 0;
    const range = 0x100000000; // 2^32
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);
    let rand;
    do {
      crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= limit);
    return rand % max;
  }

  /**
   * Unbiased crypto float in [0, 1).
   */
  function getSecureRandomFloat() {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 0x100000000;
  }

  /**
   * Fisher-Yates array shuffle with cryptographically secure randomness.
   */
  function cryptoShuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Convert Hex color (#rrggbb) to RGB object.
   */
  function hexToRgb(hex) {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  /**
   * Convert HSL to RGB object.
   */
  function hslToRgb(h, s, l) {
    h = (h % 360 + 360) % 360;
    s = s / 100;
    l = l / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = 0; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }

  /**
   * Get high-contrast text color based on perceived relative luminance.
   */
  function getAutoContrastColor(colorStr) {
    let rgb;
    if (colorStr.startsWith('#')) {
      rgb = hexToRgb(colorStr);
    } else {
      // HSL string: hsl(h, s%, l%)
      const match = colorStr.match(/\d+/g);
      if (match && match.length >= 3) {
        rgb = hslToRgb(Number(match[0]), Number(match[1]), Number(match[2]));
      } else {
        return '#ffffff';
      }
    }
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    // For bright colors like lime or sand, use dark text; otherwise white
    return luminance > 0.52 ? '#111010' : '#ffffff';
  }

  /**
   * Get slice color from curated fintech palette or scaled HSL.
   */
  function getSliceColor(index, total) {
    if (total <= FINTECH_PALETTE.length) {
      return FINTECH_PALETTE[index % FINTECH_PALETTE.length];
    }
    const hue = Math.round((index * 360) / total);
    return `hsl(${hue}, 78%, 56%)`;
  }

  /**
   * Easing function: Quintic Ease-Out (rapid start, dramatic deceleration).
   */
  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  /**
   * Easing function: Cubic Ease-Out (for reduced motion).
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Truncate text with ellipsis if it exceeds maxWidth.
   */
  function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
  }

  /**
   * Sanitize text for HTML injection.
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Calculate exact final target angle so pointer at POINTER_ANGLE lands inside
   * winning slice with a randomized interior offset.
   */
  function calculateTargetAngle(winnerIndex, totalSlices, currentAngle, offsetRatio, fullSpins) {
    const sliceAngle = TWO_PI / totalSlices;
    const sliceTargetAngle = (winnerIndex + offsetRatio) * sliceAngle;

    const targetNorm = ((POINTER_ANGLE - sliceTargetAngle) % TWO_PI + TWO_PI) % TWO_PI;
    const currentNorm = ((currentAngle % TWO_PI) + TWO_PI) % TWO_PI;

    let delta = targetNorm - currentNorm;
    if (delta <= 0) {
      delta += TWO_PI;
    }

    return currentAngle + delta + (fullSpins * TWO_PI);
  }

  // ==========================================================================
  // STORAGE & DATA INITIALIZATION
  // ==========================================================================

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage write failed:', err);
    }
  }

  function loadStorage(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (err) {
      console.warn('Storage read failed:', err);
      return fallback;
    }
  }

  function initData() {
    const savedNames = loadStorage(STORAGE_KEY_NAMES, null);
    state.names = Array.isArray(savedNames) && savedNames.length > 0 ? savedNames : [...DEFAULT_NAMES];
    const savedHistory = loadStorage(STORAGE_KEY_HISTORY, []);
    state.history = Array.isArray(savedHistory) ? savedHistory : [];

    // Ensure all history entries have a valid puesto
    const total = state.history.length;
    state.history = state.history.map((item, index) => {
      if (typeof item.puesto !== 'number') {
        return { ...item, puesto: total - index };
      }
      return item;
    });

    // Sort so 1° Puesto is at the top, followed by 2°, 3°, 4°, etc.
    state.history.sort((a, b) => a.puesto - b.puesto);
    saveStorage(STORAGE_KEY_HISTORY, state.history);

    namesTextarea.value = state.names.join('\n');
    renderHistory();
  }

  // ==========================================================================
  // CANVAS WHEEL RENDERING
  // ==========================================================================

  function resizeCanvases() {
    const rect = wheelCanvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = Math.floor(rect.width);
    if (size <= 0) return;

    wheelCanvas.width = size * state.dpr;
    wheelCanvas.height = size * state.dpr;

    confettiCanvas.width = window.innerWidth * state.dpr;
    confettiCanvas.height = window.innerHeight * state.dpr;

    drawWheel();
  }

  function drawWheel() {
    const width = wheelCanvas.width;
    const height = wheelCanvas.height;
    if (width === 0 || height === 0) return;

    const ctx = wheelCtx;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.scale(state.dpr, state.dpr);

    const size = width / state.dpr;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 8;

    const n = state.names.length;

    if (n === 0) {
      drawEmptyWheel(ctx, centerX, centerY, radius);
      ctx.restore();
      return;
    }

    const sliceAngle = TWO_PI / n;
    const showText = sliceAngle >= 0.045 && (radius * sliceAngle) >= 12;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(state.currentAngle);

    // Draw Slices
    for (let i = 0; i < n; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const sliceColor = getSliceColor(i, n);

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColor;
      ctx.fill();

      // Clean dividing line — crisp, dark separator
      ctx.strokeStyle = 'rgba(17, 16, 16, 0.25)';
      ctx.lineWidth = n > 80 ? 0.5 : 1.5;
      ctx.stroke();

      // Text label
      if (showText) {
        ctx.save();
        const midAngle = startAngle + sliceAngle / 2;
        ctx.rotate(midAngle);

        const arcAtRim = radius * sliceAngle;
        const fontSize = Math.max(10, Math.min(24, Math.floor(arcAtRim * 0.40)));
        ctx.font = `700 ${fontSize}px "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const maxTextWidth = radius * 0.62;
        const textLabel = truncateText(ctx, state.names[i], maxTextWidth);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(textLabel, radius - Math.max(16, Math.floor(fontSize * 0.85)), 0);

        ctx.restore();
      }
    }

    ctx.restore(); // Restore wheel rotation

    // Outer rim — dark, clean
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.strokeStyle = '#111010';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Subtle tick marks
    const studCount = Math.min(n * 2, 48);
    for (let s = 0; s < studCount; s++) {
      const angle = (s * TWO_PI) / studCount;
      const sx = centerX + (radius - 2) * Math.cos(angle);
      const sy = centerY + (radius - 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, TWO_PI);
      ctx.fillStyle = 'rgba(17, 16, 16, 0.5)';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawEmptyWheel(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = 'rgba(17, 16, 16, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(17, 16, 16, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '600 14px "Space Grotesk", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(17, 16, 16, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Añadir participantes para comenzar', cx, cy);
  }

  // ==========================================================================
  // CONFETTI EFFECT (Custom Fintech Palette)
  // ==========================================================================

  let confettiParticles = [];
  let confettiAnimId = null;

  function createConfetti() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const count = 120;
    const colors = ['#c8e63c', '#e8573a', '#8ec5d4', '#f0a132', '#7fa88a', '#ffffff', '#d4c5a9'];
    confettiParticles = [];

    const originX = (window.innerWidth / 2) * state.dpr;
    const originY = (window.innerHeight * 0.4) * state.dpr;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = (Math.random() * 8 + 4) * state.dpr;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - Math.random() * 4 * state.dpr,
        size: (Math.random() * 8 + 5) * state.dpr,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        scaleY: 1,
        opacity: 1,
        gravity: 0.18 * state.dpr
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let activeParticles = 0;

    for (let p of confettiParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.rotation += p.rotationSpeed;
      p.scaleY = Math.cos(p.rotation * 0.05);
      p.opacity -= 0.0055;

      if (p.opacity > 0 && p.y < confettiCanvas.height) {
        activeParticles++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.scale(1, p.scaleY);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        confettiCtx.restore();
      }
    }

    if (activeParticles > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  // ==========================================================================
  // SPIN CONTROLLER & ANIMATION
  // ==========================================================================

  function spinWheel() {
    if (state.isSpinning) return;
    if (state.names.length < 2) {
      updateUI();
      return;
    }

    state.isSpinning = true;
    updateUI();

    // 1. FAIRNESS: Pick winner using crypto rejection sampling BEFORE animation starts
    const winnerIndex = getSecureRandomInt(state.names.length);
    const winnerName = state.names[winnerIndex];

    state.lastWinner = winnerName;
    state.lastWinnerIndex = winnerIndex;

    // 2. Exact landing angle calculation with random offset inside the winning slice
    const offsetRatio = 0.15 + (getSecureRandomFloat() * 0.70);

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fullSpins = isReduced ? 2 : (5 + getSecureRandomInt(4)); // 5 to 8 full spins
    const duration = isReduced ? 450 : 4600; // ms

    const startAngle = state.currentAngle;
    const finalAngle = calculateTargetAngle(winnerIndex, state.names.length, startAngle, offsetRatio, fullSpins);
    const totalRotation = finalAngle - startAngle;

    srAnnounce.textContent = 'La rueda está girando...';
    spinStatus.textContent = 'Girando... ¡Mucha suerte!';

    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = isReduced ? easeOutCubic(progress) : easeOutQuint(progress);

      state.currentAngle = startAngle + (totalRotation * ease);
      drawWheel();

      if (progress < 1) {
        state.animFrameId = requestAnimationFrame(frame);
      } else {
        state.currentAngle = finalAngle % TWO_PI;
        state.isSpinning = false;
        drawWheel();
        onSpinComplete(winnerName, winnerIndex);
      }
    }

    state.animFrameId = requestAnimationFrame(frame);
  }

  function onSpinComplete(winnerName, winnerIndex) {
    updateUI();

    // Determine position (Puesto): 1st draw = 1, 2nd draw = 2, 3rd draw = 3, etc.
    const puestoNumber = state.history.length + 1;
    const puestoInfo = getPuestoInfo(puestoNumber);

    // Record in history
    const entry = {
      id: Date.now() + '-' + getSecureRandomInt(10000),
      name: winnerName,
      puesto: puestoNumber,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    state.history.push(entry);
    state.history.sort((a, b) => (a.puesto || 0) - (b.puesto || 0));
    saveStorage(STORAGE_KEY_HISTORY, state.history);
    renderHistory();

    // Screen reader announcement
    srAnnounce.textContent = `¡La rueda se detuvo en ${winnerName}, obteniendo el ${puestoInfo.title}!`;
    spinStatus.textContent = `${puestoInfo.badge}: ¡${winnerName}!`;

    // Show celebration modal
    showWinnerModal(winnerName, puestoInfo);
  }

  // ==========================================================================
  // WINNER MODAL
  // ==========================================================================

  function showWinnerModal(winnerName, puestoInfo) {
    winnerDisplay.textContent = winnerName;
    if (modalTitle) modalTitle.textContent = puestoInfo.modalTitle;
    if (winnerPretitle) winnerPretitle.textContent = puestoInfo.modalPretitle;
    if (winnerTrophy) winnerTrophy.textContent = puestoInfo.trophy;
    winnerModalBackdrop.hidden = false;
    createConfetti();

    setTimeout(() => {
      removeWinnerBtn.focus();
    }, 50);
  }

  function hideWinnerModal() {
    winnerModalBackdrop.hidden = true;
    stopConfetti();
  }

  function removeCurrentWinner() {
    if (state.lastWinnerIndex >= 0 && state.lastWinnerIndex < state.names.length) {
      state.names.splice(state.lastWinnerIndex, 1);
      namesTextarea.value = state.names.join('\n');
      saveStorage(STORAGE_KEY_NAMES, state.names);
      drawWheel();
      updateUI();
    }
    hideWinnerModal();
  }

  function keepCurrentWinner() {
    hideWinnerModal();
  }

  // ==========================================================================
  // PARTICIPANTS & LIST MANAGEMENT
  // ==========================================================================

  function syncNamesFromTextarea() {
    const rawLines = namesTextarea.value.split('\n');
    const cleaned = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0);

    state.names = cleaned;
    saveStorage(STORAGE_KEY_NAMES, state.names);
    drawWheel();
    updateUI();
  }

  function addSingleName(name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    state.names.push(trimmed);
    namesTextarea.value = state.names.join('\n');
    saveStorage(STORAGE_KEY_NAMES, state.names);
    drawWheel();
    updateUI();
  }

  function shuffleParticipants() {
    if (state.names.length < 2 || state.isSpinning) return;
    state.names = cryptoShuffle(state.names);
    namesTextarea.value = state.names.join('\n');
    saveStorage(STORAGE_KEY_NAMES, state.names);
    drawWheel();
  }

  function clearAllParticipants() {
    if (state.isSpinning) return;
    if (state.names.length > 0 && !confirm('¿Deseas eliminar a todos los participantes de la rueda?')) {
      return;
    }
    state.names = [];
    namesTextarea.value = '';
    saveStorage(STORAGE_KEY_NAMES, state.names);
    drawWheel();
    updateUI();
  }

  // ==========================================================================
  // HISTORY MANAGEMENT (Crypto Token List Style)
  // ==========================================================================

  function renderHistory() {
    historyList.innerHTML = '';
    const count = state.history.length;
    historyCount.textContent = count;

    if (count === 0) {
      emptyHistoryMsg.hidden = false;
      return;
    }

    emptyHistoryMsg.hidden = true;

    // Display in order from 1° Puesto downwards (1, 2, 3, 4...)
    const sorted = [...state.history].sort((a, b) => (a.puesto || 0) - (b.puesto || 0));

    sorted.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const puestoNumber = item.puesto || 1;
      const puestoInfo = getPuestoInfo(puestoNumber);

      const puestoClass = puestoNumber <= 3 ? `puesto-${puestoNumber}` : '';
      const badgeClass = puestoNumber <= 3 ? `badge-puesto-${puestoNumber}` : '';

      li.innerHTML = `
        <div class="history-item-left">
          <div class="history-token-icon ${puestoClass}">${escapeHtml(puestoInfo.short)}</div>
          <div class="history-name-stack">
            <span class="history-name">${escapeHtml(item.name)}</span>
            <span class="history-sub">${escapeHtml(puestoInfo.title)}</span>
          </div>
        </div>
        <div class="history-item-right">
          <span class="history-win-badge ${badgeClass}">${escapeHtml(puestoInfo.badge)}</span>
          <span class="history-time">${escapeHtml(item.time)}</span>
        </div>
      `;

      historyList.appendChild(li);
    });
  }

  function clearHistory() {
    if (state.history.length === 0) return;
    if (!confirm('¿Deseas vaciar el historial de puestos?')) return;
    state.history = [];
    saveStorage(STORAGE_KEY_HISTORY, state.history);
    renderHistory();
    updateUI();
  }

  // ==========================================================================
  // UI STATUS & INTERACTION HELPERS
  // ==========================================================================

  function updateUI() {
    const count = state.names.length;
    participantHeroCount.textContent = count;

    const canSpin = count >= 2 && !state.isSpinning;
    centerSpinBtn.disabled = !canSpin;
    shuffleBtn.disabled = count < 2 || state.isSpinning;
    clearBtn.disabled = count === 0 || state.isSpinning;
    namesTextarea.disabled = state.isSpinning;
    nameInput.disabled = state.isSpinning;

    if (state.isSpinning) {
      spinStatus.textContent = 'La rueda está girando...';
      sliceInfo.textContent = `${count} sectores`;
    } else if (count < 2) {
      spinStatus.textContent = 'Agrega al menos 2 participantes para girar.';
      sliceInfo.textContent = count === 1 ? '1 sector (se necesitan 2+)' : '0 sectores';
    } else {
      const proximoPuesto = state.history.length + 1;
      const proximoInfo = getPuestoInfo(proximoPuesto);
      spinStatus.textContent = `Toca GIRAR en el centro para definir el ${proximoInfo.badge}`;
      sliceInfo.textContent = `${count} sectores (${(360 / count).toFixed(1)}° c/u)`;
    }
  }

  // ==========================================================================
  // EVENT LISTENERS & LIFECYCLE
  // ==========================================================================

  function attachEvents() {
    // Spin Trigger: Center Hub Button
    centerSpinBtn.addEventListener('click', spinWheel);

    // Keyboard support: Space / Enter on document or center button
    window.addEventListener('keydown', (e) => {
      if (winnerModalBackdrop.hidden === false) {
        if (e.key === 'Escape') hideWinnerModal();
        return;
      }

      if (e.target === document.body || e.target === centerSpinBtn) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          spinWheel();
        }
      }
    });

    // Quick Add Name Form
    addNameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addSingleName(nameInput.value);
      nameInput.value = '';
      nameInput.focus();
    });

    // Bulk Names Textarea
    namesTextarea.addEventListener('input', syncNamesFromTextarea);

    // Action buttons
    shuffleBtn.addEventListener('click', shuffleParticipants);
    clearBtn.addEventListener('click', clearAllParticipants);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Modal Actions
    removeWinnerBtn.addEventListener('click', removeCurrentWinner);
    keepWinnerBtn.addEventListener('click', keepCurrentWinner);
    closeModalBtn.addEventListener('click', hideWinnerModal);
    winnerModalBackdrop.addEventListener('click', (e) => {
      if (e.target === winnerModalBackdrop) hideWinnerModal();
    });

    // Panel Tabs Switching
    tabParticipants.addEventListener('click', () => {
      tabParticipants.classList.add('active');
      tabParticipants.setAttribute('aria-selected', 'true');
      tabHistory.classList.remove('active');
      tabHistory.setAttribute('aria-selected', 'false');
      panelParticipants.hidden = false;
      panelHistory.hidden = true;
    });

    tabHistory.addEventListener('click', () => {
      tabHistory.classList.add('active');
      tabHistory.setAttribute('aria-selected', 'true');
      tabParticipants.classList.remove('active');
      tabParticipants.setAttribute('aria-selected', 'false');
      panelHistory.hidden = false;
      panelParticipants.hidden = true;
    });

    // Fullscreen Toggle
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }

    function onFullscreenChange() {
      if (fsIcon) {
        fsIcon.textContent = document.fullscreenElement ? '✕' : '⛶';
      }
      resizeCanvases();
      setTimeout(resizeCanvases, 100);
      setTimeout(resizeCanvases, 300);
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);

    // Responsive Resize (ResizeObserver + window fallback)
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        resizeCanvases();
      });
      ro.observe(wheelCanvas.parentElement);
      if (document.querySelector('.dashboard-shell')) {
        ro.observe(document.querySelector('.dashboard-shell'));
      }
    }

    window.addEventListener('resize', () => {
      resizeCanvases();
      setTimeout(resizeCanvases, 80);
    });
  }

  // --- Bootstrapping ---
  function init() {
    initData();
    attachEvents();
    resizeCanvases();
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
