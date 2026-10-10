import type { LatLng } from './types';

export const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const H3_RES = 10; // hex edge ~65 m
export const REVEAL_K = 0; // only active cell (tight reveal)
export const MAX_ACCURACY_M = 50; // reject GPS fixes worse than this
export const MAX_SPEED_KMH = 150; // reject teleport jumps (live GPS only)
export const VOICE_MAX_S = 60;
export const PHOTO_MAX_PX = 1280; // longest side after compression
export const SEAL_OPEN_K = 1; // sealed capsule opens within this many rings
export const PRIVACY_K = 4; // private zone radius in rings
export const CELL_AREA_KM2 = 0.015; // average area of an H3 res-10 cell
export const DEFAULT_START: LatLng = { lat: 9.9816, lng: 76.5762 }; // local start point
