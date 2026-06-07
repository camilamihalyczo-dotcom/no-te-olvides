// ═══════════════════════════════════════════════════════
//  events.js — Los 4 eventos narrativos
// ═══════════════════════════════════════════════════════

const eventAlert = document.getElementById('event-alert');
const firedEvents = new Set();

// ── Verificar triggers por hora ──────────────────────────
// E1 (duende):   onEnter del pasillo — basado en flag bosque-visited
// E2 (lobizón):  onEnter del bosque-entrada — basado en reloj >= 16.5
// E3 (silbido):  onEnter del exterior — basado en reloj >= 19 + E2 fired
// E4 (luz mala): aquí — basado en reloj >= 22.5 + E3 fired + escena cercana
function checkEventTriggers() {
  const h = gameState.clockHour;
  if (h >= 22.5 && !firedEvents.has('luz-mala') && firedEvents.has('silbido')) {
    const cerca = ['exterior', 'gallinero', 'living'];
    if (cerca.includes(gameState.currentScene)) {
      triggerEventLuzMala();
    }
  }
}

// ── Alerta !!! ───────────────────────────────────────────
function showEventAlert(callback, duration = 1800) {
  eventAlert.classList.remove('hidden');
  setTimeout(() => {
    eventAlert.classList.add('hidden');
    if (typeof callback === 'function') callback();
  }, duration);
}

// ── Glitch ───────────────────────────────────────────────
function playGlitch(callback, duration = 700) {
  // Ocultar el reloj durante transiciones de recuerdo/glitch
  if (typeof hideClock === 'function') hideClock();
  const el = document.createElement('div');
  el.className = 'glitch-overlay';
  document.getElementById('screen-game').appendChild(el);
  setTimeout(() => {
    el.remove();
    if (typeof callback === 'function') callback();
  }, duration);
}

// ── Fade negro ───────────────────────────────────────────
function fadeToBlack(callback, duration = 600) {
  sceneOverlay.style.transition = `background ${duration}ms ease`;
  sceneOverlay.style.background = 'rgba(0,0,0,1)';
  setTimeout(() => {
    if (typeof callback === 'function') callback();
    setTimeout(() => {
      sceneOverlay.style.transition = `background ${duration}ms ease`;
      sceneOverlay.style.background = 'rgba(0,0,0,0)';
    }, 100);
  }, duration);
}

// ══════════════════════════════════════════════════════
//  EVENTO 1: EL DUENDE (14:00)
// ══════════════════════════════════════════════════════
function triggerEventDuende() {
  firedEvents.add('duende');
  goToScene('pasillo', 300);

  setTimeout(() => {
    // Aparece el pollito en el pasillo
    addSprite('sprite-pollito', 'assets/sprites/per-03-pollito.png', {
      bottom: '28%', left: '42%', height: '80px', position: 'absolute'
    });

    showEventAlert(() => {
      // Burbuja de pensamiento
      showThought('Oh, un pollito. No debería estar aquí', 2800);
      setTimeout(() => {
        showChoices(
          { text: 'Llevarlo de vuelta',          callback: resolveEventDuendeA },
          { text: 'Tomar la siesta de todos modos', callback: resolveEventDuendeB }
        );
      }, 2900);
    });
  }, 500);
}

