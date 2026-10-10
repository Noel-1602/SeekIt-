export type LatLng = { lat: number; lng: number };
export type Fix = LatLng & { accuracy?: number; ts: number };
export type Source = 'gps' | 'sim';

export interface RevealedCell {
  h3: string;
  ts: number;
}

export type CapsuleType = 'text' | 'photo' | 'voice';

export interface Capsule {
  id: string; // crypto.randomUUID()
  lat: number;
  lng: number;
  h3: string; // latLngToCell(lat, lng, H3_RES)
  type: CapsuleType;
  title?: string;
  text?: string; // markdown (text capsules, or caption on others)
  blob?: Blob; // photo or voice data
  mime?: string; // stored with every blob
  createdAt: number;
  sealed: boolean;
}

export interface PrivacyZone {
  id: string;
  h3: string; // one row per private cell
}
