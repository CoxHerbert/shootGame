import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;

  constructor() {
    super('GameScene');
  }

  preload() {
    // 载入 SVG 纹理
    this.load.svg('player', '/assets/svg/player.svg', { scale: 1 });
    this.load.svg('enemy_grunt', '/assets/svg/enemy_grunt.svg', { scale: 1 });
    this.load.svg('enemy_shooter', '/assets/svg/enemy_shooter.svg', { scale: 1 });
    this.load.svg('bullet', '/assets/svg/bullet.svg', { scale: 1 });
    this.load.svg('pickup_gold', '/assets/svg/pickup_gold.svg', { scale: 1 });
    this.load.svg('ui_aim_reticle', '/assets/svg/ui_aim_reticle.svg', { scale: 1 });
    this.load.svg('tile_dark', '/assets/svg/tile_dark.svg', { scale: 1 });
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add
      .tileSprite(0, 0, width * 4, height * 4, 'tile_dark')
      .setOrigin(0);
    this.physics.world.setBounds(0, 0, bg.width, bg.height);

    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCircle(10);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.bullets = this.physics.add.group({ maxSize: 200 });
    this.enemies = this.physics.add.group({ maxSize: 50 });

    for (let i = 0; i < 8; i++) {
      const e = this.enemies.create(
        600 + Math.random() * 600,
        300 + Math.random() * 400,
        'enemy_grunt',
      ) as Phaser.Physics.Arcade.Sprite;
      e.setCircle(10);
    }

    this.physics.add.overlap(this.bullets, this.enemies, (_b, _e) => {
      const b = _b as Phaser.Physics.Arcade.Sprite;
      const e = _e as Phaser.Physics.Arcade.Sprite;
      b.destroy();
      e.destroy();
    });

    this.input.on('pointerdown', () => this.fire());
    this.input.keyboard?.on('keydown-SPACE', () => this.fire());

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, bg.width, bg.height);

    const ret = this.add
      .image(0, 0, 'ui_aim_reticle')
      .setDepth(10)
      .setAlpha(0.6);
    this.input.on('pointermove', (p: Phaser.Input.Pointer) =>
      ret.setPosition(p.worldX, p.worldY),
    );
  }

  update(_: number, _dt: number) {
    const speed = 220;
    const vx =
      (this.cursors.left?.isDown ? -1 : 0) +
      (this.cursors.right?.isDown ? 1 : 0);
    const vy =
      (this.cursors.up?.isDown ? -1 : 0) +
      (this.cursors.down?.isDown ? 1 : 0);
    const len = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / len) * speed, (vy / len) * speed);
  }

  private fire() {
    const p = this.input.activePointer;
    const ang = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      p.worldX,
      p.worldY,
    );
    const b = this.bullets.create(
      this.player.x,
      this.player.y,
      'bullet',
    ) as Phaser.Physics.Arcade.Sprite;
    b.setCircle(3);
    b.body.setAllowGravity(false);
    const speed = 560;
    b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
    this.time.delayedCall(2000, () => b.destroy());
  }
}
