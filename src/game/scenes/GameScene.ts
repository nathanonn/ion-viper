import Phaser from 'phaser';
import { SCENE_KEYS } from '../configs/constants';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    this.registry.set('score', 0);
    this.registry.set('gameOver', false);

    // Goal 01 adds the player ship and core movement here.
  }

  update(_time: number, _delta: number): void {
    // Goal 01 adds game loop behavior here.
  }
}
