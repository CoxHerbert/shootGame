import type Phaser from 'phaser';
import type { EnemyCfg } from '@/types/battle';

export type EnemyGO = Phaser.Physics.Arcade.Sprite & {
  hp: number;
  cfg: EnemyCfg;
  aiTick?: (dt: number) => void;
};

export function createEnemy(
  scene: Phaser.Scene,
  cfg: EnemyCfg,
  x: number,
  y: number,
): EnemyGO {
  const key = cfg.id.includes('shooter') ? 'enemy_shooter' : 'enemy_grunt';
  const e = scene.physics.add.sprite(x, y, key) as EnemyGO;
  e.setCircle(10);
  e.setCollideWorldBounds(true);
  e.hp = cfg.hp;
  e.cfg = cfg;
  return e;
}
