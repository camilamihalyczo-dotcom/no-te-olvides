// ═══════════════════════════════════════════════════════
//  game.js — Controlador principal
//  Maneja pantallas, escalado y arranque del juego
// ═══════════════════════════════════════════════════════

// ── Referencias DOM ──────────────────────────────────────
const gameWrapper     = document.getElementById('game-wrapper');
const screenMenu      = document.getElementById('screen-menu');
const screenGame      = document.getElementById('screen-game');
const screenMemories  = document.getElementById('screen-memories');
const screenGallery   = document.getElementById('screen-gallery');
const screenCredits   = document.getElementById('screen-credits');

const btnStart        = document.getElementById('btn-start');
const btnMemories     = document.getElementById('btn-memories');
const btnGallery      = document.getElementById('btn-gallery');
const btnCredits      = document.getElementById('btn-credits');
const btnBackMemories = document.getElementById('btn-back-memories');
const btnBackGallery  = document.getElementById('btn-back-gallery');
const btnBackCredits  = document.getElementById('btn-back-credits');

// ── Escalado responsive ──────────────────────────────────
// El juego siempre es 1440×810 internamente.
// Escalamos con CSS transform para que entre en cualquier pantalla.
function scaleGame() {
  const W = 1440;
  const H = 810;
  const scaleX = window.innerWidth  / W;
  const scaleY = window.innerHeight / H;
  const scale  = Math.min(scaleX, scaleY);

  gameWrapper.style.transform = `scale(${scale})`;
  gameWrapper.style.left = `${(window.innerWidth  - W * scale) / 2}px`;
  gameWrapper.style.top  = `${(window.innerHeight - H * scale) / 2}px`;
  gameWrapper.style.position = 'absolute';
}

window.addEventListener('resize', scaleGame);
scaleGame();

// ── Manejo de pantallas ──────────────────────────────────
const allScreens = {
  menu:      screenMenu,
  game:      screenGame,
  memories:  screenMemories,
  gallery:   screenGallery,
  credits:   screenCredits,
};

function showScreen(name, onShown = null) {
  // Ocultar todas
  Object.values(allScreens).forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
    s.style.opacity = '0';
  });

  const target = allScreens[name];
  if (!target) return;

  target.style.display = name === 'game' ? 'block' : 'flex';

  // Pequeño delay para el fade
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.style.transition = 'opacity 0.4s ease';
      target.style.opacity = '1';
      target.classList.add('active');
      if (typeof onShown === 'function') onShown();
    });
  });
}

// ── Botones del menú principal ───────────────────────────
btnStart.addEventListener('click', () => {
  resetGameState();
  showScreen('game', () => {
    showTutorial(() => goToScene('intro'));
  });
});

