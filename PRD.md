# SeekIt: Product Requirements Document

> SeekIt is an inverse fog-of-war cartographic memory explorer.

**Type:** Website (mobile-first, works on laptop) | **Team:** 2 people | **Build time:** 5 hours | **Cost:** everything free, no API keys, no credit card

---

## 1. Overview

**One-liner:** A travel journal on a map that starts completely covered in fog. As you move through the real world (or simulate it), the fog lifts along your path, and you leave voice notes, photos and text behind on the ground you have uncovered. Some memories are sealed: you have to physically return to open them.

**Core loop**
1. The map starts as a dark, fogged world.
2. You move (live GPS or demo walk) and the fog lifts around you, permanently.
3. You drop a capsule (text, photo or voice note) where you stand.
4. You walk on. Capsules sit as pins on the uncovered ground.
5. You can replay the whole journey, watching the fog uncover and the capsules appear in order.

**Why it works for a travel hackathon:** movement through physical space is the only way to unlock anything. Without travel there is no product, so travel is the engine, not a theme layered on top.

---

## 2. Hackathon context and scoring strategy

Judging is out of 50 marks. Projects do not need to solve a real problem; the focus is on what is built and demonstrated.

| Criterion | Marks | What it means for us |
|---|---|---|
| What was built | 20 | Biggest weight. Every P0 feature must really work, not be mocked. |
| Creativity and idea | 10 | Fog of war applied to real travel, plus sealed capsules and replay. |
| Travel connection | 10 | Travel must be genuinely core. It is: moving is the only way to unlock. |
| Execution | 5 | Clean, stable, no crashes, deployed on HTTPS. |
| Demo and experience | 5 | A rehearsed 3-minute demo that never depends on venue Wi-Fi luck or walking outside. |

**Strategy:** 40% of the marks reward a working build, so we ship fewer features that work perfectly. The simulator exists so the demo is repeatable on a laptop. Do not start new features after the 4:00 mark.

---

## 3. Scope

### P0: must ship (the build must be demoable with only these)
| ID | Feature | Acceptance criteria |
|---|---|---|
| F1 | Fogged map | Map loads full-screen with a dark fog covering the world. OpenStreetMap/OpenFreeMap attribution visible. |
| F2 | Reveal on movement | Each accepted position uncovers its H3 cell plus neighbors. Uncovered ground stays uncovered permanently. |
| F3 | Two movement sources | "Live GPS" and "Demo walk" (keyboard + click-to-walk). A visible toggle switches between them. |
| F4 | Capsules | Create text (markdown), photo (camera or file) and voice (up to 60 s) capsules at the current position. |
| F5 | Pins and viewer | Pins appear only on uncovered ground. Tapping a pin opens a viewer that plays audio, shows the photo or renders the markdown. |
| F6 | Persistence | After a page reload, uncovered cells and capsules are still there (IndexedDB). |
| F7 | Deployed | Live on an HTTPS URL; geolocation and microphone work on a phone. |

### P1: the wow factor (build after P0 works end to end)
| ID | Feature | Acceptance criteria |
|---|---|---|
| F8 | Sealed capsules | A sealed capsule shows a padlock pin. It only opens when the user's current position is within 1 cell of it. Walk away and it locks again. |
| F9 | Timeline replay | Play/scrub bar re-runs the journey: fog uncovers in order and capsules appear when their time comes. |
| F10 | HUD | Chips showing cells uncovered, km² uncovered and distance travelled. |
| F11 | Privacy zones | "Make this area private" marks a radius around the user. Nothing is revealed and no capsule can be created inside it. |
| F12 | Seed demo journey | Settings button that generates a ~250-cell journey plus sample capsules so replay and stats look great instantly. |

### P2: stretch (only if P0 and P1 are rock solid by 3:30)
- Pulsing glow along the fog frontier.
- Export journey as GeoJSON.
- "Share my map" image export.

### Non-goals (do not build)
Accounts or login, a backend or database server, cross-device sync, native app, background tracking when the screen is off, marker clustering, Kalman filtering, offline tile caching, social features.

> **Known web limitation:** browsers cannot track location reliably in the background. We keep the screen awake with the Screen Wake Lock API while tracking. State this honestly in the pitch.

---

