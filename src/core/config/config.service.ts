import { z } from 'zod';
import { fetchJSON } from '@/services/network';

export const LevelWave = z.object({
  time: z.number().nonnegative(),
  spawns: z.array(z.object({ enemyId: z.string(), count: z.number().int().positive() })),
});
export const LevelCfg = z.object({
  id: z.string(),
  name: z.string(),
  waves: z.array(LevelWave),
  difficultyScale: z.number().positive().default(1),
});
export type LevelCfg = z.infer<typeof LevelCfg>;

export class ConfigService {
  private cache = new Map<string, unknown>();
  async loadJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
    const json = await fetchJSON<unknown>(url);
    const parsed = schema.parse(json);
    this.cache.set(url, parsed);
    return parsed;
  }
}

export const configService = new ConfigService();