// ── Tutorial de inicio ───────────────────────────────────
function showTutorial(onClose) {
  const screen = document.getElementById('screen-game');

  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.style.cssText = `
    position: absolute; inset: 0; z-index: 300;
    background: rgba(0, 0, 0, 0.97);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 40px; cursor: pointer;
  `;

  overlay.innerHTML = `
    <p style="
      font-family: 'Crimson Pro', serif;
      font-size: 15px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(200, 168, 75, 0.5);
    ">Cómo jugar</p>

    <div style="
      display: flex; flex-direction: column; gap: 22px;
      max-width: 480px; text-align: center;
    ">
      <div style="display:flex; align-items:center; gap:20px; justify-content:center;">
        <span style="
          font-family: 'Caveat', cursive; font-size: 32px;
          color: #c8a84b; min-width: 36px; text-align:center;
        ">✦</span>
        <p style="
          font-family: 'Crimson Pro', serif; font-style: italic;
          font-size: 22px; color: #f0e6cc; line-height: 1.4;
        ">Clickeá para avanzar los diálogos e interactuar con el entorno</p>
      </div>
      <div style="display:flex; align-items:center; gap:20px; justify-content:center;">
        <span style="
          font-family: 'Caveat', cursive; font-size: 32px;
          color: #c8a84b; min-width: 36px; text-align:center;
        ">◂▸</span>
        <p style="
          font-family: 'Crimson Pro', serif; font-style: italic;
          font-size: 22px; color: #f0e6cc; line-height: 1.4;
        ">Usá las flechas para moverte entre los espacios</p>
      </div>
      <div style="display:flex; align-items:center; gap:20px; justify-content:center;">
        <span style="
          font-family: 'Caveat', cursive; font-size: 26px;
          color: #c8a84b; min-width: 36px; text-align:center;
          border: 1.5px solid rgba(200,168,75,0.6);
          border-radius: 6px; padding: 2px 8px;
        ">C</span>
        <p style="
          font-family: 'Crimson Pro', serif; font-style: italic;
          font-size: 22px; color: #f0e6cc; line-height: 1.4;
        ">Abrí el cuaderno en cualquier momento</p>
      </div>
    </div>

    <p style="
      font-family: 'Crimson Pro', serif; font-style: italic;
      font-size: 16px; color: rgba(240, 230, 210, 0.35);
      margin-top: 16px; letter-spacing: 0.08em;
    ">Clickeá para comenzar</p>
  `;

  overlay.addEventListener('click', () => {
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      if (typeof onClose === 'function') onClose();
    }, 500);
  });

  screen.appendChild(overlay);
}

btnMemories.addEventListener('click', () => {
  if (!saveData.hasCompletedOnce) return;
  showScreen('memories', buildMemoriesScreen);
});

btnGallery.addEventListener('click', () => {
  if (!saveData.hasCompletedOnce) return;
  showScreen('gallery', buildGalleryScreen);
});

btnCredits.addEventListener('click', () => {
  showScreen('credits');
});

btnBackMemories.addEventListener('click', () => showScreen('menu'));
btnBackGallery.addEventListener('click',  () => showScreen('menu'));
btnBackCredits.addEventListener('click',  () => showScreen('menu'));

// ── Actualizar estado de botones del menú ────────────────
function updateMenuButtons() {
  if (saveData.hasCompletedOnce) {
    btnMemories.disabled = false;
    btnMemories.classList.remove('locked');
    btnMemories.innerHTML = 'Recuerdos';

    btnGallery.disabled = false;
    btnGallery.classList.remove('locked');
    btnGallery.innerHTML = 'Galería';
  }
}

// ── Pantalla de Recuerdos ────────────────────────────────
// Cada recuerdo se desbloquea si el jugador lo consiguió en ALGUNA partida.
// Guardado en saveData.memoriesEverUnlocked.
const MEMORIES_DATA = [
  {
    id: 1,
    title: 'El duende',
    imgLocked:   'assets/recuerdos/rec-01-borroso.png',
    imgUnlocked: 'assets/recuerdos/rec-01-nitido.png',
  },
  {
    id: 2,
    title: 'El lobizón',
    imgLocked:   'assets/recuerdos/rec-02-borroso.png',
    imgUnlocked: 'assets/recuerdos/rec-02-nitido.png',
  },
  {
    id: 3,
    title: 'El silbido',
    imgLocked:   'assets/recuerdos/rec-03-borroso.png',
    imgUnlocked: 'assets/recuerdos/rec-03-nitido.png',
  },
  {
    id: 4,
    title: 'La luz mala',
    imgLocked:   'assets/recuerdos/rec-04-borroso.png',
    imgUnlocked: 'assets/recuerdos/rec-04-nitido.png',
  },
];