// Rama A: llevar el pollito → CORRECTO → recuerdo 1
function resolveEventDuendeA() {
  removeSprite('sprite-pollito');

  // Aparece la mano con el pollito — el personaje cree que está despierto
  addSprite('sprite-mano-pollito', 'assets/sprites/per-02-mano-pollito.png', {
    bottom: '10%', left: '3%', height: '320px', position: 'absolute'
  });

  showDialogue(['Ahora sí, hagamos rápido.'], () => {
    goToScene('gallinero', 400);
    setTimeout(() => {
      showDialogue(['Listo, ya no te salgas.'], () => {
        removeSprite('sprite-mano-pollito');

        // Reacción breve antes del glitch — el personaje está convencido de estar despierto
        showDialogue(['Listo. Ahora sí, a descansar un poco...'], () => {

          // Glitch de entrada al recuerdo — el personaje NO sabe que está soñando
          playGlitch(() => {
            sceneBg.style.background = '#0a0808';
            try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-01-sec-bg.jpg')"; } catch(e) {}
            hideArrows();

            showMemoryText([
              'Esperaba a que todos se fueran a dormir en la tarde',
              'para poder salir',
              'E ir a jugar con mi amigo...',
              'el duende! Sí!',
              'Durante la siesta podía ir a verlo',
              'siguiendo el camino secreto',
              '....',
              '¿dónde quedaba?',
            ], () => {
              // Glitch de salida — transición al despertar
              playGlitch(() => {
                unlockMemory(1);

                // Fade a negro — salto temporal
                fadeToBlack(() => {
                  // Aparece en la habitación (despertó sin darse cuenta de haberse dormido)
                  goToScene('habitacion-abajo', 200);
                  setTimeout(() => {
                    advanceClock(120); // E1: despierta ~16:00, listo para E2

                    // Reacción al despertar — burbuja de pensamiento (desorientado)
                    showThought('!!!', 1000);
                    setTimeout(() => {
                      // Confusión: creía estar despierto
                      showDialogue([
                        'Q- ¿qué pasó? ¿Me dormí?!',
                      ], () => {
                        showThought('Pero si yo estaba... el pollito... lo llevé al gallinero...', 3200);
                        setTimeout(() => {
                          showDialogue([
                            'Fue todo... ¿un sueño?',
                            'Estaba tan segura... pero todo fue un sueño.',
                          ], () => {
                            // Cuaderno aparece en la mesita — forzar interacción
                            window._notebookOnClose = () => {
                              showMemoryText([
                                'Ah... ya lo recuerdo.',
                                'Esa siesta. Ese verano.',
                              ], () => {
                                showDialogue([
                                  'Hay cosas que uno entierra sin darse cuenta.'
                                ]);
                              });
                            };
                            openNotebook();
                          });
                        }, 3400);
                      });
                    }, 1100);
                  }, 300);
                });
              });
            });
          });
        });
      });
    }, 500);
  });
}

// Rama B: siesta → FALLO
// El jugador puede moverse a la habitación, clickear la cama, pasa el tiempo
// y al despertar encuentra el pollito muerto en el pasillo.
function resolveEventDuendeB() {
  removeSprite('sprite-pollito');

  // Comentario corto y redirige al jugador — que camine solo hasta la cama
  showDialogue([
    'Ya lo llevo después... ahora necesito descansar.',
  ], () => {
    // Habilitar navegación manual hacia la habitación
    // Sobreescribir temporalmente el navRight del pasillo para que lleve a habitación
    goToScene('habitacion-abajo', 400);
    setTimeout(() => {
      showDialogue([
        'Esta cama...', 
        'Solo un momento.'
      ], () => {
        // Agregar hotspot de la cama para que el jugador tenga que clickearla
        addHotspot({
          id: 'cama-siesta',
          x: '20%', y: '45%', w: '60%', h: '40%', label: 'Cama',
          onInteract: () => {
            removeHotspot('cama-siesta');
            hideArrows();
            showDialogue(['Zzz...'], () => {
              // Fade para el paso del tiempo
              fadeToBlack(() => {
                advanceClock(90);
                goToScene('habitacion-abajo', 300);
                setTimeout(() => {
                  showThought('!!!', 900);
                  setTimeout(() => {
                    showDialogue([
                      '¿Cuánto tiempo dormí...?',
                      'El pollito. Lo dejé en el pasillo.',
                    ], () => {
                      // El jugador va al pasillo y encuentra el pollito
                      goToScene('pasillo', 400);
                      setTimeout(() => {
                        // Sprite del pollito muerto (usa el mismo, con filtro gris)
                        addSprite('sprite-pollito-muerto', 'assets/sprites/per-03-pollito.png', {
                          bottom: '24%', left: '42%', height: '75px',
                          position: 'absolute',
                          filter: 'grayscale(1) brightness(0.5)',
                          transform: 'rotate(90deg)'
                        });
                        showDialogue([
                          '...',
                          'El calor del pasillo. No debí haberlo dejado ahí.',
                          'No debí haberlo dejado.'
                        ], () => {
                          removeSprite('sprite-pollito-muerto');
                          // Continúa a la Fase 4 sin desbloquear el recuerdo
                          goToScene('habitacion-abajo', 400);
                        });
                      }, 500);
                    });
                  }, 1000);
                }, 400);
              });
            });
          }
        });
        showThought('Solo un momento en la cama...', 2200);
        // Mostrar flechas pero con la cama como objetivo principal
        showArrows(true, false);
      });
    }, 500);
  });
}

