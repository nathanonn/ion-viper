import Phaser from 'phaser';
import { ASSET_KEYS, ION_BLAST } from '../configs/constants';

export class IonBlastPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, ASSET_KEYS.IMAGES.ION_BLAST_PICKUP);

    this.setOrigin(0.5);
    this.setDisplaySize(ION_BLAST.WIDTH, ION_BLAST.HEIGHT);
  }

  spawn(x: number, y: number): void {
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(ION_BLAST.WIDTH, ION_BLAST.HEIGHT);
    body.reset(x, y);
    body.setVelocity(0, ION_BLAST.SPEED);
  }

  recycle(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (body) {
      body.stop();
      body.enable = false;
    }

    this.setActive(false);
    this.setVisible(false);
  }
}