function buildMemoriesScreen() {
  const grid = document.getElementById('memories-grid');
  grid.innerHTML = '';
  MEMORIES_DATA.forEach(mem => {
    const unlocked = saveData.memoriesEverUnlocked.includes(mem.id);
    const card = document.createElement('div');
    card.className = 'memory-card' + (unlocked ? '' : ' locked');
    card.innerHTML = `
      <img src="${unlocked ? mem.imgUnlocked : mem.imgLocked}"
        alt="${unlocked ? mem.title : '???'}"
        onerror="this.style.background='#2a1808';">
      <div style="
        position:absolute; bottom:0; left:0; right:0;
        padding:12px 16px;
        background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        font-family:'Caveat',cursive;
        font-size:20px;
        color:#f0e6cc;
      ">${unlocked ? mem.title : '???'}</div>
    `;
    grid.appendChild(card);
  });
}

// ── Pantalla de Galería ──────────────────────────────────
// Cada fondo se desbloquea al haberlo visitado en alguna partida.
// La cabaña (EXT-08) es exclusiva: solo si llegaste al Final Real.
const GALLERY_DATA = [
  {
    bg: 'assets/backgrounds/int-01-hall.jpg',
    title: 'La entrada',
    hint: 'La casa de los abuelos',
  },
  {
    bg: 'assets/backgrounds/ext-03-patio-dia.jpg',
    title: 'El patio',
    hint: 'Día de campo',
  },
  {
    bg: 'assets/backgrounds/int-05-habitacion-dia.jpg',
    title: 'La habitación',
    hint: 'Donde todo empieza',
  },
  {
    bg: 'assets/backgrounds/ext-06-bosque-entrada-dia.jpg',
    title: 'El bosque',
    hint: 'El sendero de las trampas',
  },
  {
    bg: 'assets/backgrounds/ext-03-patio-noche.jpg',
    title: 'El patio de noche',
    hint: 'Cuando el campo cambia',
  },
  {
    bg: 'assets/backgrounds/ext-04-gallinero-noche-oscuro.jpg',
    title: 'El gallinero',
    hint: 'La última tarea',
  },
  {
    bg: 'assets/backgrounds/ext-08-casa-duende.jpg',
    title: 'La cabaña',
    hint: '— recuerda todo —',
    exclusive: true,
  },
];

function buildGalleryScreen() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';
  GALLERY_DATA.forEach(item => {
    const unlocked = item.exclusive
      ? saveData.hasSeenRealEnding
      : saveData.scenesVisited.includes(item.bg);

    const card = document.createElement('div');
    card.className = 'gallery-card' + (unlocked ? '' : ' locked');

    if (unlocked) {
      card.innerHTML = `
        <img src="${item.bg}" alt="${item.title}"
          onerror="this.style.background='#1a1208';">
        <div style="
          position:absolute; bottom:0; left:0; right:0;
          padding:12px 16px;
          background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          font-family:'Caveat',cursive; font-size:20px; color:#f0e6cc;
        ">${item.title}</div>
      `;
    } else {
      card.innerHTML = `
        <div style="
          width:100%; height:100%; background:#0e0a06;
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="font-size:26px; opacity:0.15;">🔒</span>
        </div>
        <div style="
          position:absolute; bottom:0; left:0; right:0;
          padding:12px 16px;
          background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          font-family:'Caveat',cursive; font-size:15px;
          color:rgba(240,230,210,0.25);
        ">${item.hint}</div>
      `;
    }
    grid.appendChild(card);
  });
}

// ── Inicialización ───────────────────────────────────────
updateMenuButtons();
showScreen('menu');

// ── Atajo de teclado: C → abrir cuaderno ────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'c' && e.key !== 'C') return;
  // Solo funciona si el juego está activo y no hay diálogo/choice corriendo
  if (!document.getElementById('screen-game').classList.contains('active')) return;
  if (!document.getElementById('dialogue-box').classList.contains('hidden'))    return;
  if (!document.getElementById('choice-container').classList.contains('hidden')) return;
  if (!document.getElementById('thought-bubble').classList.contains('hidden'))  return;
  if (typeof openNotebook === 'function') openNotebook();
});
