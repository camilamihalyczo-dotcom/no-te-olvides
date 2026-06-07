// ═══════════════════════════════════════════════════════
//  scenes.js — Sistema de escenas, navegación, hotspots
//
//  MODO DEBUG: agregar ?debug a la URL para ver los hotspots
//  visibles con etiqueta y dimensiones. Útil para la ilustradora.
//  Ejemplo: index.html?debug
// ═══════════════════════════════════════════════════════

const DEBUG = new URLSearchParams(window.location.search).has('debug');
//  entrada → living → cocina → habitacion-abajo → pasillo → exterior → gallinero → bosque-entrada
//
//  El pasillo es el conector entre el interior y el exterior.
//  Así el trigger del duende (pollito en el pasillo) se activa
//  de forma natural cuando el jugador vuelve del exterior hacia adentro.
// ═══════════════════════════════════════════════════════

const sceneBg      = document.getElementById('scene-bg');
const sceneOverlay = document.getElementById('scene-overlay');
const sceneSprites = document.getElementById('scene-sprites');
const hotspotsEl   = document.getElementById('hotspots-container');
const arrowLeft    = document.getElementById('arrow-left');
const arrowRight   = document.getElementById('arrow-right');

// ── Definición de escenas ───────────────────────────────
const SCENES = {

  // ── PRÓLOGO ──────────────────────────────────────────
  'intro': {
    bg: 'assets/backgrounds/ext-01-ruta-amanecer.jpg',
    bgColor: 'linear-gradient(to bottom, #f5c87a, #e8953a, #6a4020)',
    hotspots: [],
    navLeft: null, navRight: null,
    onEnter: () => {
      hideArrows();
      showDialogueLocked([
        'Hace días que no puedo dormir bien',
        'Tengo la mente agotada',
        'Espero que este día en el campo de mis abuelos ayude',
        'Aunque hace años que no voy, siempre fue un lugar que me tranquiliza',
        'Seguro allí logre poder dormir...',
        'Y olvidarme un poco de todo',
        'Aunque sea por un momento',
      ], () => goToScene('entrada'));
    }
  },

  // ── ENTRADA / HALL ───────────────────────────────────
  // Interior más al frente — primer lugar al entrar a la casa
  'entrada': {
    bg: 'assets/backgrounds/int-01-hall.jpg',
    bgColor: 'linear-gradient(135deg, #c8963a 0%, #8b5e2a 50%, #4a3018 100%)',
    hotspots: [
      {
        id: 'cuadro',
        x: '6%', y: '20%', w: '90px', h: '90px', label: 'Cuadro',
        onInteract: () => {
          if (isInteractionDone('cuadro')) return;
          markInteractionDone('cuadro');
          showDialogue([
            'Este cuadro... siempre estuvo en el mismo lugar.',
            'Todo acá es exactamente como lo recuerdo.'
          ], () => advanceClock(15));
        }
      }
    ],
    navLeft: null, navRight: 'living',
    onEnter: () => {
      showArrows(false, true);
      if (!isInteractionDone('llegada')) {
        markInteractionDone('llegada');
        showDialogueLocked([
          '¡Por fin! Como siempre, está todo abierto',
          'Todavía es temprano, mejor paseo un poco',
          'Al menos hasta que me dé sueño',
        ]);
      }
    }
  },

  // ── LIVING ───────────────────────────────────────────
  // entrada ← living → cocina
  'living': {
    bg: 'assets/backgrounds/int-02-living.jpg',
    bgColor: 'linear-gradient(135deg, #d4a855 0%, #9a7030 50%, #5a3a10 100%)',
    hotspots: [
      {
        id: 'nota',
        x: '35%', y: '30%', w: '120px', h: '100px', label: 'Nota',
        onInteract: () => {
          if (isInteractionDone('nota')) return;
          markInteractionDone('nota');
          showNota();
        }
      }
    ],
    navLeft: 'entrada', navRight: 'cocina',
    onEnter: () => {
      showArrows(true, true);
      if (!isInteractionDone('living-entered')) {
        markInteractionDone('living-entered');
        showDialogueLocked([
          'El living... todo igual.',
          'Hasta el sillón viejo sigue en el mismo lugar.'
        ]);
      }
    }
  },

  // ── COCINA ───────────────────────────────────────────
  // living ← cocina → habitacion-abajo
  'cocina': {
    bg: 'assets/backgrounds/int-03-cocina.jpg',
    bgColor: 'linear-gradient(135deg, #c8b870 0%, #887840 50%, #483818 100%)',
    hotspots: [
      {
        id: 'heladera',
        x: '10%', y: '20%', w: '100px', h: '200px', label: 'Heladera',
        onInteract: () => {
          if (isInteractionDone('heladera')) return;
          markInteractionDone('heladera');
          showDialogue([
            'Hasta comida para los animales tienen acá adentro.',
            'Siempre tan organizados, mis abuelos.'
          ], () => advanceClock(20));
        }
      }
    ],
    navLeft: 'living', navRight: 'habitacion-abajo',
    onEnter: () => {
      showArrows(true, true);
      if (!isInteractionDone('cocina-entered')) {
        markInteractionDone('cocina-entered');
        showDialogueLocked([
          'Qué bien, me dejaron pan casero.',
          'Hacía años que no olía esto.'
        ]);
      }
    }
  },

  // ── HABITACIÓN PLANTA BAJA ───────────────────────────
  // cocina ← habitacion-abajo → pasillo
  // La habitación con el cuaderno y la foto está ANTES del pasillo.
  // La flecha derecha (→ pasillo) se bloquea hasta completar nota + foto.
  'habitacion-abajo': {
    bg: 'assets/backgrounds/int-05-habitacion-dia.jpg',
    bgColor: 'linear-gradient(135deg, #d4c090 0%, #907840 50%, #483820 100%)',
    hotspots: [
      {
        id: 'foto-abuelos',
        x: '16%', y: '42%', w: '80px', h: '80px', label: 'Foto',
        onInteract: () => {
          if (isInteractionDone('foto-abuelos')) return;
          markInteractionDone('foto-abuelos');
          showFotoAbuelos();
        }
      },
      {
        id: 'cuaderno',
        x: '58%', y: '52%', w: '90px', h: '65px', label: 'Cuaderno',
        onInteract: () => {
          // FIX 3: si hay un evento activo esperando respuesta, ignorar el click
          const dialogueBox = document.getElementById('dialogue-box');
          const choiceContainer = document.getElementById('choice-container');
          if (dialogueBox && !dialogueBox.classList.contains('hidden')) return;
          if (choiceContainer && !choiceContainer.classList.contains('hidden')) return;
          openNotebook();
        }
      }
    ],
    navLeft: 'cocina', navRight: 'pasillo',
    onEnter: () => {
      // Bloquear la salida al pasillo hasta completar interacciones base
      const prereqsDone = ['nota', 'foto-abuelos'].every(id => isInteractionDone(id));
      showArrows(true, prereqsDone);

      if (!isInteractionDone('hab-entered')) {
        markInteractionDone('hab-entered');
        showDialogueLocked([
          'Esta solía ser mi habitación.',
          'La compartía con mi hermana.',
          '...',
          'Sigue teniendo las dos camas.'
        ]);
      }

    }
  },

  // ── PASILLO ──────────────────────────────────────────
  // habitacion-abajo ← pasillo → exterior
  //
  // El pasillo es el conector interior/exterior.
  // El evento del duende (pollito) se dispara aquí cuando el jugador
  // pasa por el pasillo DESPUÉS de haber explorado afuera (reloj >= 14:00
  // y prereqs completados). Esto garantiza que lo encuentra al volver.
  'pasillo': {
    bg: 'assets/backgrounds/int-04-pasillo.jpg',
    bgColor: 'linear-gradient(to bottom, #a07840 0%, #604820 60%, #301808 100%)',
    hotspots: [],
    navLeft: 'habitacion-abajo', navRight: 'exterior',
    onEnter: () => {
      showArrows(true, true);

      if (!isInteractionDone('pasillo-entered')) {
        markInteractionDone('pasillo-entered');
        showDialogueLocked(['El pasillo... parecía más largo cuando era chico.']);
      }

      // Evento 1 (duende): se dispara al pasar por el pasillo
      // FIX 2: condición basada en haber llegado al bosque (no en el horario).
      // Así el orden de escenas garantiza el trigger, no el reloj.
      if (
        isInteractionDone('bosque-visited') &&
        !firedEvents.has('duende')
      ) {
        setTimeout(() => triggerEventDuende(), 800);
      }
    }
  },

  // ── EXTERIOR / PATIO ─────────────────────────────────
  // pasillo ← exterior → gallinero
  'exterior': {
    bg: 'assets/backgrounds/ext-03-patio-dia.jpg',
    bgColor: 'linear-gradient(to bottom, #87ceeb 0%, #98d068 50%, #5a8830 100%)',
    hotspots: [
      {
        id: 'perro-hotspot',
        x: '48%', y: '38%', w: '130px', h: '160px', label: 'El perro',
        onInteract: () => handlePerroInteraccion()
      }
    ],
    navLeft: 'pasillo', navRight: 'gallinero',
    onEnter: () => {
      showArrows(true, true);

      // Sprite del perro solo si la interacción de tarde no está completa
      if (!isInteractionDone('perro-completo')) {
        addSprite('sprite-perro', 'assets/sprites/per-01-perro.png', {
          bottom: '18%', left: '48%', height: '200px', position: 'absolute'
        });
      } else {
        setTimeout(() => removeHotspot('perro-hotspot'), 50);
      }

      if (!isInteractionDone('exterior-entered')) {
        markInteractionDone('exterior-entered');
        showDialogueLocked([
          'Qué silencio.',
          'El campo siempre tiene ese silencio particular.'
        ]);
      }

      // E3 (silbido): se dispara al entrar al exterior de noche.
      // Chequea 'lobizón-resuelto' — flag que ambas ramas del E2 garantizan.
      if (
        gameState.clockHour >= 19 &&
        !firedEvents.has('silbido') &&
        firedEvents.has('lobizón-resuelto')
      ) {
        setTimeout(() => triggerEventSilbido(), 900);
        return;
      }

      // E4 (luz mala): mismo patrón
      if (
        gameState.clockHour >= 22.5 &&
        !firedEvents.has('luz-mala') &&
        firedEvents.has('silbido')
      ) {
        setTimeout(() => triggerEventLuzMala(), 900);
        return;
      }
    }
  },

  // ── GALLINERO ────────────────────────────────────────
  // exterior ← gallinero → bosque-entrada
  'gallinero': {
    bg: 'assets/backgrounds/ext-04-gallinero-dia.jpg',
    bgColor: 'linear-gradient(to bottom, #87ceeb 0%, #7ab050 40%, #4a7020 100%)',
    hotspots: [],
    navLeft: 'exterior', navRight: 'bosque-entrada',
    onEnter: () => {
      showArrows(true, true);
      if (!isInteractionDone('gallinero-entered')) {
        markInteractionDone('gallinero-entered');
        showDialogueLocked(['El gallinero... sigue igual de caótico.']);
      }
    }
  },

  // ── BOSQUE (entrada) ─────────────────────────────────
  // gallinero ← bosque-entrada (sin navRight)
  //
  // Si el duende aún no ocurrió: el personaje decide volver adentro.
  // Al volver, cruza el pasillo y ahí se encuentra el pollito.
  'bosque-entrada': {
    bg: 'assets/backgrounds/ext-06-bosque-entrada-dia.jpg',
    bgColor: 'linear-gradient(to bottom, #70b840 0%, #386820 50%, #183010 100%)',
    hotspots: [
      {
        id: 'trampas',
        x: '12%', y: '52%', w: '200px', h: '85px', label: 'Trampas',
        onInteract: () => {
          // FIX 1: bloqueado hasta que el evento 1 (duende) haya ocurrido
          if (!firedEvents.has('duende')) {
            showDialogue(['Las jaulas están ahí, pero no me apetece revisarlas ahora.']);
            return;
          }
          if (typeof handleTrampaInteraction === 'function') handleTrampaInteraction();
        }
      }
    ],
    navLeft: 'gallinero', navRight: null,
    onEnter: () => {
      showArrows(true, false);

      // Bloqueo narrativo: si el duende aún no ocurrió,
      // el personaje decide volver adentro. Va directo al pasillo
      // donde se encuentra el pollito y arranca el evento.
      // FIX 2: marcamos que el jugador ya llegó al bosque (trigger para evento 1)
      markInteractionDone('bosque-visited');

      if (!firedEvents.has('duende')) {
        setTimeout(() => {
          showDialogue([
            'Todavía tengo tiempo...',
            'Mejor vuelvo adentro e intento dormir la siesta.'
          ], () => {
            goToScene('pasillo', 500);
          });
        }, 500);
        return;
      }

      // Evento 2 (lobizón): marcar como disponible cuando el jugador llega al bosque
      // con el reloj >= 16:30 y el duende ya ocurrió.
      // La interacción real con las trampas (handleTrampaInteraction) es el trigger efectivo.
      if (
        gameState.clockHour >= 16.5 &&
        !firedEvents.has('lobizón') &&
        firedEvents.has('duende')
      ) {
        firedEvents.add('lobizón');
      }
    }
  },

  // ── CUARTITO DE HERRAMIENTAS ─────────────────────────
  // Accesible desde cocina (sin navegación horizontal directa en el mapa principal)
  'cuartito': {
    bg: 'assets/backgrounds/int-07-cuartito.jpg',
    bgColor: 'linear-gradient(135deg, #604828 0%, #302010 100%)',
    hotspots: [
      {
        id: 'foco',
        x: '38%', y: '28%', w: '70px', h: '70px', label: 'Foco',
        onInteract: () => {
          if (typeof handleFocoInteraction === 'function') handleFocoInteraction();
        }
      }
    ],
    navLeft: 'cocina', navRight: null,
    onEnter: () => {
      showArrows(true, false);
      if (!isInteractionDone('cuartito-entered')) {
        markInteractionDone('cuartito-entered');
        showDialogueLocked(['Acá debe estar el foco de repuesto...']);
      }
    }
  },

};