// ══════════════════════════════════════════════════════
//  EVENTO 2: EL LOBIZÓN (16:30)
//  Trigger: jugador entra al bosque-entrada con reloj >= 16.5 + duende fired
//  La interacción real con las trampas arranca el evento.
// ══════════════════════════════════════════════════════

function handleTrampaInteraction() {
  if (firedEvents.has('lobizón-resuelto')) return;
  // Marcar el evento como disparado en la primera interacción con las trampas
  if (!firedEvents.has('lobizón')) firedEvents.add('lobizón');

  showDialogue(['Las trampas están vacías... habría que ponerles algo de comida.'], () => {
    showChoices(
      { text: 'Volver por la comida',   callback: resolveEventLobizonA },
      { text: 'Dejarlo para después',   callback: resolveEventLobizonB }
    );
  });
}

// Rama A: poner comida → CORRECTO → recuerdo 2
// El personaje vuelve por la comida, pone las trampas, y cae dormido igual que en el evento 1.
// Despierta en la habitación unas horas después (~18:30 → 19:30).
function resolveEventLobizonA() {
  firedEvents.add('lobizón-resuelto');
  goToScene('cocina', 400);
  setTimeout(() => {
    showDialogue(['Acá estaba la comida para las trampas.'], () => {
      goToScene('bosque-entrada', 400);
      setTimeout(() => {
        showDialogue([
          'Listo.',
          'Ahora sí está todo en orden.',
          'Aunque... qué calor hace. Me pesa todo de golpe.'
        ], () => {

          playGlitch(() => {
            sceneBg.style.background = '#080a08';
            try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-02-sec-bg.jpg')"; } catch(e) {}
            hideArrows();

            showMemoryText([
              'Siempre dejábamos algo en el camino...',
              'Una canasta con comida. Para el lobizón, decíamos.',
              'Algo se movió entre los árboles esa tarde.',
              'Corrimos. Nos reímos.',
              'No sabíamos qué era real.',
            ], () => {
              playGlitch(() => {
                unlockMemory(2);

                // Mismo patrón que evento 1: fade a negro → despierta en habitación
                fadeToBlack(() => {
                  goToScene('habitacion-abajo', 200);
                  setTimeout(() => {
                    // E2: despierta ~19:00, listo para E3 del silbido
                    advanceClock(150);

                    showThought('!!!', 1000);
                    setTimeout(() => {
                      showDialogue([
                        '¿Qué pasó...? ¿Me quedé sin querer?',
                        'Otra vez no. Esto ya es raro.',
                      ], () => {
                        showThought('Soñé con el bosque. Con cuando éramos chicos.', 3000);
                        setTimeout(() => {
                          showDialogue([
                            'Fue tan real...',
                          ], () => {
                            window._notebookOnClose = () => {
                              showMemoryText([
                                'Ya lo recuerdo.',
                                'Esa tarde en el bosque.',
                              ], () => {
                                // Motivar al jugador a salir — el E3 se dispara al llegar al exterior
                                showDialogue([
                                  '...',
                                  'Ya es tarde. Mejor salgo a ver cómo está todo afuera.',
                                  'Hace rato que no veo al perro.',
                                ]);
                              });
                            };
                            openNotebook();
                          });
                        }, 3200);
                      });
                    }, 1100);
                  }, 300);
                });
              });
            });
          });

        });
      }, 500);
    });
  }, 500);
}