## 4. User flow and screens

1. **Landing:** app name, one-line tagline, two buttons: **Start exploring** (live GPS) and **Try demo walk**. A small note: "Your journey never leaves this device."
2. **Map screen (main):**
   - Full-screen map with fog.
   - Top-left: HUD chips (F10).
   - Top-right: mode toggle (GPS / Demo), replay button, settings button.
   - Bottom centre: large round **+ Capsule** button.
   - Bottom right: **Locate me** button.
   - Pulsing dot for the user's position.
3. **Composer (bottom sheet):** tabs Text, Photo, Voice. Optional title. **Seal it** toggle with helper text "You must return here to open it." Save button.
4. **Viewer (modal):** shows title, date, content. Sealed and out of range: shows a padlock plus "Return to this spot to open".
5. **Replay bar:** play/pause, scrubber, close.
6. **Settings sheet:** make this area private (F11), seed demo journey (F12), reset all data (with confirm).

---

## 5. Visual design

- **Mood:** an old explorer's map swallowed by dark fog. Revealed ground is vivid; the rest is a deep void.
- **Colors (CSS variables):** `--void: #0b0f14` (fog), `--surface: #121923`, `--teal: #2dd4bf` (accent, user dot, fog edge glow), `--amber: #f5b942` (capsules), `--text: #e6edf3`, `--muted: #8b98a5`.
- **Fog:** dark fill at roughly 0.9 opacity so the continents are faintly ghosted through; soft teal glow along the edge of uncovered areas.
- **Typography:** system font stack, or Space Grotesk / Inter self-hosted via `@fontsource` (SIL OFL).
- **Icons:** `lucide-react` (ISC).
- **Motion:** short fade on pin appearance; sheet slides up; fog edge glow is subtle.
- **Mobile first:** 16 px side gutter, thumb-reachable controls at the bottom, no horizontal scroll.

---

## 6. Technical design

### 6.1 Stack and licenses (all free, no keys)

