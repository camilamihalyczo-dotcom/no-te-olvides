// ═══════════════════════════════════════════════════════
//  clock.js — Reloj analógico UI
//  El reloj es narrativo: avanza por código, no por tiempo real
// ═══════════════════════════════════════════════════════

const handHours   = document.getElementById('hand-hours');
const handMinutes = document.getElementById('hand-minutes');

// Actualiza visualmente las manecillas según la hora (0–24)
function updateClockUI(hour24) {
  // Convertir a 12h para el reloj
  const hour12 = hour24 % 12;
  const minutes = (hour24 % 1) * 60;

  // Grados: horas (30° por hora + 0.5° por minuto)
  const degHours   = hour12 * 30 + minutes * 0.5;
  // Grados: minutos (6° por minuto)
  const degMinutes = minutes * 6;

  setHandRotation(handHours,   degHours);
  setHandRotation(handMinutes, degMinutes);
}

// Rota una manecilla alrededor del centro (50,50) del SVG
function setHandRotation(handEl, degrees) {
  handEl.setAttribute('transform', `rotate(${degrees}, 50, 50)`);
}


// Ocultar / mostrar el reloj (durante recuerdos, glitches y textos de memoria)
function hideClock() {
  const c = document.getElementById('clock-container');
  if (c) {
    c.style.transition = 'opacity 0.3s ease';
    c.style.opacity = '0';
    c.style.pointerEvents = 'none';
  }
}

function showClock() {
  const c = document.getElementById('clock-container');
  if (c) {
    c.style.transition = 'opacity 0.4s ease';
    c.style.opacity = '1';
    c.style.pointerEvents = '';
  }
}

// Inicializar reloj en la hora actual del estado
updateClockUI(gameState.clockHour);
