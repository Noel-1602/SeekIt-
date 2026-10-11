# SeekIt — Software Requirements Specification (SRS)
> **Document Version:** 1.0.0  
> **Target Release:** Hackathon Production MVP (v0.1.0)  
> **Classification:** Public Technical Specification  

---

## 1. System & Runtime Environment

### 1.1 Development & Build Environment
| Component | Minimum Version | Recommended | Notes |
|---|---|---|---|
| **Node.js** | `>= 20.0.0` | `22.x LTS` (see `.nvmrc`) | Required for Vite 6 build engine |
| **npm** | `>= 9.0.0` | `10.x+` | Package manager |
| **TypeScript** | `5.8.2` | `5.8.2` | Strict mode enabled (`tsconfig.json`) |
| **Vite** | `6.2.0` | `6.2.0` | Bundler & HMR server |

### 1.2 Client Browser & Platform Requirements
SeekIt is designed as a responsive, zero-install Web Application (PWA-ready) running directly inside modern browsers on mobile devices and desktop computers.

| Browser Engine | Desktop Minimum | Mobile Minimum | Required Capabilities |
|---|---|---|---|
| **Chromium** (Chrome, Edge, Brave) | Version 90+ | Version 90+ (Android) | WebGL 2.0, IndexedDB 2.0, Geolocation, WakeLock |
| **WebKit** (Safari) | Safari 15.4+ | iOS Safari 15.4+ | WebGL, IndexedDB, Geolocation |
| **Gecko** (Firefox) | Version 98+ | Version 98+ (Android) | WebGL 2.0, IndexedDB, Geolocation |

---

## 2. Browser Web API Dependencies

SeekIt operates with **zero proprietary native plugins**, leveraging native Web APIs for all sensory and hardware interactions:

| Web API | Specification | Purpose in SeekIt | Fallback Strategy |
|---|---|---|---|
| **W3C Geolocation API** | `navigator.geolocation` | Continuous GPS position tracking (`watchPosition`) | Fallback to built-in Demo Walk Simulator |
| **Screen Wake Lock API** | `navigator.wakeLock` | Keeps mobile screen illuminated while outdoors | Graceful degradation if unsupported |
| **IndexedDB API** | `window.indexedDB` | Local-first persistence for cells, capsules, and logs | Required for offline persistence |
| **MediaStream Recording API** | `navigator.mediaDevices.getUserMedia` | Captures environmental voice notes (Opus format) | Falls back to Text / Photo capsules |
| **HTML5 Canvas & WebGL** | `canvas.getContext('webgl')` | High-performance vector map rendering (MapLibre) | Canvas 2D fallback for landing animations |
| **HTML5 File API** | `<input type="file" capture>` | Mobile camera integration & image uploading | Standard file picker |

---

## 3. Software Dependencies & Package Manifest

### 3.1 Production Dependencies
| Package | Version | License | Architectural Purpose |
|---|---|---|---|
| `react` | `^19.0.0` | MIT | Core UI component lifecycle and rendering engine |
| `react-dom` | `^19.0.0` | MIT | DOM mounting and portal management |
| `maplibre-gl` | `^5.2.0` | BSD-3-Clause | Open-source WebGL vector map rendering |
| `h3-js` | `^4.1.0` | Apache-2.0 | Uber H3 discrete global hexagonal spatial tessellation (Res 9) |
| `dexie` | `^4.0.11` | Apache-2.0 | Reactive IndexedDB wrapper for local-first storage |
| `zustand` | `^5.0.3` | MIT | Minimalist, unopinionated global state management |
| `lucide-react` | `^1.16.0` | ISC | Cartographic, compass, and navigation iconography |
| `react-markdown` | `^10.1.0` | MIT | Safe, semantic markdown rendering inside capsule viewer |

### 3.2 Developer & Build Tooling
| Package | Version | Purpose |
|---|---|---|
| `@vitejs/plugin-react` | `^4.3.4` | Fast Refresh and JSX transformation |
| `typescript` | `^5.8.2` | Static type checking and compiler verification |
| `@types/geojson` | `^7946.0.16` | GeoJSON schema definitions for map layers |
| `@types/maplibre-gl` | `^1.13.2` | TypeScript bindings for MapLibre GL engine |
| `@types/react` | `^19.0.10` | React 19 type declarations |
| `@types/react-dom` | `^19.0.4` | React DOM type declarations |

---

## 4. Functional Requirements Matrix (FR)

