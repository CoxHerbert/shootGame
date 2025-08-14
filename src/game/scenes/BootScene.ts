import Phaser from 'phaser';
import { GameScene } from './GameScene';

export class BootScene extends Phaser.Scene {
  private started = false;

  constructor() {
    super('BootScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, '点击/按任意键开始', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const start = async () => {
      if (this.started) return;
      this.started = true;
      try {
        await this.sound?.context?.resume();
      } catch {
        // ignore
      }
      this.scene.start(GameScene.name);
    };

    this.input.keyboard?.on('keydown', start);
    this.input.once('pointerdown', start);
  }
}
