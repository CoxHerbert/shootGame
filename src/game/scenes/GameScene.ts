import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GameScene');
  }

  preload() {
    // assets can be loaded here
  }

  create() {
    this.physics.world.setBounds(0, 0, 2000, 2000);

    const p = this.add.circle(400, 300, 12, 0x66ccff) as Phaser.GameObjects.Arc & {
      body: Phaser.Physics.Arcade.Body;
    };
    this.physics.add.existing(p);
    p.body.setCollideWorldBounds(true);
    this.player = p;

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  update(_: number, _dt: number) {
    const speed = 220;
    const vx = (this.cursors.left?.isDown ? -1 : 0) + (this.cursors.right?.isDown ? 1 : 0);
    const vy = (this.cursors.up?.isDown ? -1 : 0) + (this.cursors.down?.isDown ? 1 : 0);
    const len = Math.hypot(vx, vy) || 1;
    this.player.body.setVelocity((vx / len) * speed, (vy / len) * speed);
  }
}