| Req ID | Module | Requirement Description | Priority | Status |
|---|---|---|---|---|
| **FR-01** | **Cartography** | Render full-screen vector map covered in dark void fog (`#0b0f14`) with OpenFreeMap vector street tiles. | P0 | ✅ Implemented |
| **FR-02** | **Fog Engine** | Uncover host H3 cell (Resolution 9, ~105 m) plus `k-ring(1)` neighbors on every valid position update. | P0 | ✅ Implemented |
| **FR-03** | **Persistence** | Persist all uncovered cells, travel distance, and capsules in client IndexedDB across browser reloads. | P0 | ✅ Implemented |
| **FR-04** | **Movement** | Support dual movement sources: Live GPS tracking and indoor keyboard/click Demo Walk Simulator. | P0 | ✅ Implemented |
| **FR-05** | **Capsules** | Allow dropping multi-modal capsules at current user coordinates (Markdown notes, Photos, Audio notes). | P0 | ✅ Implemented |
| **FR-06** | **Audio Recording**| Record up to 60 seconds of microphone input using HTML5 MediaRecorder (Opus encoding) with waveform playback. | P0 | ✅ Implemented |
| **FR-07** | **Camera Capture** | Allow direct camera snapshot capture or file upload for photo capsules. | P0 | ✅ Implemented |
| **FR-08** | **Pin Viewer** | Render pins only on uncovered ground. Clicking a pin opens a modal displaying markdown, photo, or audio. | P0 | ✅ Implemented |
| **FR-09** | **Sealed Pins** | Support sealing capsules with spatial lock. Locked pins only open when user is within 1 cell (~100m). | P1 | ✅ Implemented |
| **FR-10** | **Timeline Replay**| Provide scrubbable timeline bar that reconstructs journey chronologically, peeling fog and popping pins. | P1 | ✅ Implemented |
| **FR-11** | **Telemetry HUD** | Collapsible HUD panel showing cells uncovered, km² revealed, distance walked, and GPS error telemetry. | P1 | ✅ Implemented |
| **FR-12** | **Privacy Zones** | Enable setting exclusion privacy zones where fog is never lifted and capsules cannot be dropped. | P1 | ✅ Implemented |
| **FR-13** | **Demo Seeder** | Provide one-click demo journey generator (~250 cells + 3 sample capsules) for instant indoor evaluation. | P1 | ✅ Implemented |
| **FR-14** | **Landing Page** | Responsive Neo-Brutalist landing page introducing SeekIt with interactive capsule inspector and direct app launch. | P1 | ✅ Implemented |

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance & Rendering
- **NFR-01 (Frame Rate):** Map view and fog layer must sustain 60 FPS on standard modern mobile GPUs and laptop integrated graphics during pan and zoom interactions.
- **NFR-02 (Bundle Efficiency):** Total production application JavaScript bundle must compile under 2 MB uncompressed and under 550 KB gzip-compressed.
- **NFR-03 (Cold Boot):** Application initial load to interactive map state must complete in `< 1.5 seconds` on 4G network speeds.

### 5.2 Privacy & Security
- **NFR-04 (Zero Data Leakage):** No location coordinates, route traces, audio recordings, or photos shall be transmitted to any remote backend server. All data must reside strictly in local IndexedDB.
- **NFR-05 (Zero Third-Party Telemetry):** Zero external analytics SDKs, Google Analytics scripts, or ad tracking pixels permitted in source code.
- **NFR-06 (Zero API Key Vulnerability):** The application must not require or bundle any paid, rate-limited, or credentialed API keys (Mapbox tokens, Google Maps keys).

### 5.3 Reliability & Offline Resilience
- **NFR-07 (Network Independence):** The Demo Walk Simulator, IndexedDB storage, capsule creator, and timeline replay must function completely offline once static assets are cached.
- **NFR-08 (Memory Leak Prevention):** Continuous movement tracking over 10,000 coordinate events must maintain stable heap memory without memory leaks.

---

## 6. Hardware & Permission Requirements

| Resource | Required For | Permission Prompt |
|---|---|---|
| **GPS / Geolocation** | Live outdoor tracking | Prompts on user clicking "Start GPS" or "Live GPS" mode |
| **Microphone** | Voice capsule recording | Prompts when user initiates audio recording in Composer |
| **Camera** | Photo memory capture | Prompts when user triggers device camera snapshot |
| **Screen Wake Lock** | Outdoor walking sessions | Acquired transparently via `navigator.wakeLock` |

---

## 7. Compliance & Attributions

- **Map Data:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- **Vector Tiles:** Hosted by [OpenFreeMap](https://openfreemap.org/) under OpenMapTiles schema.
- **Spatial Grid:** [Uber H3](https://h3geo.org/) Discrete Global Grid System (DGGS).
