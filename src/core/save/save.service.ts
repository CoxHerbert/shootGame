import { openDB } from 'idb';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export interface SaveSlot {
  meta: { schemaVersion: number; updatedAt: number };
  data: unknown;
}

const DB_NAME = 'game_saves';
const STORE = 'profiles';

export class SaveService {
  private dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE);
    }
  });

  async put(id: string, data: unknown) {
    const db = await this.dbPromise;
    const payload: SaveSlot = {
      meta: { schemaVersion: 1, updatedAt: Date.now() },
      data
    };
    const str = compressToUTF16(JSON.stringify(payload));
    await db.put(STORE, str, id);
  }

  async get<T = unknown>(id: string): Promise<T | null> {
    const db = await this.dbPromise;
    const raw = await db.get(STORE, id);
    if (!raw) return null;
    const json = JSON.parse(decompressFromUTF16(raw as string));
    return json.data as T;
  }
}

export const saveService = new SaveService();
