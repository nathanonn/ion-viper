import Phaser from 'phaser';
import { GAME_WIDTH, HUD, PLAYER_COMBAT, SCENE_KEYS, TEXT_COLORS } from '../configs/constants';

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.Text | null = null;
  private healthText: Phaser.GameObjects.Text | null = null;
  private waveText: Phaser.GameObjects.Text | null = null;
  private lastScoreText = '';
  private lastHealthText = '';
  private lastWaveText = '';

  constructor() {
    super({ key: SCENE_KEYS.HUD });
  }

  init(): void {
    this.scoreText = null;
    this.healthText = null;
    this.waveText = null;
    this.lastScoreText = '';
    this.lastHealthText = '';
    this.lastWaveText = '';
  }

  create(): void {
    this.input.enabled = false;

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: HUD.FONT_SIZE,
      color: TEXT_COLORS.PRIMARY,
    };

    this.scoreText = this.add
      .text(HUD.PADDING, HUD.PADDING, '', textStyle)
      .setDepth(HUD.DEPTH)
      .setScrollFactor(0);

    this.healthText = this.add
      .text(HUD.PADDING, HUD.PADDING + HUD.LINE_HEIGHT, '', textStyle)
      .setDepth(HUD.DEPTH)
      .setScrollFactor(0);

    this.waveText = this.add
      .text(GAME_WIDTH - HUD.PADDING, HUD.PADDING, '', textStyle)
      .setOrigin(1, 0)
      .setDepth(HUD.DEPTH)
      .setScrollFactor(0);

    this.updateHudText();
  }

  update(): void {
    this.updateHudText();
  }

  private updateHudText(): void {
    const score = this.registry.get('score') ?? 0;
    const health = this.registry.get('playerHealth') ?? PLAYER_COMBAT.STARTING_HEALTH;
    const currentWave = this.registry.get('currentWave') ?? 1;
    const waveCount = this.registry.get('waveCount') ?? 1;
    const gameWon = this.registry.get('gameWon') ?? false;

    const nextScoreText = `Score: ${score}`;
    const nextHealthText = `Health: ${health}`;
    const nextWaveText = gameWon ? 'Victory!' : `Wave: ${currentWave}/${waveCount}`;

    if (nextScoreText !== this.lastScoreText) {
      this.scoreText?.setText(nextScoreText);
      this.lastScoreText = nextScoreText;
    }
    if (nextHealthText !== this.lastHealthText) {
      this.healthText?.setText(nextHealthText);
      this.lastHealthText = nextHealthText;
    }
    if (nextWaveText !== this.lastWaveText) {
      this.waveText?.setText(nextWaveText);
      this.lastWaveText = nextWaveText;
    }
  }
}
