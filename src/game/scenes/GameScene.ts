import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;

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

    this.bullets = this.physics.add.group({
      classType: Phaser.GameObjects.Arc,
      maxSize: 120,
      runChildUpdate: false,
    });

    this.input.on('pointerdown', () => this.fire());

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  update(_: number, _dt: number) {
    const speed = 220;
    const vx = (this.cursors.left?.isDown ? -1 : 0) + (this.cursors.right?.isDown ? 1 : 0);
    const vy = (this.cursors.up?.isDown ? -1 : 0) + (this.cursors.down?.isDown ? 1 : 0);
    const len = Math.hypot(vx, vy) || 1;
    this.player.body.setVelocity((vx / len) * speed, (vy / len) * speed);

    if (this.input.keyboard?.checkDown(this.cursors.space!, 120)) {
      this.fire();
    }
  }

  private fire() {
    const speed = 560;
    const p = this.input.activePointer;
    const ang = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      p.worldX ?? this.player.x + 1,
      p.worldY ?? this.player.y,
    );

    const b = this.add.circle(this.player.x, this.player.y, 4, 0xffffff) as Phaser.GameObjects.Arc & {
      body: Phaser.Physics.Arcade.Body;
    };
    this.physics.add.existing(b);
    b.body.setCircle(4);
    b.body.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
    b.body.setAllowGravity(false);
    this.bullets.add(b);
    this.time.delayedCall(3000, () => b.destroy());
  }
}
