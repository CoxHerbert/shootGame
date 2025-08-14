import type { LevelCfg, SpawnCmd } from '@/types/battle';

export function compileWaves(level: LevelCfg): SpawnCmd[] {
  const out: SpawnCmd[] = [];
  for (const w of level.waves) {
    for (const s of w.spawns) {
      out.push({ t: w.time, enemyId: s.enemyId, count: s.count });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

export class Spawner {
  private queue: SpawnCmd[];
  private t = 0;

  constructor(private level: LevelCfg, private emit: (enemyId: string) => void) {
    this.queue = compileWaves(level);
  }

  update(dt: number) {
    this.t += dt;
    while (this.queue.length && this.queue[0].t <= this.t) {
      const cmd = this.queue.shift()!;
      for (let i = 0; i < cmd.count; i++) {
        this.emit(cmd.enemyId);
      }
    }
  }
}