// Rama B: dejarlo para después → FALLO
// El personaje se va, el zorro entra al gallinero.
// La consecuencia se muestra ahora mismo (escena del gallinero con gallinas muertas)
// antes de continuar, para que no quede en el aire.
function resolveEventLobizonB() {
  firedEvents.add('lobizón-resuelto');

  showDialogue([
    'Ya lo haré después...',
    'Ahora tengo otras cosas en qué pensar.'
  ], () => {
    // Fix: avanzar suficiente para llegar a ≥19:00 antes de ir al exterior
    advanceClock(150);
    gameState.choices['lobizón'] = 'b';

    goToScene('gallinero', 400);
    setTimeout(() => {
      sceneBg.style.filter = 'brightness(0.6) saturate(0.7)';
      showDialogue([
        '...',
        'Qué silencio raro.',
      ], () => {
        addSprite('sprite-zorro', 'assets/sprites/per-03-pollito.png', {
          bottom: '20%', left: '55%', height: '90px', position: 'absolute',
          filter: 'sepia(1) hue-rotate(20deg) brightness(0.7)',
          transform: 'scaleX(-1)'
        });
        setTimeout(() => {
          showDialogue([
            '¡El gallinero!',
            '...',
            'El zorro entró. Las trampas estaban vacías.',
            'Si hubiera puesto la comida antes...',
          ], () => {
            removeSprite('sprite-zorro');
            sceneBg.style.filter = '';
            // Al llegar al exterior, onEnter detecta clockHour >= 19 y dispara E3
            goToScene('exterior', 400);
          });
        }, 800);
      });
    }, 600);
  });
}

// ══════════════════════════════════════════════════════
//  EVENTO 3: EL SILBIDO (19:00)
//  Trigger: jugador entra al exterior con reloj ≥ 19:00
//  y E2 ya completado.
//  El personaje primero menciona que hace rato que no ve
//  al perro — eso da el argumento para estar afuera de noche.
// ══════════════════════════════════════════════════════
function triggerEventSilbido() {
  firedEvents.add('silbido');

  // Cambiar fondos a versión atardecer/noche
  sceneBg.style.background = 'linear-gradient(to bottom, #0a1428 0%, #142030 50%, #1a2810 100%)';
  try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-03-patio-noche.jpg')"; } catch(e) {}

  setTimeout(() => {
    // El personaje menciona que no vio al perro en un rato —
    // justificación narrativa para estar afuera de noche.
    showDialogue([
      'Hace rato que no veo al perro.',
      'Salgo a ver si anda por ahí.',
    ], () => mostrarPerroNoche());
  }, 500);
}

function mostrarPerroNoche() {
  // Mismo perro, ahora oscurecido — ya está mirando al bosque al llegar.
  // La elección previa (silbar / no silbar en la tarde) NO afecta su aparición.
  // Siempre está acá. Lo que cambia es lo que pasa después.
  addSprite('sprite-perro-noche', 'assets/sprites/per-01-perro.png', {
    bottom: '18%', right: '28%', height: '180px', position: 'absolute',
    filter: 'brightness(0.45) contrast(1.4) saturate(0.6)'
  });

  showDialogue(['Ahí está... pero está mirando al bosque. No se mueve.'], () => {
    showChoices(
      { text: 'Silbarle',   callback: resolveEventSilbidoA },
      { text: 'Dejarlo ir', callback: resolveEventSilbidoB }
    );
  });
}

