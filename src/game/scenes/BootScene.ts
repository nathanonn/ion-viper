import Phaser from 'phaser';
import { ASSET_KEYS, ASSET_PATHS, SCENE_KEYS } from '../configs/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    this.load.image(ASSET_KEYS.IMAGES.PLAYER_SHIP, ASSET_PATHS.IMAGES.PLAYER_SHIP);
    this.load.image(ASSET_KEYS.IMAGES.ENEMY_DRONE, ASSET_PATHS.IMAGES.ENEMY_DRONE);
    this.load.image(ASSET_KEYS.IMAGES.PLAYER_BULLET, ASSET_PATHS.IMAGES.PLAYER_BULLET);
    this.load.image(
      ASSET_KEYS.IMAGES.EXPLOSION_PARTICLE,
      ASSET_PATHS.IMAGES.EXPLOSION_PARTICLE
    );
    this.load.image(ASSET_KEYS.IMAGES.SPACE_BACKGROUND, ASSET_PATHS.IMAGES.SPACE_BACKGROUND);
    this.load.image(ASSET_KEYS.IMAGES.STAR_PARALLAX, ASSET_PATHS.IMAGES.STAR_PARALLAX);

    this.load.audio(ASSET_KEYS.AUDIO.FIRE, ASSET_PATHS.AUDIO.FIRE);
    this.load.audio(ASSET_KEYS.AUDIO.HIT, ASSET_PATHS.AUDIO.HIT);
    this.load.audio(ASSET_KEYS.AUDIO.EXPLOSION, ASSET_PATHS.AUDIO.EXPLOSION);
    this.load.audio(ASSET_KEYS.AUDIO.PLAYER_DAMAGE, ASSET_PATHS.AUDIO.PLAYER_DAMAGE);
    this.load.audio(ASSET_KEYS.AUDIO.MUSIC, ASSET_PATHS.AUDIO.MUSIC);
  }

  create(): void {
    this.game.loop.smoothStep = false;
    this.registry.set('score', 0);
    this.registry.set('gameOver', false);

    this.scene.start(SCENE_KEYS.MENU);
  }
}
