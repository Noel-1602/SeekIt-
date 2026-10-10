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
