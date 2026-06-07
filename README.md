# No te olvides — Documentación técnica del proyecto

## Estructura de carpetas

```
nte/
├── index.html              ← Entrada del juego
├── css/
│   └── style.css           ← Todos los estilos
├── js/
│   ├── state.js            ← Estado global + localStorage
│   ├── clock.js            ← Reloj analógico UI
│   ├── dialogue.js         ← Sistema de diálogos y elecciones
│   ├── scenes.js           ← Escenas, navegación, hotspots
│   ├── events.js           ← Los 4 eventos narrativos + finales
│   └── game.js             ← Controlador principal + pantallas
└── assets/
    ├── backgrounds/        ← Fondos de escena (1440×810 JPG/PNG)
    │   ├── ext-01-ruta-amanecer.jpg
    │   ├── int-01-hall.jpg
    │   ├── int-02-living.jpg
    │   ├── int-03-cocina.jpg
    │   ├── int-04-pasillo.jpg
    │   ├── int-05-habitacion-dia.jpg
    │   ├── int-06-habitacion-noche.jpg
    │   ├── int-07-cuartito.jpg
    │   ├── ext-02-frente-casa-dia.jpg
    │   ├── ext-03-patio-dia.jpg
    │   ├── ext-03-patio-noche.jpg
    │   ├── ext-04-gallinero-dia.jpg
    │   ├── ext-04-gallinero-noche.jpg
    │   ├── ext-04-gallinero-oscuro.jpg
    │   ├── ext-06-bosque-entrada-dia.jpg
    │   ├── ext-06-bosque-entrada-noche.jpg
    │   ├── ext-07-bosque-profundo-noche.jpg
    │   └── ext-08-casa-duende.jpg
    ├── sprites/            ← Personajes y objetos (PNG con alpha)
    │   ├── per-01-perro.png
    │   ├── per-02-mano-pollito.png
    │   ├── per-03-pollito.png
    │   └── per-04-foto-abuelos.png
    ├── recuerdos/          ← Imágenes del cuaderno (PNG)
    │   ├── rec-01-borroso.png
    │   ├── rec-01-nitido.png
    │   ├── rec-01-sec-1.jpg
    │   ├── rec-01-sec-2.jpg
    │   ├── rec-01-sec-3.jpg
    │   ├── rec-02-borroso.png
    │   ├── rec-02-nitido.png
    │   ├── rec-02-sec-1.jpg
    │   ├── rec-02-sec-2.jpg
    │   ├── rec-03-borroso.png
    │   ├── rec-03-nitido.png
    │   ├── rec-03-sec-1.jpg
    │   ├── rec-03-sec-2.jpg
    │   ├── rec-04-borroso.png
    │   ├── rec-04-nitido.png
    │   ├── rec-04-sec-1.jpg
    │   └── rec-04-sec-2.jpg
    ├── ui/                 ← Elementos de interfaz opcionales
    └── audio/              ← Música y efectos (MP3/OGG)
        ├── bgm-01-dia.mp3
        ├── bgm-02-tarde.mp3
        ├── bgm-03-noche.mp3
        ├── bgm-04-recuerdo.mp3
        ├── bgm-05-menu.mp3
        ├── sfx-glitch.mp3
        ├── sfx-alerta.mp3
        ├── sfx-silbido.mp3
        ├── sfx-crujido.mp3
        └── sfx-cuaderno.mp3
```

---

## Cómo correrlo localmente

Abrí una terminal en la carpeta `nte/` y ejecutá cualquiera de estas opciones:

**Con Python (recomendado):**
```bash
python3 -m http.server 8080
```
Después abrí `http://localhost:8080` en el navegador.

**Con Node (si tenés live-server):**
```bash
npx live-server
```

> ⚠️ No abras `index.html` directo con doble click — el navegador bloquea la carga de imágenes locales por seguridad. Siempre usá un servidor local.

---

## Cómo agregar assets

Cada archivo va en su carpeta correspondiente con el nombre exacto que figura en la lista de arriba. El juego los carga automáticamente por ruta relativa.

Si un asset no existe todavía, el juego muestra el color placeholder definido en `scenes.js` para ese fondo. No rompe nada.

---

## Cómo agregar diálogos o modificar escenas

Todos los diálogos de exploración libre están en `js/scenes.js`, dentro del objeto `SCENES`, en la propiedad `onEnter` de cada escena o en el `onInteract` de cada hotspot.

Los diálogos de los eventos y finales están en `js/events.js`.

Formato de un diálogo:
```js
showDialogue([
  'Primera línea — el jugador hace click para avanzar',
  'Segunda línea',
  'Tercera línea',
], () => {
  // Esta función se ejecuta cuando terminan todas las líneas
  advanceClock(15); // avanzar 15 minutos
});
```

---

## Cómo avanzar el reloj

```js
advanceClock(30); // avanza 30 minutos
```

El reloj dispara automáticamente los eventos cuando llega a la hora correcta. Las horas de disparo están definidas en `js/events.js` dentro de `checkEventTriggers()`.

---

## Sistema de guardado (localStorage)

El juego guarda automáticamente en `localStorage` con la clave `nte_save`:
- Si el jugador completó al menos una partida (`hasCompletedOnce`)
- Qué recuerdos desbloqueó alguna vez (`memoriesEverUnlocked`)
- Qué imágenes de galería tiene (`galleryUnlocked`)
- Cuántas partidas jugó (`timesPlayed`)

Lo que **no** se guarda (se resetea en cada partida nueva):
- Escena actual, hora del reloj, elecciones tomadas

Para borrar el save manualmente en el navegador:
```js
localStorage.removeItem('nte_save')
```

---

## Próximos pasos (Etapa 2)

- [ ] Integrar audio (BGM por hora del día + efectos)
- [ ] Versiones nocturnas de las escenas exteriores
- [ ] Animación del cuaderno al desbloquearse (reveal de imagen borrosa → nítida)
- [ ] Pantalla de "Recuerdos" con opción de rejugar desde un recuerdo
- [ ] Pulir timing de los eventos (checkear que las precondiciones funcionen bien)
- [ ] Testing del flujo completo del final real y el incompleto
