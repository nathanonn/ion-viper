import Phaser from 'phaser';
import {
  ASSET_KEYS,
  COLORS,
  GAME_DESCRIPTION,
  GAME_HEIGHT,
  GAME_TITLE,
  GAME_WIDTH,
  MENU_START_PROMPT,
  SCENE_KEYS,
  TEXT_COLORS,
} from '../configs/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.IMAGES.SPACE_BACKGROUND);
    this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.IMAGES.STAR_PARALLAX)
      .setOrigin(0)
      .setAlpha(0.65);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, GAME_TITLE, {
        fontSize: '48px',
        color: TEXT_COLORS.PRIMARY,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, GAME_DESCRIPTION, {
        fontSize: '16px',
        color: TEXT_COLORS.SECONDARY,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 4, ASSET_KEYS.IMAGES.PLAYER_SHIP)
      .setScale(2)
      .setAlpha(0.95);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 78, MENU_START_PROMPT, {
        fontSize: '20px',
        color: TEXT_COLORS.SECONDARY,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 64, 128, 8, COLORS.ACCENT, 0.85);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }
}
