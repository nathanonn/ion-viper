import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../configs/constants';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: { score?: number }): void {
    this.finalScore = data.score ?? this.registry.get('score') ?? 0;
  }

  create(): void {
    this.registry.set('gameOver', true);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${this.finalScore}`, {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Press SPACE to restart', {
        fontSize: '20px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }
}