// ── Escena actual ────────────────────────────────────────
let currentSceneId = null;

// ── Cambiar a una escena ─────────────────────────────────
function goToScene(sceneId, fadeTime = 400) {
  const scene = SCENES[sceneId];
  if (!scene) { console.warn('Escena no encontrada:', sceneId); return; }

  sceneOverlay.style.transition = `background ${fadeTime}ms ease`;
  sceneOverlay.style.background = 'rgba(0,0,0,1)';

  setTimeout(() => {
    clearSprites();
    clearHotspots();
    hideDialogueBox();
    hideThought();
    hideChoices();

    sceneBg.style.background = scene.bgColor || '#1a1208';
    if (scene.bg) {
      sceneBg.style.backgroundImage = `url('${scene.bg}')`;
      sceneBg.style.backgroundSize  = 'cover';
      sceneBg.style.backgroundPosition = 'center';
    } else {
      sceneBg.style.backgroundImage = 'none';
    }

    currentSceneId = sceneId;
    gameState.currentScene = sceneId;

    // Registrar el fondo visitado para la Galería
    if (scene.bg) markSceneVisited(scene.bg);

    (scene.hotspots || []).forEach(hs => addHotspot(hs));

    sceneOverlay.style.background = 'rgba(0,0,0,0)';

    // Restaurar el reloj al volver a cualquier escena navegable
    if (typeof showClock === 'function') showClock();

    if (typeof scene.onEnter === 'function') scene.onEnter();

    // Verificar triggers de eventos en cada cambio de escena.
    // Después de onEnter para que sus flags ya estén seteados.
    setTimeout(() => {
      if (typeof checkEventTriggers === 'function') checkEventTriggers();
    }, 1000);

  }, fadeTime);
}