// Rama A: silbar → CORRECTO → recuerdo 3
// El perro vuelve. El personaje se relaja. Cae dormido de nuevo
// (igual que E1 y E2 — el patrón ya es reconocible para el jugador).
// Despierta en el living, desorientado. Cuaderno forzado.
// El recuerdo 3 empieza a rasgar la ambigüedad: insinúa que el "duende"
// era real, y que pensar en la hermana duele — sin nombrarlo todavía.
function resolveEventSilbidoA() {
  removeSprite('sprite-perro-noche');

  showDialogue(['*silbido*'], () => {
    // Pequeña pausa de tensión antes de que vuelva
    setTimeout(() => {
      addSprite('sprite-perro-noche', 'assets/sprites/per-01-perro.png', {
        bottom: '18%', right: '28%', height: '180px', position: 'absolute',
        filter: 'brightness(0.6) contrast(1.2)'
      });
      showDialogue(['Volvió corriendo.', 'Bien.', '...', 'Qué noche más rara.'], () => {
        removeSprite('sprite-perro-noche');

        playGlitch(() => {
          sceneBg.style.background = '#050808';
          try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-03-sec-bg.jpg')"; } catch(e) {}
          hideArrows();

          // Recuerdo 3: el "duende" guía al niño de noche con silbidos.
          // Empieza a insinuar que era una persona real.
          // Pensar en la hermana duele — pero no se nombra directamente.
          showMemoryText([
            'De noche el campo es diferente.',
            'Esperaba ese silbido.',
            'Salía a encontrarme con él aunque sabía que no debía.',
            'Me llevaba al claro. Siempre el mismo camino.',
            'Las luciérnagas.',
            '...',
            'Creía que era magia.',
            'Creía muchas cosas.',
            '...',
            'Mi hermana nunca quiso venir.',
            'Ahora entiendo por qué.',
          ], () => {
            playGlitch(() => {
              unlockMemory(3);

              // Fade a negro → despierta en el living
              fadeToBlack(() => {
                goToScene('living', 200);
                setTimeout(() => {
                  // E3: despierta ~21:00 — listo para E4 de la luz mala
                  advanceClock(90);

                  // Reacción al despertar en el living — más asustado que antes
                  showThought('!!!', 900);
                  setTimeout(() => {
                    showDialogue([
                      '¿Qué...? ¿Estoy en el living?',
                      'No recuerdo haberme sentado acá.',
                      '...',
                      'Esto ya es la tercera vez.',
                      'Me quedo dormido sin darme cuenta y después...',
                      '¿Qué me está pasando?',
                    ], () => {
                      showThought('Soñé con él otra vez. Con el bosque.', 3000);
                      setTimeout(() => {
                        showDialogue([
                          'Y con mi hermana.',
                          '...',
                          'No quiero pensar en eso.'
                        ], () => {
                          // Cuaderno forzado — igual que E1 y E2
                          window._notebookOnClose = () => {
                            showMemoryText([
                              'Ya lo recuerdo.',
                              'Esa noche en el claro.',
                            ]);
                          };
                          openNotebook();
                        });
                      }, 3200);
                    });
                  }, 1000);
                }, 300);
              });
            });
          });
        });
      });
    }, 900); // pausa de tensión antes de que el perro vuelva
  });
}

// Rama B: dejarlo ir → FALLO
// El perro se adentra en el bosque. El personaje lo observa irse.
// Avanzamos el reloj lo suficiente para que E4 se dispare al entrar al living.
function resolveEventSilbidoB() {
  removeSprite('sprite-perro-noche');
  gameState.choices['silbido'] = 'b';

  showDialogue([
    'Se fue hacia el bosque.',
    '...',
    'Ya va a volver.',
  ], () => {
    // Avanzar reloj a ~22:30 para que E4 pueda dispararse
    advanceClock(90);
    // Entrar al living activa checkEventTriggers → E4
    goToScene('living', 500);
  });
}

// ══════════════════════════════════════════════════════
//  EVENTO 4: LA LUZ MALA (22:30)
//  Trigger: checkEventTriggers() cuando reloj >= 22.5 + silbido fired
//  + jugador en exterior / gallinero / living
//
//  El gallinero está oscuro — el foco se quemó.
//  Es la última tarea de la lista de los abuelos.
//  La elección decide si el jugador obtiene el recuerdo 4 (y el final real)
//  o si el gallinero se incendia (final incompleto).
// ══════════════════════════════════════════════════════
function triggerEventLuzMala() {
  firedEvents.add('luz-mala');

  // Llevar al jugador al exterior nocturno primero
  goToScene('exterior', 400);

  setTimeout(() => {
    // El gallinero al fondo está oscuro
    sceneBg.style.filter = 'brightness(0.7) saturate(0.6)';
    showDialogue([
      'Qué oscuro está el gallinero...',
      'Ah. El foco. Lo tenía que cambiar.',
    ], () => {
      // El personaje se acerca — ir al gallinero
      goToScene('gallinero', 400);
      setTimeout(() => {
        sceneBg.style.background = 'linear-gradient(to bottom, #020408 0%, #060c14 100%)';
        try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-04-gallinero-noche-oscuro.jpg')"; } catch(e) {}
        sceneBg.style.filter = '';

        showEventAlert(() => {
          showDialogue([
            'El foco está fundido.',
            'Si lo dejo así esta noche...',
          ], () => {
            showChoices(
              { text: 'Cambiar el foco ahora',            callback: resolveEventLuzMalaA },
              { text: 'Irse a dormir, ya lo hago mañana', callback: resolveEventLuzMalaB }
            );
          });
        });
      }, 500);
    });
  }, 500);
}

