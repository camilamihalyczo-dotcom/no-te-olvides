// ═══════════════════════════════════════════════════════
//  dialogue.js — Sistema de diálogos, typewriter y
//                texto de recuerdo centrado
// ═══════════════════════════════════════════════════════

const dialogueBox     = document.getElementById('dialogue-box');
const dialogueText    = document.getElementById('dialogue-text');
const dialogueCursor  = document.getElementById('dialogue-cursor');
const thoughtBubble   = document.getElementById('thought-bubble');
const thoughtText     = document.getElementById('thought-text');
const choiceContainer = document.getElementById('choice-container');
const choiceBtnA      = document.getElementById('choice-a');
const choiceBtnB      = document.getElementById('choice-b');

let dialogueQueue   = [];
let isTyping        = false;
let currentFullText = '';
let typewriterTimer = null;
let onDialogueEnd   = null;

const TYPEWRITER_SPEED = 30; // ms por caracter

// ── Mostrar secuencia de diálogos ───────────────────────
function showDialogue(lines, onEnd = null) {
  dialogueQueue = [...lines];
  onDialogueEnd = onEnd;
  showDialogueBox();
  nextDialogueLine();
}

function showDialogueBox() {
  dialogueBox.classList.remove('hidden');
  hideThought();
  hideChoices();
}

function hideDialogueBox() {
  dialogueBox.classList.add('hidden');
  dialogueText.textContent = '';
}

function nextDialogueLine() {
  if (dialogueQueue.length === 0) {
    hideDialogueBox();
    const cb = onDialogueEnd;
    onDialogueEnd = null;
    if (typeof cb === 'function') cb();
    return;
  }
  const line = dialogueQueue.shift();
  typewriterWrite(line);
}

// ── Typewriter ──────────────────────────────────────────
function typewriterWrite(text) {
  isTyping        = true;
  currentFullText = text;
  dialogueText.textContent = '';
  dialogueCursor.style.visibility = 'hidden';

  let i = 0;
  clearInterval(typewriterTimer);
  typewriterTimer = setInterval(() => {
    dialogueText.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(typewriterTimer);
      isTyping = false;
      dialogueCursor.style.visibility = 'visible';
    }
  }, TYPEWRITER_SPEED);
}

function skipTypewriter() {
  clearInterval(typewriterTimer);
  isTyping = false;
  dialogueText.textContent = currentFullText;
  dialogueCursor.style.visibility = 'visible';
}

dialogueBox.addEventListener('click', () => {
  if (isTyping) skipTypewriter();
  else nextDialogueLine();
});

// ── Burbuja de pensamiento ──────────────────────────────
function showThought(text, duration = 0) {
  thoughtText.textContent = text;
  thoughtBubble.classList.remove('hidden');
  hideDialogueBox();
  hideChoices();
  if (duration > 0) setTimeout(hideThought, duration);
}

function hideThought() {
  thoughtBubble.classList.add('hidden');
}

// ── Elecciones ──────────────────────────────────────────
function showChoices(optionA, optionB) {
  choiceBtnA.textContent = optionA.text;
  choiceBtnB.textContent = optionB.text;

  choiceBtnA.onclick = () => {
    hideChoices();
    if (typeof optionA.callback === 'function') optionA.callback();
  };
  choiceBtnB.onclick = () => {
    hideChoices();
    if (typeof optionB.callback === 'function') optionB.callback();
  };

  choiceContainer.classList.remove('hidden');
  hideDialogueBox();
  hideThought();
}

function hideChoices() {
  choiceContainer.classList.add('hidden');
}

// ── Texto de recuerdo centrado (Fix 5) ──────────────────
// Muestra líneas de texto centradas sobre el fondo distorsionado.
// Cada click avanza a la siguiente línea.
// La última línea debe mostrarse completamente antes de llamar onEnd.
// onEnd: callback cuando el jugador hace click DESPUÉS de la última línea.
function showMemoryText(lines, onEnd = null) {
  hideDialogueBox();
  hideThought();
  hideChoices();
  // Asegurarse de que el reloj esté oculto durante el texto de recuerdo
  if (typeof hideClock === 'function') hideClock();

  // Crear o reutilizar el overlay
  let overlay = document.getElementById('memory-text-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'memory-text-overlay';
    document.getElementById('screen-game').appendChild(overlay);
  }
  overlay.innerHTML = '';

  let currentLine  = 0;
  let memTyping    = false;
  let memFullText  = '';
  let memTimer     = null;

  function typeMemoryLine(text, p) {
    memTyping   = true;
    memFullText = text;
    p.textContent = '';
    let i = 0;
    clearInterval(memTimer);
    memTimer = setInterval(() => {
      p.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(memTimer);
        memTyping = false;
      }
    }, 40); // un poco más lento que los diálogos para que se sienta más pesado
  }

  function showLine(index) {
    overlay.innerHTML = '';

    // Ya terminaron todas las líneas — el jugador hizo click después de la última
    if (index >= lines.length) {
      overlay.remove();
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    const p = document.createElement('p');
    p.className = 'memory-line';
    overlay.appendChild(p);
    typeMemoryLine(lines[index], p);
  }

  overlay.onclick = () => {
    // Si está escribiendo, completar instantáneamente
    if (memTyping) {
      clearInterval(memTimer);
      memTyping = false;
      const p = overlay.querySelector('.memory-line');
      if (p) p.textContent = memFullText;
      return;
    }
    // Si terminó de escribir, avanzar a la siguiente línea
    currentLine++;
    showLine(currentLine);
  };

  showLine(0);
}

function hideMemoryText() {
  const overlay = document.getElementById('memory-text-overlay');
  if (overlay) overlay.remove();
}

// ── Bloqueo de flechas de navegación (Fix 2) ───────────
function lockNavArrows() {
  document.getElementById('arrow-left').classList.add('nav-locked');
  document.getElementById('arrow-right').classList.add('nav-locked');
}

function unlockNavArrows() {
  document.getElementById('arrow-left').classList.remove('nav-locked');
  document.getElementById('arrow-right').classList.remove('nav-locked');
}

// ── Versión de showDialogue que bloquea flechas ─────────
// Usar para monólogos de introducción de escena
function showDialogueLocked(lines, onEnd = null) {
  lockNavArrows();
  showDialogue(lines, () => {
    unlockNavArrows();
    if (typeof onEnd === 'function') onEnd();
  });
}
