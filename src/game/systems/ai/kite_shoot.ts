import type { EnemyGO } from '@/game/prefabs/enemyFactory';

export function makeKiteShoot(
  scene: Phaser.Scene,
  enemy: EnemyGO,
  target: Phaser.GameObjects.GameObject,
) {
  let cd = 0;
  const range = enemy.cfg.range ?? 320;
  const rof = enemy.cfg.rof ?? 0.8;
  enemy.aiTick = (dt: number) => {
    const t = target as any;
    const dx = t.x - enemy.x;
    const dy = t.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    // keep around 0.8*range
    const v = enemy.cfg.speed;
    const desired = range * 0.8;
    const dir = dist > desired ? 1 : -1;
    const len = Math.max(dist, 1);
    enemy.setVelocity((dx / len) * v * dir, (dy / len) * v * dir);

    cd -= dt;
    if (cd <= 0 && dist < range) {
      cd = 1 / rof;
      const ang = Math.atan2(dy, dx);
      const b = scene.physics.add.sprite(enemy.x, enemy.y, 'bullet').setCircle(3);
      const speed = 300;
      b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
      (b as any).hostile = true;
      scene.time.delayedCall(3000, () => b.destroy());
    }
  };
}