// Rama A: cambiar el foco → CORRECTO → recuerdo 4
// El personaje va al cuartito, busca el foco, lo cambia.
// El recuerdo 4 es el más oscuro: los niños encuentran a la hermana del duende
// tirada cerca del estanque. Eso explica quién era el duende y por qué
// llevaba al niño al bosque — no era magia, era un hombre solo y roto.
function resolveEventLuzMalaA() {
  goToScene('cuartito', 400);
  // handleFocoInteraction() toma el control desde el cuartito
}

function handleFocoInteraction() {
  if (firedEvents.has('luz-mala-resuelto')) return;
  firedEvents.add('luz-mala-resuelto');

  showDialogue(['Acá está... el foco de repuesto.'], () => {
    goToScene('gallinero', 400);
    setTimeout(() => {
      showDialogue([
        'Listo.',
        'Ahora sí.',
        '...',
        'Qué silencio tiene el campo de noche.',
      ], () => {

        playGlitch(() => {
          sceneBg.style.background = '#01020a';
          try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-04-sec-bg.jpg')"; } catch(e) {}
          hideArrows();

          // Recuerdo 4: el más oscuro.
          // Los niños cerca del estanque de noche.
          // Encuentran a la hermana del duende. El duende llora solo.
          // El protagonista entiende por primera vez quién era ese hombre.
          showMemoryText([
            'Esa noche no íbamos a buscar al duende.',
            'Solo queríamos ver las luciérnagas cerca del estanque.',
            '...',
            'Pero había algo en el agua.',
            'Una luz que no se movía.',
            '...',
            'Era una chica.',
            'No respiraba.',
            '...',
            'Corrimos. Nunca hablamos de eso.',
            'Años después entendí que era su hermana.',
            'Que él la buscaba esa noche también.',
            'Que a lo mejor siempre la buscaba.',
            '...',
            'Y que nosotros éramos lo más parecido que encontró.',
          ], () => {
            playGlitch(() => {
              unlockMemory(4);

              // Fade → habitación, amanecer
              fadeToBlack(() => {
                goToScene('habitacion-abajo', 300);
                setTimeout(() => {
                  // Ya de madrugada — casi amanecer
                  advanceClock(180);

                  // El personaje está quieto, procesa todo
                  showThought('...', 1200);
                  setTimeout(() => {
                    showDialogue([
                      'No puedo dormir.',
                      'Llevo años sin poder dormir.',
                      'Y creo que ya sé por qué.',
                    ], () => {
                      // Cuaderno forzado — última vez
                      window._notebookOnClose = () => {
                        showMemoryText([
                          'Ya lo recuerdo todo.',
                          'Los cuatro dibujos.',
                          'Los cuatro veranos.',
                          '...',
                          'Ya sé quién era el duende.',
                        ], () => triggerFinalReal());
                      };
                      openNotebook();
                    });
                  }, 1300);
                }, 300);
              });
            });
          });
        });

      });
    }, 500);
  });
}

// Rama B: irse a dormir → FALLO → incendio del gallinero
// El personaje se va a dormir sin cambiar el foco.
// De madrugada el gallinero se incendia.
function resolveEventLuzMalaB() {
  showDialogue(['Ya mañana... estoy agotado.'], () => {
    goToScene('habitacion-abajo', 400);
    setTimeout(() => {
      advanceClock(180);
      showDialogue(['...'], () => {
        fadeToBlack(() => {
          triggerIncendio();
        });
      });
    }, 500);
  });
}

// ══════════════════════════════════════════════════════
//  FINALES
// ══════════════════════════════════════════════════════

// FINAL REAL — 4 recuerdos desbloqueados
// El protagonista por fin puede nombrar lo que vivió.
// No hay catarsis limpia — hay comprensión.
function triggerFinalReal() {
  if (gameState.memoriesUnlocked.length < 4) {
    triggerFinalIncompleto();
    return;
  }

  playGlitch(() => {
    // Amanecer en el patio de la casa — primera imagen del final real
    sceneBg.style.background = 'linear-gradient(to bottom, #f5c87a 0%, #e8a838 40%, #90b850 100%)';
    try { sceneBg.style.backgroundImage = "url('assets/backgrounds/esp-03-amanecer.jpg')"; } catch(e) {}
    hideArrows();
    hideClock();

    setTimeout(() => {
      showDialogue([
        'Salió el sol.',
        '...',
        'Hace mucho que no dormía así.',
      ], () => {

        // Cuaderno — última apertura, los 4 recuerdos nítidos
        // Al cerrarlo empieza la escena exclusiva del final real
        window._notebookOnClose = () => {
          _triggerFinalRealCabana();
        };
        openNotebook();

      });
    }, 600);
  });
}

