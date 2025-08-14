import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GameScene');
  }

  preload() {
    // this.load.image('player', '/assets/player.png');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.player = this.physics.add
      .sprite(400, 300, undefined as any)
      .setCircle(12)
      .setTint(0x66ccff);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update(_time: number, _dt: number) {
    const speed = 220;
    const v = this.player.body.velocity;
    v.set(0);
    if (this.cursors.left?.isDown) v.x = -speed;
    else if (this.cursors.right?.isDown) v.x = speed;
    if (this.cursors.up?.isDown) v.y = -speed;
    else if (this.cursors.down?.isDown) v.y = speed;
    this.player.setVelocity(v.x, v.y);
  }
}