| Need | Tool | License / terms |
|---|---|---|
| App framework | React + Vite + TypeScript | MIT |
| Map rendering | MapLibre GL JS | BSD-3-Clause |
| Map tiles and style | OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`) | Free public service, no API key. Attribution to OpenFreeMap, OpenMapTiles and OpenStreetMap contributors required (the style supplies it to MapLibre's attribution control). Map data is ODbL. |
| Hex grid | h3-js (v4) | Apache-2.0 |
| Storage | Dexie (IndexedDB wrapper) | Apache-2.0 |
| State | Zustand | MIT |
| Markdown | react-markdown | MIT |
| Icons | lucide-react | ISC |
| Voice | Browser MediaRecorder API | Built in |
| Camera and photos | `<input type="file" accept="image/*" capture>` | Built in |
| Location | Browser Geolocation API (`watchPosition`) | Built in |
| Keep screen on | Screen Wake Lock API | Built in |
| Hosting | Vercel Hobby (per-branch HTTPS previews) or Cloudflare Pages | Free tiers; Vercel Hobby is for non-commercial use, which covers a hackathon |

**Do not use:** Mapbox, Google Maps, or the public `tile.openstreetmap.org` tile server. They need billing or their usage policy forbids app-scale use.

### 6.2 Folder structure and ownership

```
src/
  types.ts                  SHARED  (A creates, changes announced)
  config.ts                 SHARED  (constants, A creates)
  db.ts                     SHARED  (Dexie schema, A creates)
  App.tsx                   SHARED  (B owns layout; renders A's <MapRoot/>, <Hud/>, <ReplayBar/>, <GpsStatus/>)
  main.tsx                  SHARED  (A1 wraps <App/> in <MapProvider>)
  store/
    fog.ts                  A   (position, revealed cells, replay, startReplay, stopReplay, resetFog)
    capsules.ts             B   (capsules, privacy cells, composer/viewer state)
  map/
    MapRoot.tsx             A   (renders MapView + UserDot + SimControls, inits the fog)
    MapView.tsx             A
    useMap.tsx              A   (MapProvider + useMap hook exposing the MapLibre instance)
    mapActions.ts           A   (locateMe)
    SimControls.tsx         A
    fogLayer.ts             A
    UserDot.tsx             A
  location/
    ingest.ts               A   (filters + reveal pipeline)
    mode.ts                 A   (setMode: starts/stops simulator or GPS)
    gps.ts                  A
    simulator.ts            A
    wakeLock.ts             A
  features/
    replay/                 A
    hud/                    A
    seed/                   A   (demo journey generator)
    capsules/               B   (Composer, Recorder, PhotoPicker, Viewer, PinsLayer)
    privacy/                B
    settings/               B
  ui/                       B   (Landing, TopBar, BottomBar, Sheet, theme.css)
public/demo/                B   (own photos for demo seeds)
```

Shared files are changed only after announcing it in the team chat. Everything else is touched only by its owner.

**Contract stubs:** in task A1, Person A also commits stub versions (empty bodies, correct exports) of every file that the other side imports: `store/fog.ts`, `store/capsules.ts`, `location/mode.ts`, `map/mapActions.ts`, `map/useMap.tsx`, `map/MapRoot.tsx`, `features/seed/seedJourney.ts`, and null-returning `Hud`, `GpsStatus` and `ReplayBar` components. That way both people can compile and import against the contract from minute 25, and each owner simply replaces the bodies.

### 6.3 Constants (`src/config.ts`)

```ts
export const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const H3_RES = 10;            // hex edge ~65 m
export const REVEAL_K = 1;           // current cell + 1 ring of neighbors
export const MAX_ACCURACY_M = 50;    // reject GPS fixes worse than this
export const MAX_SPEED_KMH = 150;    // reject teleport jumps (live GPS only)
export const VOICE_MAX_S = 60;
export const PHOTO_MAX_PX = 1280;    // longest side after compression
export const SEAL_OPEN_K = 1;        // sealed capsule opens within this many rings
export const PRIVACY_K = 4;          // private zone radius in rings
export const CELL_AREA_KM2 = 0.015;  // average area of an H3 res-10 cell
export const DEFAULT_START = { lat: 0, lng: 0 }; // TODO (task A4): set to the venue coordinates; simulator start point
```

If hexes look too chunky at demo time, try `H3_RES = 11` with `REVEAL_K = 2` (smaller cells, similar reveal radius). Tune at the 3:00 mark, not before.

### 6.4 Data model (`src/types.ts`)

```ts
export type LatLng = { lat: number; lng: number };
export type Fix = LatLng & { accuracy?: number; ts: number };
export type Source = 'gps' | 'sim';

export interface RevealedCell { h3: string; ts: number }

export type CapsuleType = 'text' | 'photo' | 'voice';
export interface Capsule {
  id: string;            // crypto.randomUUID()
  lat: number; lng: number;
  h3: string;            // latLngToCell(lat, lng, H3_RES)
  type: CapsuleType;
  title?: string;
  text?: string;         // markdown (text capsules, or caption on others)
  blob?: Blob;           // photo or voice data
  mime?: string;         // MUST be stored with every blob (Safari records mp4, Chrome webm)
  createdAt: number;
  sealed: boolean;
}

export interface PrivacyZone { id: string; h3: string }   // one row per private cell
```

```ts
// src/db.ts
import Dexie, { type Table } from 'dexie';
import type { RevealedCell, Capsule, PrivacyZone } from './types';

export class FogDB extends Dexie {
  cells!: Table<RevealedCell, string>;
  capsules!: Table<Capsule, string>;
  privacy!: Table<PrivacyZone, string>;
  constructor() {
    super('seekit');
    this.version(1).stores({
      cells: 'h3, ts',
      capsules: 'id, h3, createdAt',
      privacy: 'id',
    });
  }
}
export const db = new FogDB();
```

On app start, call `navigator.storage?.persist?.()` so the browser is less likely to evict stored media.

### 6.5 Shared contract (what each side exposes to the other)

| Function / state | Owner | Used by | Behavior |
|---|---|---|---|
| `useMap()` | A | B | Returns the MapLibre `Map` instance once loaded (or `null`). B's pins layer attaches to it. |
| `useFog` store: `position`, `revealed: Map<h3, ts>`, `source`, `replay: {active, progress}` | A | B | Read-only for B. |
| `ingestPosition(fix: Fix, source: Source)` | A | A | Single entry point for GPS and simulator. Runs filters, privacy check, reveal, persistence. |
| `isRevealed(h3: string): boolean` | A | B | True if the cell is uncovered (respects replay). |
| `replayCutoffTs(): number \| null` | A | B | Null when replay is off; otherwise the timestamp up to which the journey is replayed. B hides capsules with `createdAt` after it. |
| `useCapsules` store: `capsules`, `privacyCells`, `composerOpen`, `selectedId` | B | A | A reads `privacyCells` only through `isPrivate`. |
| `isPrivate(h3: string): boolean` | B | A | `ingestPosition` calls this and drops fixes inside private zones. |
| `addCapsule(input)` | B | B | Uses the current `position`; computes `h3`; writes to Dexie and store. Refuses inside private zones. |
| `canOpen(capsule): boolean` | B | B | `!sealed`, or the user's cell is within `SEAL_OPEN_K` rings of the capsule's cell. |
| `hydrateCapsules()` | B | B | Loads capsules from Dexie into the store; called once on startup from `App.tsx`. |
| `setMode(source: Source)` | A | B | Switches between live GPS and the simulator. Called by the landing buttons and the top-bar toggle. |
| `locateMe()` | A | B | Flies the map to the current position. Called by the bottom-bar button. |
| `startReplay()` / `stopReplay()` | A | B | Opens and closes timeline replay. Called by the top-bar Replay button. |
| `seedDemoJourney(center: LatLng): Promise<LatLng[]>` | A | B | Generates about 250 revealed cells and returns 3 points along the path; B's `seedDemoCapsules(points)` places sample capsules there. |
| `resetFog()` | A | B | Clears revealed cells (store and Dexie). The settings sheet's Reset calls it. |
| `<Hud/>`, `<GpsStatus/>`, `<ReplayBar/>` | A | B | Components that B's `App.tsx` mounts once on the map screen. |

### 6.6 Fog algorithm

- The fog is one GeoJSON polygon covering the world, with **one hole per uncovered H3 cell**. H3 cells at the same resolution never overlap, so no polygon clipping is needed.
- Hole ring: `cellToBoundary(cell, true)` (the `true` gives `[lng, lat]` order and a closed ring).
- World ring: `[[-180,-85],[180,-85],[180,85],[-180,85],[-180,-85]]`.
- Map layers (added after the style loads, above all base layers so labels are hidden too):
  1. `fog-fill`: fill layer on the polygon, color `--void`, opacity about 0.9.
  2. `fog-edge`: line layer on a separate source containing only the hole rings, teal, `line-width` about 6, `line-blur` about 8, low opacity, for the cloud-edge glow.
- On every accepted fix: compute `latLngToCell(lat, lng, H3_RES)`, then `gridDisk(cell, REVEAL_K)`. Add only cells not already in `revealed`. If any were added, persist them to Dexie and call `source.setData(...)` once. Never call `setData` on a tick that added nothing.
- A few thousand holes is fine for performance. Ignore cells that straddle the antimeridian.

### 6.7 Movement pipeline (`ingestPosition`)

```
GPS watchPosition ──┐
                    ├─> ingestPosition(fix, source)
Simulator (WASD,    │      1. if source = 'gps': drop if accuracy > MAX_ACCURACY_M
click-to-walk) ─────┘      2. if source = 'gps': drop if implied speed from last accepted fix > MAX_SPEED_KMH
                           3. cell = latLngToCell(...); if isPrivate(cell): update dot only, no reveal
                           4. update store.position
                           5. reveal gridDisk(cell, REVEAL_K) (new cells only), persist, update fog
                           6. add haversine distance from last accepted fix to the distance counter
```

- **GPS options:** `{ enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }`. Handle permission denied and unavailable errors with a friendly message plus a "Use demo walk instead" button.
- **Simulator:** arrow keys / WASD move about 30 m per step; click on the map walks the dot there in a straight line, with a speed selector (1x, 5x, 20x). Simulated fixes skip steps 1 and 2.
- Request a screen wake lock while tracking is on; release it when it stops.

### 6.8 Capsule rules

- A capsule is created at the user's current position, which is always on uncovered ground.
- **Pin visibility:** a pin renders only if `isRevealed(capsule.h3)` and (when replay is active) `capsule.createdAt <= replayCutoffTs()`.
- **Voice:** `MediaRecorder`, auto-stop at `VOICE_MAX_S`. Choose the first supported type from `['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']` using `MediaRecorder.isTypeSupported`. Store the blob **and** its `mime`.
- **Photo:** compress to JPEG (quality about 0.8, longest side `PHOTO_MAX_PX`) via a canvas before storing.
- **Text:** markdown rendered with `react-markdown`.
- **Sealed:** pin shows a padlock. Content is hidden and the viewer shows the "return to open" state until `canOpen` is true. Use `gridDisk(userCell, SEAL_OPEN_K).includes(capsule.h3)`, not `gridDistance` (which can throw for far-apart cells).
- **Privacy zone:** "Make this area private" writes `gridDisk(userCell, PRIVACY_K)` cells to the `privacy` table.

### 6.9 Replay

- Sort `revealed` cells by `ts`. Replay `progress` goes from 0 to 1 and maps to the first `floor(progress * N)` cells, which avoids long idle gaps in real time. A "Play" button animates progress over about 15 seconds.
- `replayCutoffTs()` returns the `ts` of the last visible cell; capsules created after it are hidden.
- The fog layer redraws from the visible subset only while replay is active; closing replay restores the full set.

---

## 7. Cross-platform dev setup

**Person A: MacBook. Person B: Windows.** The app must run identically on both.

| Topic | Rule |
|---|---|
| Node | Both install the current LTS (22 or newer). Add `.nvmrc` and `"engines": {"node": ">=22"}`. |
| Line endings | A adds `.gitattributes` with `* text=auto eol=lf`. B runs `git config --global core.autocrlf input`. |
| npm scripts | Must be cross-platform. No `rm -rf`, no `VAR=x cmd` prefixes, no bash-only syntax. Tell Antigravity this. |
| Filename case | macOS and Windows both ignore case locally, but Vercel builds on Linux and does not. Every import must match the file's exact casing. |
| Repo location | B keeps the repo outside OneDrive (for example `C:\dev\seekit`) to avoid sync trouble with `node_modules`. |
| Phone testing | Geolocation and microphone need HTTPS. Use the Vercel branch preview URL, or `cloudflared tunnel --url http://localhost:5173` (free). For a tunnel, set `server: { host: true, allowedHosts: ['.trycloudflare.com'] }` in `vite.config.ts`. |
| Browsers | A tests Chrome and Safari (iPhone Safari records voice as mp4/aac). B tests Chrome and Edge (and Android Chrome if available, which records webm/opus). |
| Laptop GPS | Laptop location is Wi-Fi based and rough (100 m or worse). Use the simulator on laptops, real GPS only on a phone. |

---

## 8. Team split and schedule

Work is split into two equal vertical halves, so neither person is "the helper". Full task-by-task detail is in `Person_A_Build_Guide.pdf` and `Person_B_Build_Guide.pdf`.

| Time | Person A (MacBook): Map, Fog, Movement | Person B (Windows): Capsules, UI, Delivery |
|---|---|---|
| 0:00-0:25 | A1 Scaffold, deps, shared files, push | B1 GitHub repo, Vercel deploy, brand assets and tokens |
| 0:25-0:55 | A2 MapView, OpenFreeMap, user dot | B2 App shell: landing, top and bottom bars, sheets |
| 0:55-1:40 | A3 Reveal engine, fog layer, cell persistence | B3 Composer: text, photo, voice, save |
| 1:40-2:20 | A4 Simulator and mode toggle wiring | B4 Pins layer and capsule viewer |
| 2:20-2:50 | A5 Live GPS, filters, wake lock | B5 Privacy zones and settings sheet |
| 2:50-3:20 | **Joint integration** | **Joint integration** |
| 3:20-4:00 | A6 Replay, HUD, seed demo journey | B6 Sealed capsules and visual polish |
| **4:00** | **FEATURE FREEZE** | **FEATURE FREEZE** |
| 4:00-5:00 | A7 Performance, Safari and phone testing, demo route | B7 README, pitch, backup recording, final deploy |
| Last 20 min | Two full rehearsals together | Two full rehearsals together |

Sync points (both stop, merge to `main`, and verify): **1:40**, **2:50** (integration), **4:00** (freeze).

---

## 9. Git workflow

- `main` is always deployable; Vercel auto-deploys it. Every other branch gets its own HTTPS preview URL.
- A works on `feat/a-*` branches, B on `feat/b-*` branches. Merge to `main` at sync points and whenever a task is verified.
- Pull `main` before starting each task. Commit after every task, with a clear message.
- Never edit a file owned by the other person; ask them in chat instead.
- At 4:00, tag the freeze: `git tag v0-freeze`. After that, bug fixes only.

---

## 10. Demo script (3 minutes) and pitch

1. **Hook (15 s):** "Every map shows you everything. SeekIt shows you nothing, until you go there."
2. **Fog (20 s):** dark map. Press Demo walk.
3. **Reveal (30 s):** walk with the arrow keys; the fog lifts along the path. Mention that on a phone this runs on real GPS.
4. **Capsule (40 s):** drop a voice note, a photo and a text capsule. Open one in the viewer.
5. **Sealed (30 s):** seal a capsule, walk away so it locks, show the padlock and "Return to open", walk back and it opens.
6. **Replay (25 s):** hit replay, watch the journey rebuild with capsules appearing.
7. **Privacy and close (20 s):** show the private-zone toggle. Close: "Travel is the only way to unlock it."

**Backup:** record a screen capture of a perfect run and keep it ready in case Wi-Fi or tiles fail on stage.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Venue Wi-Fi is weak and tiles do not load | Load the map once beforehand so tiles are cached by the browser; keep the backup recording. |
| Safari records voice differently | Store `mime` with every blob; test playback on an iPhone before the freeze. |
| GPS jumps or is inaccurate indoors | Accuracy and speed filters; use the simulator for the stage demo. |
| Fog layer slows down | Update the source only when new cells were added; raise `H3_RES`/lower `REVEAL_K` only if needed. |
| Merge conflicts | Strict file ownership (section 6.2) and the shared-file announcement rule. |
| Antigravity quota or agent mistakes | Small, focused prompts; commit after each task; check the agent's work in the browser before moving on. |
| Last-minute scope creep | Hard freeze at 4:00. |

---

## 12. Definition of done

- [ ] Live HTTPS URL works on a phone (map loads, GPS prompt appears, microphone prompt appears).
- [ ] Fog lifts with both live GPS and demo walk.
- [ ] Text, photo and voice capsules can be created, reloaded and viewed.
- [ ] Pins hidden on fogged ground, visible on uncovered ground.
- [ ] Sealed capsule locks and unlocks by proximity.
- [ ] Replay runs smoothly from start to end.
- [ ] HUD numbers update.
- [ ] Privacy zone blocks reveals and capsule creation.
- [ ] Attribution is visible on the map.
- [ ] A backup demo recording exists.
- [ ] README explains setup in under 10 lines.

---

## Appendix A: Antigravity kickoff prompt (paste at the start of every session)

```
Read PRD.md fully, then my build guide (Person_A_Build_Guide.pdf or
Person_B_Build_Guide.pdf). We are building "SeekIt" in React + Vite + TypeScript with
MapLibre GL JS, h3-js, Dexie and Zustand. Follow the folder structure and file
ownership in PRD section 6.2: only create or edit files that I own. Do not change
shared files (types.ts, config.ts, db.ts) without telling me first. Keep npm scripts
cross-platform (my teammate is on a different OS). Do one task at a time, tell me how
to verify it in the browser, and stop after each task so I can commit.
```

## Appendix B: Legal and attribution checklist

- [ ] Only MIT, Apache-2.0, BSD, ISC and OFL-licensed dependencies (see 6.1). No paid or keyed APIs.
- [ ] Map attribution ("OpenFreeMap, OpenMapTiles, © OpenStreetMap contributors") visible on the map at all times. Do not hide MapLibre's attribution control.
- [ ] Demo photos are your own or CC0. No copyrighted game art or screenshots from strategy games.
- [ ] Fonts self-hosted from `@fontsource` (OFL) or system fonts.
- [ ] No user data is sent anywhere; everything stays in the browser's IndexedDB. Say so on the landing page.
- [ ] Add a LICENSE file (MIT) to the repo if you plan to open-source it.
