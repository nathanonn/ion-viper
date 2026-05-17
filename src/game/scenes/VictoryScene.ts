import Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, TEXT_COLORS } from '../configs/constants';

export class VictoryScene extends Phaser.Scene {
  private finalScore = 0;
  private difficultyLoop = 1;

  constructor() {
    super({ key: SCENE_KEYS.VICTORY });
  }

  init(data: { score?: number; difficultyLoop?: number }): void {
    this.finalScore = data.score ?? this.registry.get('score') ?? 0;
    this.difficultyLoop = data.difficultyLoop ?? this.registry.get('difficulty')?.loop ?? 1;
  }

  create(): void {
    this.scene.stop(SCENE_KEYS.HUD);
    this.registry.set('gameWon', true);
    this.registry.set('gameOver', false);
    this.registry.set('victoryVisible', true);
    this.sound.stopByKey(ASSET_KEYS.AUDIO.MUSIC);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.IMAGES.SPACE_BACKGROUND);
    this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.IMAGES.STAR_PARALLAX)
      .setOrigin(0)
      .setAlpha(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 82, 'VICTORY', {
        fontSize: '48px',
        color: '#66ddff',
        fontFamily: 'monospace',
        stroke: '#00111f',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 18, `Loop ${this.difficultyLoop} cleared`, {
        fontSize: '28px',
        color: TEXT_COLORS.PRIMARY,
        fontFamily: 'monospace',
        stroke: '#00111f',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, `Score: ${this.finalScore}`, {
        fontSize: '24px',
        color: TEXT_COLORS.PRIMARY,
        fontFamily: 'monospace',
        stroke: '#00111f',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 76,
        `Press SPACE for loop ${this.difficultyLoop + 1}`,
        {
          fontSize: '20px',
          color: TEXT_COLORS.SECONDARY,
          fontFamily: 'monospace',
        }
      )
      .setOrigin(0.5);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start(SCENE_KEYS.GAME, { difficultyLoop: this.difficultyLoop + 1 });
    });
  }
}