// Escena exclusiva del Final Real:
// El personaje camina hasta la cabaña del duende en el bosque.
// Es la única vez en el juego que aparece EXT-08.
// Parado ahí, puede finalmente nombrar lo que pasó.
function _triggerFinalRealCabana() {

  // Transición al bosque — camino hacia la cabaña
  fadeToBlack(() => {

    // Sendero del bosque al amanecer — luz cálida entre los árboles
    sceneBg.style.background = 'linear-gradient(to bottom, #c8a050 0%, #70a030 50%, #284010 100%)';
    try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-07-bosque-amanecer.jpg')"; } catch(e) {}

    setTimeout(() => {
      showDialogue([
        'Nunca fui a buscarla.',
        'La cabaña.',
        'Siempre supe dónde estaba, pero nunca fui.',
      ], () => {

        // Segunda transición — llega a la cabaña
        fadeToBlack(() => {

          // EXT-08 — la cabaña del duende
          // Fondo especial exclusivo del final real
          sceneBg.style.background = 'linear-gradient(to bottom, #f0c070 0%, #c09040 30%, #487020 80%, #203010 100%)';
          try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-08-casa-duende.jpg')"; } catch(e) {}

          setTimeout(() => {

            // El personaje parado frente a la cabaña
            // Largo silencio antes de hablar
            showThought('...', 2000);

            setTimeout(() => {
              showDialogue([
                'Acá vivía.',
                '...',
                'Una cabaña en el medio del bosque.',
                'Solo.',
                '...',
                'O casi solo.',
                'Nos tenía a nosotros.',
                'A mí.',
              ], () => {

                showThought('No sé cuántos años tenía. Para un pibe de diez todos los adultos son viejos.', 4000);

                setTimeout(() => {
                  showDialogue([
                    '...',
                    'Lo dibujé para no olvidarlo.',
                    'Y después pasé años sin poder dormir para no recordarlo.',
                    '...',
                    'No era un duende.',
                    'Nunca fue un duende.',
                    '...',
                    'Era un hombre que perdió a su hermana.',
                    'Que encontró un pibe que lo seguía a cualquier lado.',
                    'Y ese pibe era yo.',
                    '...',
                    'No sé si lo que hacía estaba bien.',
                    'No sé muchas cosas.',
                    '...',
                    'Pero ya puedo pensar en él sin que me duela el pecho.',
                    'O casi.',
                    '...',
                    'Supongo que con eso alcanza por ahora.',
                  ], () => {

                    // Fade final muy lento — el más largo del juego
                    fadeToBlack(() => {
                      markGameCompleted();
                      markRealEndingSeen();
                      markSceneVisited('assets/backgrounds/ext-08-casa-duende.jpg');
                      showEndScreen('real');
                    }, 1400);

                  });
                }, 4200);
              });
            }, 2100);

          }, 700);
        });
      });
    }, 600);
  });
}

// FINAL INCOMPLETO — 1 a 3 recuerdos
// El personaje se va sin entender del todo.
// El insomnio sigue.
function triggerFinalIncompleto() {
  fadeToBlack(() => {
    sceneBg.style.background = 'linear-gradient(to bottom, #e8d4a0 0%, #c8b070 40%, #8aa040 100%)';
    try { sceneBg.style.backgroundImage = "url('assets/backgrounds/esp-03-amanecer.jpg')"; } catch(e) {}
    hideArrows();
    hideClock();

    setTimeout(() => {
      showDialogue([
        'Ya es de mañana.',
        'Qué noche rara.',
        '...',
        'Mejor me voy.',
        'Tengo cosas que hacer en la ciudad.',
      ], () => {
        showThought('Soñé con cosas que no recuerdo. Como siempre.', 3200);
        setTimeout(() => {
          showDialogue([
            'Abuelo, gracias por dejarme las llaves.',
            '...',
            'Sí, la próxima vengo con más tiempo.',
            '...',
            'Hay algo que olvidé llevarme.',
            'No recuerdo qué.',
          ], () => {
            markGameCompleted();
            showEndScreen('incompleto');
          });
        }, 3400);
      });
    }, 700);
  });
}

