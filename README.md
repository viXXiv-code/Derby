# Demolition Derby

A modern browser-based recreation of the 1984 Bally Midway arcade classic **Demolition Derby**, with enhanced physics, visual damage, and AI opponents.

**[▶ Play it here](https://YOUR-USERNAME.github.io/demolition-derby/)** *(update this link after enabling GitHub Pages)*

## How to play

Smash enemy cars until they're wrecked. Ram with your **rear** to protect your engine. You must land a hit every **45 seconds** or you're disqualified.

### Controls

**Keyboard:**
- `W` / `↑` — Drive forward
- `S` / `↓` — Reverse
- `A` / `←` — Steer left
- `D` / `→` — Steer right

Steering only works while moving (just like a real car).

**Mobile:** On-screen touch controls.

## Features

- Front-axle steering physics — cars pivot around the rear axle, not their center
- Oriented bounding box (OBB) collision detection with full momentum and angular impulse response
- Per-zone damage model — front (engine), sides, rear all tracked separately
- Persistent visual damage: scratches, dents, crumple, smoke, fire
- Procedural multi-layer crash audio
- Strategic AI opponents with distinct behaviors
- Eight classic American body styles (Crown Vic, Town Car, Impala, Imperial, Wagon, LeSabre, DeVille, Delta 88)
- Mobile and keyboard support
- Local high-score tracking

## Tech

Pure HTML5 Canvas + vanilla JavaScript. No build step, no dependencies. Open `index.html` in a browser and it runs.

## Running locally

Either open `index.html` directly in a browser, or run a simple local server from the repo folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Status

Active development. See `CLAUDE.md` for project philosophy, physics constants, and roadmap.

## Credits

Original arcade game © 1984 Bally Midway. This is an independent fan recreation, not affiliated with or endorsed by any rights holder.
