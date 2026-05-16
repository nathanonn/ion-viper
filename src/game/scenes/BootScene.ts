import Phaser from 'phaser';
import { SCENE_KEYS } from '../configs/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // Shared assets are loaded here by later goals.
  }

  create(): void {
    this.registry.set('score', 0);
    this.registry.set('gameOver', false);

    this.scene.start(SCENE_KEYS.MENU);
  }
}