// ── Actualizar flechas según prerrequisitos ───────────────
function refreshArrows() {
  const scene = SCENES[currentSceneId];
  if (!scene) return;

  if (currentSceneId === 'habitacion-abajo') {
    const prereqsDone = ['nota', 'foto-abuelos'].every(id => isInteractionDone(id));
    showArrows(!!scene.navLeft, prereqsDone && !!scene.navRight);
    return;
  }
  showArrows(!!scene.navLeft, !!scene.navRight);
}

// ── Flechas ──────────────────────────────────────────────
function showArrows(left, right) {
  arrowLeft.style.display  = left  ? 'block' : 'none';
  arrowRight.style.display = right ? 'block' : 'none';
  if (left)  arrowLeft.classList.remove('nav-locked');
  if (right) arrowRight.classList.remove('nav-locked');
}

function hideArrows() {
  arrowLeft.style.display  = 'none';
  arrowRight.style.display = 'none';
}

arrowLeft.addEventListener('click', () => {
  const scene = SCENES[currentSceneId];
  if (scene && scene.navLeft) goToScene(scene.navLeft);
});
arrowRight.addEventListener('click', () => {
  // Bloquear salida de la habitación hasta completar prereqs
  if (currentSceneId === 'habitacion-abajo') {
    const prereqsDone = ['nota', 'foto-abuelos'].every(id => isInteractionDone(id));
    if (!prereqsDone) {
      showDialogue(['Aún no quiero salir. Siento que olvidé algo importante adentro.']);
      return;
    }
  }
  const scene = SCENES[currentSceneId];
  if (scene && scene.navRight) goToScene(scene.navRight);
});

