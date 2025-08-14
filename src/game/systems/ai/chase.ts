import type { EnemyGO } from '@/game/prefabs/enemyFactory';

export function makeChase(enemy: EnemyGO, target: Phaser.GameObjects.GameObject) {
  enemy.aiTick = (dt: number) => {
    const t = target as any;
    const dx = t.x - enemy.x;
    const dy = t.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    const v = enemy.cfg.speed;
    enemy.setVelocity((dx / len) * v, (dy / len) * v);
  };
}
