import Phaser from 'phaser';
import {
  COLORS,
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
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, GAME_TITLE, {
        fontSize: '48px',
        color: TEXT_COLORS.PRIMARY,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, MENU_START_PROMPT, {
        fontSize: '20px',
        color: TEXT_COLORS.SECONDARY,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 64, 96, 16, COLORS.ACCENT, 0.8);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }
}