// ── Sprites ──────────────────────────────────────────────
function addSprite(id, src, styles = {}) {
  if (document.getElementById(id)) return;
  const img = document.createElement('img');
  img.id  = id;
  img.src = src;
  Object.assign(img.style, { position: 'absolute', ...styles });
  sceneSprites.appendChild(img);
}

function removeSprite(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearSprites() { sceneSprites.innerHTML = ''; }

// ── Hotspots ─────────────────────────────────────────────
function addHotspot(config) {
  const el = document.createElement('div');
  el.className = 'hotspot' + (DEBUG ? ' hotspot-debug' : '');
  el.id        = 'hs-' + config.id;
  el.title     = config.label || '';
  el.style.left   = config.x;
  el.style.top    = config.y;
  el.style.width  = config.w;
  el.style.height = config.h;

  // Modo debug: etiqueta con nombre y dimensiones siempre visible
  if (DEBUG) {
    const label = document.createElement('div');
    label.className = 'hotspot-debug-label';
    label.textContent = `${config.label || config.id}  ${config.w} × ${config.h}`;
    el.appendChild(label);
  }

  el.addEventListener('click', () => {
    if (!document.getElementById('dialogue-box').classList.contains('hidden'))   return;
    if (!document.getElementById('thought-bubble').classList.contains('hidden')) return;
    if (!document.getElementById('choice-container').classList.contains('hidden')) return;
    if (typeof config.onInteract === 'function') config.onInteract();
  });
  hotspotsEl.appendChild(el);
}

function removeHotspot(id) {
  const el = document.getElementById('hs-' + id);
  if (el) el.remove();
}

function clearHotspots() { hotspotsEl.innerHTML = ''; }

// ── INTERACCIÓN DEL PERRO ────────────────────────────────
function handlePerroInteraccion() {
  if (isInteractionDone('perro-completo')) return;

  if (!isInteractionDone('nota')) {
    showDialogue(['Mejor primero reviso bien adentro, me dejaron una lista de cosas que hacer.']);
    return;
  }

  if (!isInteractionDone('perro-nombre')) {
    markInteractionDone('perro-nombre');
    showDialogue([
      '¡Perro! ¡Ey, perro!',
      'No responde...',
      'Claro, dice la nota que ya está grande.',
      'Solo responde a silbidos.'
    ], () => {
      showChoices(
        {
          text: 'Silbarle',
          callback: () => {
            removeSprite('sprite-perro');
            addSprite('sprite-perro', 'assets/sprites/per-01-perro.png', {
              bottom: '15%', left: '30%', height: '200px', position: 'absolute',
              transition: 'left 0.8s ease'
            });
            markInteractionDone('perro-completo');
            showDialogue([
              '*silbido*',
              '¡Viene! Funciona.',
              'Bien, eso es útil saberlo.'
            ], () => {
              advanceClock(15);
              refreshArrows();
            });
          }
        },
        {
          text: 'Dejarlo andar',
          callback: () => {
            const perroEl = document.getElementById('sprite-perro');
            if (perroEl) {
              perroEl.style.transition = 'left 1.2s ease, opacity 0.8s ease';
              perroEl.style.left = '110%';
              perroEl.style.opacity = '0';
              setTimeout(() => removeSprite('sprite-perro'), 1300);
            }
            markInteractionDone('perro-completo');
            showDialogue([
              'Se fue corriendo hacia el fondo del campo.',
              'Bueno... ya sabe cómo volver.'
            ], () => {
              advanceClock(15);
              refreshArrows();
            });
          }
        }
      );
    });
  }
}

// ── OVERLAYS DE OBJETOS ──────────────────────────────────

function showNota() {
  const overlay = document.createElement('div');
  overlay.id = 'nota-overlay';
  overlay.style.cssText = `
    position:absolute; inset:0; z-index:60;
    background:rgba(0,0,0,0.65);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  `;
  overlay.innerHTML = `
    <div style="
      background:#f5f0e0;
      padding:48px 56px;
      border-radius:4px;
      max-width:540px;
      font-family:'Caveat',cursive;
      font-size:28px;
      color:#2a1a0a;
      line-height:1.9;
      box-shadow:0 8px 40px rgba(0,0,0,0.8);
      position:relative;
      transform:rotate(-1deg);
    ">
      <div style="
        background:#f5d020; opacity:0.85;
        position:absolute; top:-14px; left:50%;
        transform:translateX(-50%);
        width:110px; height:22px; border-radius:2px;
      "></div>
      <p style="font-weight:600; margin-bottom:12px;">NO te olvides:</p>
      <p>· Cuidar que los pollitos no se escapen</p>
      <p>· Poner comida en las jaulas/trampa</p>
      <p>· Cambiar el foco del gallinero</p>
      <p>· Perro está grande ya, solo responde a silbidos</p>
    </div>
  `;
  overlay.addEventListener('click', () => {
    overlay.remove();
    advanceClock(30);
    refreshArrows();
  });
  document.getElementById('screen-game').appendChild(overlay);
}

function showFotoAbuelos() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute; inset:0; z-index:60;
    background:rgba(0,0,0,0.7);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  `;
  overlay.innerHTML = `
    <div style="
      width:320px; height:400px;
      background:#c8a84b;
      border:12px solid #8b6914;
      border-radius:4px;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 8px 40px rgba(0,0,0,0.9);
      overflow:hidden;
    ">
      <img src="assets/sprites/per-04-foto-abuelos.png"
        style="width:100%;height:100%;object-fit:cover;"
        onerror="this.parentElement.style.background='#8b6914';" />
    </div>
  `;
  overlay.addEventListener('click', () => {
    overlay.remove();
    showDialogue([
      'Siempre fueron personas muy sociables',
      'La casa siempre estaba llena de gente en el verano...',
    ], () => {
      advanceClock(15);
      refreshArrows();
    });
  });
  document.getElementById('screen-game').appendChild(overlay);
}

function openNotebook() {
  const isEventForced = typeof window._notebookOnClose === 'function';
  const firstTime = !isInteractionDone('cuaderno-abierto') && !isEventForced;
  if (!isInteractionDone('cuaderno-abierto') && !isEventForced) markInteractionDone('cuaderno-abierto');

  const mem = gameState.memoriesUnlocked;

  // Las 4 imágenes — borrosas hasta que se desbloquea el recuerdo correspondiente
  const slots = [1, 2, 3, 4].map(n => ({
    n,
    src: mem.includes(n)
      ? `assets/recuerdos/rec-0${n}-nitido.png`
      : `assets/recuerdos/rec-0${n}-borroso.png`,
    unlocked: mem.includes(n),
  }));

  const overlay = document.createElement('div');
  overlay.id = 'notebook-overlay';
  overlay.style.cssText = `
    position:absolute; inset:0; z-index:60;
    background:rgba(0,0,0,0.75);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    cursor:pointer; gap:16px;
  `;

  // Cuaderno de 2 páginas — página izquierda: rec 1 y 2, página derecha: rec 3 y 4
  overlay.innerHTML = `
    <div style="
      background:#f8f4ea;
      width:760px; height:500px;
      border-radius:4px;
      display:flex;
      box-shadow:0 8px 40px rgba(0,0,0,0.9);
      overflow:hidden; position:relative;
    ">
      <!-- Espiral del cuaderno -->
      <div style="
        position:absolute; left:50%; top:0; bottom:0; width:24px;
        transform:translateX(-50%);
        background:repeating-linear-gradient(to bottom,#888 0px,#888 8px,transparent 8px,transparent 18px);
        z-index:2;
      "></div>

      <!-- Página izquierda: recuerdos 1 y 2 -->
      <div style="flex:1; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:center;">
        ${slots.slice(0,2).map(s => `
          <div style="
            aspect-ratio:3/4; display:flex; align-items:center; justify-content:center;
            background:#e8e0d0; border-radius:3px; overflow:hidden;
            ${s.unlocked ? '' : 'filter:blur(3px) grayscale(0.5);'}
            position:relative;
          ">
            <img src="${s.src}" style="width:100%;height:100%;object-fit:cover;"
              onerror="this.parentElement.style.background='#c8c0b0';" />
          </div>
        `).join('')}
      </div>

      <!-- Página derecha: recuerdos 3 y 4 -->
      <div style="flex:1; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:center;">
        ${slots.slice(2,4).map(s => `
          <div style="
            aspect-ratio:3/4; display:flex; align-items:center; justify-content:center;
            background:#e8e0d0; border-radius:3px; overflow:hidden;
            ${s.unlocked ? '' : 'filter:blur(3px) grayscale(0.5);'}
            position:relative;
          ">
            <img src="${s.src}" style="width:100%;height:100%;object-fit:cover;"
              onerror="this.parentElement.style.background='#c8c0b0';" />
          </div>
        `).join('')}
      </div>
    </div>
    <p style="font-family:'Caveat',cursive;font-size:17px;color:rgba(240,230,210,0.5);">
      Click para cerrar
    </p>
  `;

  overlay.addEventListener('click', () => {
    overlay.remove();

    const postMemoryCb = window._notebookOnClose || null;
    window._notebookOnClose = null;

    if (firstTime) {
      advanceClock(25);
      showDialogueLocked([
        'Mis dibujos de cuando era chico.',
        'Dibujaba todo lo que me imaginaba...',
        'Este dibujo... ¿qué era lo que intentaba dibujar acá?'
      ], () => {
        refreshArrows();
        if (typeof postMemoryCb === 'function') postMemoryCb();
      });
    } else {
      if (typeof postMemoryCb === 'function') postMemoryCb();
    }
  });

  document.getElementById('screen-game').appendChild(overlay);
}
