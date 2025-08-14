import Phaser from 'phaser';
import { RedDotManager } from '@/managers/RedDotManager';
import { EventBus, EVT } from '@/managers/EventBus';

export class MissionButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.RoundRectangle;
  private label: Phaser.GameObjects.Text;
  private dot: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number, text = 'Missions') {
    super(scene, x, y);

    this.bg = scene.add
      .roundRectangle(0, 0, 120, 40, 12, 0x2b2f3a, 0.8)
      .setStrokeStyle(2, 0x8aa0ff, 1)
      .setOrigin(0.5);

    this.label = scene.add
      .text(0, 0, text, { fontFamily: 'Arial', fontSize: '16px' })
      .setOrigin(0.5);

    this.dot = scene.add
      .ellipse(50, -14, 14, 14, 0xff3b30, 1)
      .setScale(0)
      .setDepth(2);

    this.add([this.bg, this.label, this.dot]);

    this.setSize(120, 40);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-60, -20, 120, 40),
      Phaser.Geom.Rectangle.Contains,
    )
      .on('pointerover', () => this.bg.setFillStyle(0x323949, 0.9))
      .on('pointerout', () => this.bg.setFillStyle(0x2b2f3a, 0.8));

    EventBus.on(EVT.RedDotChanged, (channel: string, on: boolean) => {
      if (channel === 'missions') this.updateDot(on);
    });

    this.updateDot(RedDotManager.get('missions'));
  }

  updateDot(on: boolean) {
    const target = on ? 1 : 0;
    this.scene.tweens.add({
      targets: this.dot,
      scale: target,
      duration: 240,
      ease: 'Back.Out',
    });

    if (on) {
      this.scene.tweens.add({
        targets: this.dot,
        scale: { from: 0.92, to: 1.1 },
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.InOut',
      });
    } else {
      this.scene.tweens.killTweensOf(this.dot);
    }
  }
}
