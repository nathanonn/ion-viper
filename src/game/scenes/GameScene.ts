import Phaser from 'phaser';
import { PLAYER_SHIP, SCENE_KEYS } from '../configs/constants';
import { PlayerShip, type PlayerMovementInput } from '../objects/PlayerShip';

export class GameScene extends Phaser.Scene {
  private player!: PlayerShip;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(): void {
    this.registry.set('playerAlive', true);
    this.registry.set('playerPosition', {
      x: PLAYER_SHIP.START_X,
      y: PLAYER_SHIP.START_Y,
    });
  }

  create(): void {
    this.registry.set('score', 0);
    this.registry.set('gameOver', false);

    this.player = new PlayerShip(this, PLAYER_SHIP.START_X, PLAYER_SHIP.START_Y);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };

    this.publishPlayerState();
  }

  update(_time: number, delta: number): void {
    const input: PlayerMovementInput = {
      left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
      right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
      up: this.cursors.up.isDown || this.wasdKeys.W.isDown,
      down: this.cursors.down.isDown || this.wasdKeys.S.isDown,
    };

    this.player.moveFromInput(input, delta);
    this.publishPlayerState();
  }

  private publishPlayerState(): void {
    this.registry.set('playerPosition', this.player.getPosition());
    this.registry.set('playerAlive', this.player.isAlive());
  }
}
