import Phaser from 'phaser';
import { PLAYER_COMBAT } from '../configs/constants';
import { Enemy } from '../objects/Enemy';
import { PlayerShip } from '../objects/PlayerShip';

export class CombatSystem {
  private score = 0;
  private health: number = PLAYER_COMBAT.STARTING_HEALTH;
  private invulnerabilityMs = 0;
  private flashElapsedMs = 0;
  private gameOver = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: PlayerShip,
    private readonly onGameOver: (score: number) => void
  ) {
    this.publishState();
  }

  awardEnemyKill(enemy: Enemy): void {
    if (this.gameOver) {
      return;
    }

    this.score += enemy.getScoreValue();
    this.publishState();
  }

  damagePlayer(): boolean {
    if (this.gameOver || this.isInvulnerable()) {
      return false;
    }

    this.health = Math.max(0, this.health - PLAYER_COMBAT.DAMAGE_PER_CONTACT);

    if (this.health <= 0) {
      this.gameOver = true;
      this.player.setAlive(false);
      this.publishState();
      this.onGameOver(this.score);
      return true;
    }

    this.invulnerabilityMs = PLAYER_COMBAT.INVULNERABILITY_MS;
    this.flashElapsedMs = 0;
    this.player.setDamageFlash(true);
    this.publishState();
    return true;
  }

  updateInvulnerability(delta: number): void {
    if (this.gameOver || this.invulnerabilityMs <= 0) {
      return;
    }

    this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - delta);
    this.flashElapsedMs += delta;

    if (this.invulnerabilityMs <= 0) {
      this.player.setDamageFlash(false);
      this.flashElapsedMs = 0;
    } else {
      const isDimmed =
        Math.floor(this.flashElapsedMs / PLAYER_COMBAT.FLASH_INTERVAL_MS) % 2 === 0;
      this.player.setDamageFlash(isDimmed);
    }

    this.publishState();
  }

  isInvulnerable(): boolean {
    return this.invulnerabilityMs > 0;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  publishState(): void {
    this.scene.registry.set('score', this.score);
    this.scene.registry.set('playerHealth', this.health);
    this.scene.registry.set('gameOver', this.gameOver);
  }
}