// INCENDIO — consecuencia del fallo en E4
function triggerIncendio() {
  sceneBg.style.background = 'linear-gradient(to bottom, #100404 0%, #3a0c04 50%, #1a0802 100%)';
  hideArrows();

  showThought('!!!', 1000);
  setTimeout(() => {
    showDialogue([
      '¡El gallinero!',
      '...',
      'El foco. El foco que no cambié.',
    ], () => {
      showDialogue([
        'Los abuelos llegaron justo a tiempo.',
        'Entre todos apagamos el fuego.',
        '...',
        'No dije nada de haber olvidado el foco.',
        'Me fui temprano a la mañana siguiente.',
        'Sin decir mucho.',
      ], () => {
        advanceClock(60);
        triggerFinalIncompleto();
      });
    });
  }, 1100);
}

function showEndScreen(type) {
  const screen = document.getElementById('screen-game');
  const endEl  = document.createElement('div');

  if (type === 'real') {
    // Final real: pantalla oscura, minimalista.
    // Solo el título del juego y los recuerdos — sin frase explicativa.
    // El jugador acaba de procesar todo, no necesita que le digan qué sintió.
    endEl.style.cssText = `
      position:absolute; inset:0; z-index:200;
      background:#080604;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:28px;
      opacity:0; transition: opacity 1.8s ease;
    `;
    endEl.innerHTML = `
      <p style="
        font-family:'Crimson Pro',serif;
        font-size:13px; letter-spacing:0.3em; text-transform:uppercase;
        color:rgba(200,168,75,0.4);
      ">No te olvides</p>
      <p style="
        font-family:'Caveat',cursive; font-size:52px;
        color:#f0e6cc; font-style:italic; letter-spacing:0.04em;
      ">Fin.</p>
      <p style="
        font-family:'Crimson Pro',serif; font-size:15px; font-style:italic;
        color:rgba(200,168,75,0.35); letter-spacing:0.08em;
        margin-top:8px;
      ">${gameState.memoriesUnlocked.length} / 4 recuerdos</p>
      <button onclick="showScreen('menu')" style="
        font-family:'Crimson Pro',serif; font-size:18px; font-style:italic;
        color:rgba(168,144,96,0.6); background:none; border:none; cursor:pointer;
        letter-spacing:1px; margin-top:24px;
        transition: color 0.3s ease;
      " onmouseover="this.style.color='#a89060'" onmouseout="this.style.color='rgba(168,144,96,0.6)'">
        Volver al menú
      </button>
    `;
    screen.appendChild(endEl);
    // Fade in lento — el último fade del juego
    requestAnimationFrame(() => requestAnimationFrame(() => {
      endEl.style.opacity = '1';
    }));

  } else {
    // Final incompleto: más abierto, con la frase que da contexto
    endEl.style.cssText = `
      position:absolute; inset:0; z-index:200;
      background:rgba(0,0,0,0.88);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:40px;
    `;
    endEl.innerHTML = `
      <p style="
        font-family:'Caveat',cursive; font-size:38px;
        color:#f0e6cc; text-align:center; max-width:580px;
        line-height:1.6; font-style:italic;
        white-space: pre-line;
      ">A veces lo que no recordamos\nes lo que más nos pesa.</p>
      <p style="
        font-family:'Crimson Pro',serif; font-size:16px; font-style:italic;
        color:rgba(200,168,75,0.45); letter-spacing:0.06em;
      ">${gameState.memoriesUnlocked.length} / 4 recuerdos recuperados</p>
      <button onclick="showScreen('menu')" style="
        font-family:'Crimson Pro',serif; font-size:20px; font-style:italic;
        color:#a89060; background:none; border:none; cursor:pointer;
        letter-spacing:1px; margin-top:8px;
      ">Volver al menú</button>
    `;
    screen.appendChild(endEl);
  }

  updateMenuButtons();
}
