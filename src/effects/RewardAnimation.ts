import Phaser from 'phaser';

function ensureParticleTexture(scene: Phaser.Scene) {
  const key = 'reward-dot';
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture(key, 8, 8);
  g.destroy();
  return key;
}

export async function playRewardAnimation(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const tex = ensureParticleTexture(scene);
    const icon = scene.add.image(fromX, fromY, tex).setScale(3).setAlpha(0.95).setDepth(1000);
    const emitter = scene.add.particles(0, 0, tex, {
      x: fromX,
      y: fromY,
      speed: { min: 80, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 20,
      blendMode: 'ADD',
    });

    const ctrlX = (fromX + toX) / 2 + Phaser.Math.Between(-60, 60);
    const ctrlY = Math.min(fromY, toY) - 120;

    scene.tweens.add({
      targets: icon,
      x: {
        getStart: () => fromX,
        getEnd: () => toX,
      },
      y: {
        getStart: () => fromY,
        getEnd: () => toY,
      },
      ease: (t: number) => {
        const x = Phaser.Math.Interpolation.QuadraticBezier(t, 0, 0.5, 1);
        return x;
      },
      duration: 700,
      onUpdate: (tw, _target: any) => {
        const t = tw.progress;
        const bx = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * ctrlX + t * t * toX;
        const by = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * ctrlY + t * t * toY;
        icon.setPosition(bx, by);
      },
      onComplete: () => {
        emitter.explode(24, toX, toY);
        const ring = scene.add.circle(toX, toY, 6, 0xffffff, 0.6).setDepth(1000);
        scene.tweens.add({
          targets: ring,
          radius: 28,
          alpha: 0,
          duration: 380,
          onComplete: () => ring.destroy(),
        });
        icon.destroy();
        setTimeout(() => emitter.destroy(), 120);
        resolve();
      },
    });
  });
}
