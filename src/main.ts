import Phaser from 'phaser';
import { gameConfig } from './game/main';
import { updateGameState } from './state-bridge';

const game = new Phaser.Game(gameConfig);

game.events.on('step', () => {
  updateGameState(game);
});

(window as Window & { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;
