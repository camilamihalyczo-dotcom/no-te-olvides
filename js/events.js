// ═══════════════════════════════════════════════════════
//  events.js — Los 4 eventos narrativos
// ═══════════════════════════════════════════════════════

const eventAlert = document.getElementById('event-alert');
const firedEvents = new Set();

// El reloj sigue a los eventos, no al revés.
// Todos los disparos están en el onEnter de cada escena:
//   E1 → pasillo    E2 → bosque-entrada
//   E3 → exterior   E4 → gallinero (click en el gallinero)
function checkEventTriggers() {}

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

  addSprite('sprite-mano-pollito', 'assets/sprites/per-02-mano-pollito.png', {
    bottom: '10%', left: '3%', height: '320px', position: 'absolute'
  });

  showDialogue(['Ahora sí, hagamos rápido.'], () => {
    goToScene('gallinero', 400);
    setTimeout(() => {
      showDialogue(['Listo, ya no te salgas.'], () => {
        removeSprite('sprite-mano-pollito');

        showDialogue(['Listo. Ahora sí, a descansar un poco...'], () => {

          playGlitch(() => {
            sceneBg.style.background = '#0a0808';
            try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-01-sec-bg.jpg')"; } catch(e) {}
            hideArrows();

            showMemoryText([
              'Esperaba a que todos se fueran a dormir en la tarde',
              'para poder salir',
              'E ir a jugar con mi amigo...',
              'Mi amigo el duende',
              'Durante la siesta podía ir a verlo',
              'siguiendo el camino secreto',
              '....',
              '¿dónde quedaba?',
            ], () => {
              playGlitch(() => {
                unlockMemory(1);

                fadeToBlack(() => {
                  goToScene('habitacion-abajo', 200);
                  setTimeout(() => {
                    // Fix: setClockTo en vez de advanceClock — E1 despierta ~16:00
                    setClockTo(16);

                    showThought('!!!', 1000);
                    setTimeout(() => {
                      showDialogue([
                        'Q- ¿qué pasó? ¿Me dormí?!',
                      ], () => {
                        showThought('Pero si yo estaba... el pollito... ¿no lo llevé al gallinero?', 3200);
                        setTimeout(() => {
                          showDialogue([
                            'Fue todo... ¿un sueño?',
                            'Estaba tan seguro que fue real... pero todo fue un sueño.',
                          ], () => {
                            // Cuaderno forzado
                            window._notebookOnClose = () => {
                              showMemoryText([
                                'Ah... ya lo recuerdo.',
                                'Durante la siesta. Ese verano...',
                              ], () => {
                                showDialogue([
                                  'Hay cosas que uno entierra sin darse cuenta.',
                                  '...',
                                  // Fix: empuje narrativo hacia E2 — igual que E3 empuja al gallinero
                                  'Cierto, tenía que poner comida en las trampas.',
                                  'Mejor lo hago antes de que se haga tarde.',
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
function resolveEventDuendeB() {
  removeSprite('sprite-pollito');

  showDialogue([
    'No pasa nada, ya lo llevo después. Ahora necesito descansar.',
  ], () => {
    goToScene('habitacion-abajo', 400);
    setTimeout(() => {
      showDialogue([
        // Fix: typo "intenrar" → "intentar"
        'Al fin, voy a intentar dormir un rato... aunque no tengo sueño.',
        'Aunque sea solo un momento.'
      ], () => {
        addHotspot({
          id: 'cama-siesta',
          x: '20%', y: '45%', w: '60%', h: '40%', label: 'Cama',
          onInteract: () => {
            removeHotspot('cama-siesta');
            hideArrows();
            showDialogue(['Zzz...'], () => {
              fadeToBlack(() => {
                // Fix: setClockTo en vez de advanceClock
                setClockTo(16);
                goToScene('habitacion-abajo', 300);
                setTimeout(() => {
                  showThought('!!!', 900);
                  setTimeout(() => {
                    showDialogue([
                      '¿Cuánto tiempo dormí...?',
                      'Mierda, pasó mucho tiempo. Cierto, el pollito. Lo dejé en el pasillo.',
                    ], () => {
                      goToScene('pasillo', 400);
                      setTimeout(() => {
                        addSprite('sprite-pollito-muerto', 'assets/sprites/per-03-pollito.png', {
                          bottom: '24%', left: '42%', height: '75px',
                          position: 'absolute',
                          filter: 'grayscale(1) brightness(0.5)',
                          transform: 'rotate(90deg)'
                        });
                        showDialogue([
                          '...no puede ser.',
                          'El calor del pasillo. No debí haberlo dejado ahí.',
                          'No debí haberlo dejado.'
                        ], () => {
                          removeSprite('sprite-pollito-muerto');
                          goToScene('habitacion-abajo', 400);
                          setTimeout(() => {
                            // Fix: empuje narrativo hacia E2 — igual que rama A
                            showDialogue([
                              '...',
                              'Tenía que poner comida en las trampas también.',
                              'Mejor lo hago antes de que se haga tarde.',
                            ]);
                          }, 400);
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

  showDialogue(['Es verdad, trampas están vacías... habría que ponerles algo de comida. Aunque vine acá a descansar.'], () => {
    showChoices(
      { text: 'Volver por la comida',   callback: resolveEventLobizonA },
      { text: 'Dejarlo para después',   callback: resolveEventLobizonB }
    );
  });
}

// Rama A: poner comida → CORRECTO → recuerdo 2
function resolveEventLobizonA() {
  firedEvents.add('lobizón-resuelto');
  goToScene('cocina', 400);
  setTimeout(() => {
    showDialogue(['Genial, acá está la comida para las trampas.'], () => {
      goToScene('bosque-entrada', 400);
      setTimeout(() => {
        showDialogue([
          'Listo.',
          'Ahora sí, ya puedo dormir más tranquilo.',
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
              'Solo sabíamos que era divertido.',
              '...',
              'Era real.',
            ], () => {
              playGlitch(() => {
                unlockMemory(2);

                fadeToBlack(() => {
                  goToScene('habitacion-abajo', 200);
                  setTimeout(() => {
                    // Fix: setClockTo en vez de advanceClock
                    setClockTo(19);

                    showThought('!!!', 1000);
                    setTimeout(() => {
                      showDialogue([
                        '¿Qué pasó...? ¿Me quedé dormido sin querer?',
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
                                'Esa tarde en el bosque. Como pude olvidarlo.',
                              ], () => {
                                showDialogue([
                                  '...',
                                  'Ya es tarde.',
                                  'Mejor salgo a ver cómo está todo afuera.',
                                  'Hace rato que no veo al perro.',
                                ], () => {
                                  // Fix: goToScene en vez de triggerEventSilbido directo.
                                  // El onEnter del exterior detecta E2 completo y dispara E3.
                                  setTimeout(() => goToScene('exterior', 400), 100);
                                });
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
function resolveEventLobizonB() {
  firedEvents.add('lobizón-resuelto');

  showDialogue([
    'Ya lo haré después...',
    // Fix: typo "imsomnio" → "insomnio"
    'Vine a descansar, tengo que concentrarme en mejorar mi insomnio, o al menos intentarlo.'
  ], () => {
    gameState.choices['lobizón'] = 'b';

    // Mostrar la consecuencia en el exterior (no en el gallinero)
    // para no rozar el onEnter del gallinero que dispara E4
    goToScene('exterior', 400);
    setTimeout(() => {
      sceneBg.style.filter = 'brightness(0.6) saturate(0.7)';
      showDialogue([
        '...',
        'Qué silencio raro.',
        'El gallinero está raro también...',
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
            // Fix: typo "Simpre" → "Siempre"
            'Pero la pu... ¡Si estaba acá al lado! El zorro entró. Siempre me sale todo para la mierda.',
            'Si hubiera puesto la comida antes... es mi culpa.',
          ], () => {
            removeSprite('sprite-zorro');
            sceneBg.style.filter = '';
            // Fix: setClockTo en vez de advanceClock
            setClockTo(19);
            // Fix: goToScene exterior en vez de triggerEventSilbido directo.
            // onEnter del exterior detecta lobizón-resuelto y dispara E3.
            setTimeout(() => goToScene('exterior', 400), 100);
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

  // El jugador ya está en el exterior — el trigger viene del onEnter.
  // No hace falta goToScene. Solo seteamos el fondo nocturno y arrancamos.
  sceneBg.style.background = 'linear-gradient(to bottom, #0a0418 0%, #100828 50%, #060e08 100%)';
  try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-03-patio-noche.jpg')"; } catch(e) {}

  showEventAlert(() => {
    showDialogueLocked([
      // Fix: typo — faltaba espacio
      'Ya se hizo tarde. Hace rato que no veo al perro.',
      '¿Estará por acá?',
    ], () => mostrarPerroNoche());
  });
}

function mostrarPerroNoche() {
  // Mismo perro, ahora oscurecido — ya está mirando al bosque al llegar.
  // La elección previa (silbar / no silbar en la tarde) NO afecta su aparición.
  // Siempre está acá. Lo que cambia es lo que pasa después.
  addSprite('sprite-perro-noche', 'assets/sprites/per-01-perro.png', {
    bottom: '18%', right: '28%', height: '180px', position: 'absolute',
    filter: 'brightness(0.45) contrast(1.4) saturate(0.6)'
  });

  showDialogue(['Ahí está... pero... ¿está mirando hacia al bosque?. No se mueve. Ya me esta dando miedo.'], () => {
    showChoices(
      { text: 'Silbarle',   callback: resolveEventSilbidoA },
      { text: 'Dejarlo ir', callback: resolveEventSilbidoB }
    );
  });
}

function resolveEventSilbidoA() {
  removeSprite('sprite-perro-noche');

  showDialogue(['*silbido*'], () => {
    setTimeout(() => {
      addSprite('sprite-perro-noche', 'assets/sprites/per-01-perro.png', {
        bottom: '18%', right: '28%', height: '180px', position: 'absolute',
        filter: 'brightness(0.6) contrast(1.2)'
      });
      // Fix: typo "Que bien.Volvió" → "Qué bien. Volvió"
      showDialogue(['Qué bien. Volvió corriendo.', '¿Qué estabas viendo eh?', '...', 'Qué noche más rara.'], () => {
        removeSprite('sprite-perro-noche');

        playGlitch(() => {
          sceneBg.style.background = '#050808';
          try { sceneBg.style.backgroundImage = "url('assets/recuerdos/rec-03-sec-bg.jpg')"; } catch(e) {}
          hideArrows();

          showMemoryText([
            'De noche el campo siempre es diferente.',
            'Por algo se dice que no hay que silbar en la noche...',
            'Pero yo silbaba igual.',
            'Y él lo respondía. Siempre respondía.',
            'Salía a encontrarme con él aunque sabía que no debía.',
            'Hacia el claro. Siempre el mismo camino.',
            '¿Cómo era ese camino?',
            'Habia luciérnagas...',
            '...',
            'Creía que era magia.',
            'Antes creía en muchas cosas.',
            '...',
            'Mi hermana nunca quiso venir.',
            'Ahora entiendo por qué.',
          ], () => {
            playGlitch(() => {
              unlockMemory(3);

              fadeToBlack(() => {
                goToScene('living', 200);
                setTimeout(() => {
                  // Fix: setClockTo en vez de advanceClock
                  setClockTo(22.5);

                  showThought('!!!', 900);
                  setTimeout(() => {
                    showDialogue([
                      '¿Qué...? ¿Estoy en el living?',
                      'No recuerdo haberme sentado acá.',
                      '...',
                      'Esto ya me esta dando mucho miedo.',
                      '¿Me estoy volviendo loco? Como me voy a quedar dormido sin darme cuenta...',
                      '¿Qué me está pasando?',
                    ], () => {
                      // Fix: typo "duendeotra" → "duende otra"
                      showThought('Soñé con el duende otra vez. Con el bosque.', 3000);
                      setTimeout(() => {
                        showDialogue([
                          'Y con mi hermana.',
                          '...',
                          'Basta. No piense en eso.'
                        ], () => {
                          window._notebookOnClose = () => {
                            showMemoryText([
                              'Ya lo recuerdo.',
                              'Es de esa noche en el claro.',
                            ], () => {
                              showDialogue([
                                '...',
                                'El foco del gallinero.',
                                'Todavía no lo cambié.',
                                '¿Estará todo bien allá afuera?',
                              ], () => {
                                setTimeout(() => goToScene('gallinero', 400), 100);
                              });
                            });
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
    }, 900);
  });
}

// Rama B: dejarlo ir → FALLO
// El perro se adentra en el bosque. El personaje lo observa irse.
// No hay cuaderno ni recuerdo — pero igual lleva al gallinero
// con el mismo patrón que rama A para disparar E4.
function resolveEventSilbidoB() {
  removeSprite('sprite-perro-noche');
  gameState.choices['silbido'] = 'b';

  showDialogue([
    'Se fue hacia el bosque.',
    '...',
    'Ya va a volver... Espero.',
    '...',
    'Cierto — el foco del gallinero. Todavía no lo cambié.',
    'Mejor voy a ver cómo está todo mientras estoy afuera.',
  ], () => {
    // setClockTo en vez de advanceClock — el reloj sigue a los eventos
    setClockTo(22.5);
    // setTimeout 100ms igual que rama A — garantiza que firedEvents
    // tiene 'silbido' antes de que el onEnter del gallinero se ejecute
    setTimeout(() => goToScene('gallinero', 400), 100);
  });
}

// ══════════════════════════════════════════════════════
//  EVENTO 4: LA LUZ MALA
//  Trigger: onEnter del gallinero cuando silbido está en firedEvents.
//  El gallinero está oscuro — el foco se quemó.
//  Es la última tarea de la lista de los abuelos.
// ══════════════════════════════════════════════════════
function triggerEventLuzMala() {
  firedEvents.add('luz-mala');
  setClockTo(22.5);

  // El jugador ya está en el gallinero — llegó por su cuenta
  // después del recordatorio en el living. Arrancamos directo.
  sceneBg.style.background = 'linear-gradient(to bottom, #020408 0%, #060c14 100%)';
  try { sceneBg.style.backgroundImage = "url('assets/backgrounds/ext-04-gallinero-noche-oscuro.jpg')"; } catch(e) {}
  sceneBg.style.filter = '';
  hideArrows();

  showEventAlert(() => {
    showDialogue([
      'El foco está fundido.',
      '¿Y si lo dejo así esta noche?',
    ], () => {
      showChoices(
        { text: 'Cambiar el foco ahora',            callback: resolveEventLuzMalaA },
        { text: 'Irse a dormir, ya lo hago mañana', callback: resolveEventLuzMalaB }
      );
    });
  });
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
        '¿Y esa luz?',
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
                  // Fix: setClockTo — amanecer ~6:00
                  setClockTo(6);

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
      // Fix: setClockTo — amanecer ~6:00
      setClockTo(6);
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

                showThought('No sé cuántos años tenía. Para un nene de diez todos los adultos son viejos.', 4000);

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
        'Qué noche horrible.',
        '...',
        'Mejor me voy.',
        'Tengo cosas que hacer en la ciudad.',
      ], () => {
        showThought('Soñé con cosas que no recuerdo. Como siempre. Casi ni dormí.', 3200);
        setTimeout(() => {
          showDialogue([
            'Abuelo, gracias por dejarme las llaves.',
            '...',
            'Sí, la próxima vengo con más tiempo.',
            '...',
            'Siento que hay algo que olvidé llevarme.',
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
        'Mis abuelos llegaron justo a tiempo.',
        'Entre todos apagamos el fuego.',
        '...',
        'No dije nada de haber olvidado el foco.',
        '...',
        'Me fui temprano a la mañana siguiente.',
        'Sin decir mucho.',
      ], () => {
        // Fix: sacar advanceClock — triggerFinalIncompleto no necesita el reloj
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
