export interface SpawnCmd { t: number; enemyId: string; count: number }
export interface LevelWave { time: number; spawns: { enemyId: string; count: number }[] }
export interface LevelCfg {
  id: string;
  name: string;
  mode: 'survival' | 'clear';
  duration: number;
  waves: LevelWave[];
  difficultyScale: number;
}

export interface EnemyCfg {
  id: string;
  hp: number;
  atk: number;
  speed: number;
  ai: string;
  range?: number;
  rof?: number;
}

export type DropItem = { item: string; min: number; max: number; weight: number };
export type DropTable = Record<string, DropItem[]>;
