import Phaser from 'phaser';
import { GAME_WIDTH, HUD, PLAYER_COMBAT, SCENE_KEYS, TEXT_COLORS } from '../configs/constants';

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.Text | null = null;
  private healthText: Phaser.GameObjects.Text | null = null;
  private waveText: Phaser.GameObjects.Text | null = null;
  private bossLabel: Phaser.GameObjects.Text | null = null;
  private bossBarBackground: Phaser.GameObjects.Rectangle | null = null;
  private bossBarFill: Phaser.GameObjects.Rectangle | null = null;
  private lastScoreText = '';
  private lastHealthText = '';
  private lastWaveText = '';
  private lastBossHealthRatio = -1;
  private lastBossVisible = false;

  constructor() {
    super({ key: SCENE_KEYS.HUD });
  }

  init(): void {
    this.scoreText = null;
    this.healthText = null;
    this.waveText = null;
    this.bossLabel = null;
    this.bossBarBackground = null;
    this.bossBarFill = null;
    this.lastScoreText = '';
    this.lastHealthText = '';
    this.lastWaveText = '';
    this.lastBossHealthRatio = -1;
    this.lastBossVisible = false;
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

    this.bossLabel = this.add
      .text(GAME_WIDTH / 2, HUD.PADDING, 'BOSS', {
        ...textStyle,
        fontSize: '14px',
        color: '#66ddff',
      })
      .setOrigin(0.5, 0)
      .setDepth(HUD.DEPTH)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossBarBackground = this.add
      .rectangle(GAME_WIDTH / 2, HUD.PADDING + 26, 260, 10, 0x14202b, 0.9)
      .setDepth(HUD.DEPTH)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossBarFill = this.add
      .rectangle(GAME_WIDTH / 2 - 130, HUD.PADDING + 26, 260, 10, 0x66ddff, 0.95)
      .setOrigin(0, 0.5)
      .setDepth(HUD.DEPTH + 1)
      .setScrollFactor(0)
      .setVisible(false);

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
    const difficulty = this.registry.get('difficulty') ?? { loop: 1 };
    const loop = difficulty.loop ?? 1;
    const boss = this.registry.get('boss') ?? {
      active: false,
      health: 0,
      maxHealth: 0,
      phase: 1,
      defeated: false,
    };

    const nextScoreText = `Score: ${score}`;
    const nextHealthText = `Health: ${health}`;
    const nextWaveText = gameWon
      ? `Loop ${loop} clear`
      : `Loop ${loop}  Wave: ${currentWave}/${waveCount}`;

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

    this.updateBossBar(boss);
  }

  private updateBossBar(boss: {
    active: boolean;
    health: number;
    maxHealth: number;
    phase: number;
    defeated: boolean;
  }): void {
    const visible = boss.active && !boss.defeated;
    const healthRatio =
      boss.maxHealth > 0 ? Phaser.Math.Clamp(boss.health / boss.maxHealth, 0, 1) : 0;

    if (visible !== this.lastBossVisible) {
      this.bossLabel?.setVisible(visible);
      this.bossBarBackground?.setVisible(visible);
      this.bossBarFill?.setVisible(visible);
      this.lastBossVisible = visible;
    }

    if (healthRatio !== this.lastBossHealthRatio) {
      this.bossBarFill?.setDisplaySize(260 * healthRatio, 10);
      this.lastBossHealthRatio = healthRatio;
    }
  }
}
