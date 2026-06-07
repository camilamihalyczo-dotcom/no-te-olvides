// ═══════════════════════════════════════════════════════
//  state.js — Estado global del juego + persistencia
//  Todo lo que necesita guardarse entre sesiones
// ═══════════════════════════════════════════════════════

const STATE_KEY = 'nte_save';

// Estado de partida (se reinicia en cada partida nueva)
const gameState = {
  // Reloj narrativo — horas en formato 24h (ej: 12.5 = 12:30)
  clockHour: 12,

  // Escena actual
  currentScene: 'intro',

  // Recuerdos desbloqueados en ESTA partida [1,2,3,4]
  memoriesUnlocked: [],

  // Elecciones tomadas { eventoId: 'a' | 'b' }
  choices: {},

  // Interacciones completadas (para saber qué ya se clickeó)
  interactionsDone: [],

  // Si el jugador ya terminó al menos una partida
  hasCompletedOnce: false,
};

// Estado persistente (sobrevive entre sesiones)
const saveData = {
  hasCompletedOnce: false,

  // Recuerdos desbloqueados ALGUNA VEZ (para la pantalla Recuerdos)
  memoriesEverUnlocked: [],

  // Escenas visitadas alguna vez (para la Galería)
  // Cada escena se registra con su bg ID al visitarla
  scenesVisited: [],

  // Si alguna vez se llegó al Final Real (4 recuerdos)
  hasSeenRealEnding: false,

  // Total de partidas jugadas
  timesPlayed: 0,
};

// ── Cargar save desde localStorage ──────────────────────
function loadSave() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(saveData, saved);
    // Sincronizar estado de sesión con save
    gameState.hasCompletedOnce = saveData.hasCompletedOnce;
  } catch (e) {
    console.warn('No se pudo cargar el save:', e);
  }
}

// ── Guardar save en localStorage ────────────────────────
function persistSave() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn('No se pudo guardar:', e);
  }
}

// ── Reiniciar estado de partida (nueva partida) ──────────
function resetGameState() {
  gameState.clockHour       = 12;
  gameState.currentScene    = 'intro';
  gameState.memoriesUnlocked = [];
  gameState.choices         = {};
  gameState.interactionsDone = [];
}

// ── Desbloquear un recuerdo ──────────────────────────────
function unlockMemory(memoryId) {
  if (!gameState.memoriesUnlocked.includes(memoryId)) {
    gameState.memoriesUnlocked.push(memoryId);
  }
  if (!saveData.memoriesEverUnlocked.includes(memoryId)) {
    saveData.memoriesEverUnlocked.push(memoryId);
    persistSave();
  }
}


// ── Marcar escena visitada (para Galería) ────────────────
function markSceneVisited(bgId) {
  if (!bgId) return;
  if (!saveData.scenesVisited.includes(bgId)) {
    saveData.scenesVisited.push(bgId);
    persistSave();
  }
}

// ── Marcar que se llegó al Final Real ────────────────────
function markRealEndingSeen() {
  if (!saveData.hasSeenRealEnding) {
    saveData.hasSeenRealEnding = true;
    persistSave();
  }
}

// ── Marcar interacción como hecha ────────────────────────
function markInteractionDone(id) {
  if (!gameState.interactionsDone.includes(id)) {
    gameState.interactionsDone.push(id);
  }
}
function isInteractionDone(id) {
  return gameState.interactionsDone.includes(id);
}

// ── Avanzar el reloj ────────────────────────────────────
// minutes: minutos a avanzar
function advanceClock(minutes) {
  gameState.clockHour += minutes / 60;
  // Normalizar a 24h
  if (gameState.clockHour >= 24) gameState.clockHour -= 24;
  // Actualizar UI del reloj
  if (typeof updateClockUI === 'function') updateClockUI(gameState.clockHour);
  // Verificar si algún evento debe dispararse
  if (typeof checkEventTriggers === 'function') checkEventTriggers();
}

// ── Registrar elección tomada ────────────────────────────
function registerChoice(eventId, choice) {
  gameState.choices[eventId] = choice;
}

// ── Marcar partida completada ────────────────────────────
function markGameCompleted() {
  gameState.hasCompletedOnce = true;
  saveData.hasCompletedOnce  = true;
  saveData.timesPlayed      += 1;
  persistSave();
}

// ── Inicialización ───────────────────────────────────────
loadSave();
