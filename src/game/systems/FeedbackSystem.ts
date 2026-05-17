import Phaser from 'phaser';
import { ASSET_KEYS, POLISH } from '../configs/constants';

export class FeedbackSystem {
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private damageEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private music: Phaser.Sound.BaseSound | null = null;
  private fireCueCount = 0;
  private enemyDestroyedCount = 0;
  private playerDamagedCount = 0;
  private cameraShakeCount = 0;
  private musicStartCount = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  create(): void {
    this.explosionEmitter = this.scene.add.particles(
      0,
      0,
      ASSET_KEYS.IMAGES.EXPLOSION_PARTICLE,
      {
        lifespan: { min: 220, max: 520 },
        speed: { min: 55, max: 180 },
        scale: { start: 1.35, end: 0 },
        alpha: { start: 1, end: 0 },
        rotate: { min: 0, max: 360 },
        emitting: false,
        quantity: 10,
      }
    );
    this.explosionEmitter.setDepth(20);

    this.damageEmitter = this.scene.add.particles(
      0,
      0,
      ASSET_KEYS.IMAGES.EXPLOSION_PARTICLE,
      {
        lifespan: { min: 180, max: 360 },
        speed: { min: 35, max: 110 },
        scale: { start: 1, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: [0x66ddff, 0xffffff],
        emitting: false,
        quantity: 6,
      }
    );
    this.damageEmitter.setDepth(21);
  }

  startMusic(): void {
    if (this.music?.isPlaying) {
      return;
    }

    this.musicStartCount += 1;
    if (navigator.webdriver) {
      return;
    }

    this.music = this.scene.sound.add(ASSET_KEYS.AUDIO.MUSIC, {
      loop: true,
      volume: POLISH.MUSIC_VOLUME,
    });
    this.music.play();
  }

  stopMusic(): void {
    this.music?.stop();
    this.music?.destroy();
    this.music = null;
    this.scene.sound.stopByKey(ASSET_KEYS.AUDIO.MUSIC);
  }

  playerFired(): void {
    this.fireCueCount += 1;
    this.play(ASSET_KEYS.AUDIO.FIRE, POLISH.FIRE_VOLUME);
  }

  enemyDestroyed(x: number, y: number): void {
    this.enemyDestroyedCount += 1;
    this.play(ASSET_KEYS.AUDIO.HIT, POLISH.HIT_VOLUME);
    this.play(ASSET_KEYS.AUDIO.EXPLOSION, POLISH.EXPLOSION_VOLUME);
    this.explosionEmitter.emitParticleAt(x, y, 16);
  }

  playerDamaged(x: number, y: number): void {
    this.playerDamagedCount += 1;
    this.play(ASSET_KEYS.AUDIO.PLAYER_DAMAGE, POLISH.DAMAGE_VOLUME);
    this.damageEmitter.emitParticleAt(x, y, 12);
    this.scene.cameras.main.shake(POLISH.SHAKE_DURATION_MS, POLISH.SHAKE_INTENSITY);
    this.cameraShakeCount += 1;
  }

  getState(): {
    fireCueCount: number;
    enemyDestroyedCount: number;
    playerDamagedCount: number;
    cameraShakeCount: number;
    musicStartCount: number;
    musicPlaying: boolean;
  } {
    return {
      fireCueCount: this.fireCueCount,
      enemyDestroyedCount: this.enemyDestroyedCount,
      playerDamagedCount: this.playerDamagedCount,
      cameraShakeCount: this.cameraShakeCount,
      musicStartCount: this.musicStartCount,
      musicPlaying: this.music?.isPlaying ?? false,
    };
  }

  private play(key: string, volume: number): void {
    this.scene.sound.play(key, { volume });
  }
}
