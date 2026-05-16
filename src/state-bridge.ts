import type Phaser from 'phaser';

/**
 * State Bridge - exposes game state to window.__GAME_STATE__ for Playwright testing.
 *
 * Each goal adds new fields to GameState as needed.
 * NEVER remove existing fields - only add new ones.
 */
export interface GameState {
  scene: string;
  ready: boolean;
  score: number;
  gameOver: boolean;
  // --- Goal 00 adds fields below this line ---
  // --- Goal 01 adds fields below this line ---
  // --- Goal 02 adds fields below this line ---
  // --- Goal 03 adds fields below this line ---
  // --- Goal 04 adds fields below this line ---
}

declare global {
  interface Window {
    __GAME_STATE__: GameState;
  }
}

function getActiveSceneKey(game: Phaser.Game): string {
  const scenes = game.scene.getScenes(true);
  if (scenes.length > 0) {
    return scenes[0].scene.key;
  }
  return 'unknown';
}

export function updateGameState(game: Phaser.Game): void {
  const activeScene = getActiveSceneKey(game);
  const isReady = game.scene.getScenes(true).length > 0;

  const state: GameState = {
    scene: activeScene,
    ready: isReady,
    score: game.registry.get('score') ?? 0,
    gameOver: game.registry.get('gameOver') ?? false,
    // --- Goal 00 populates fields below this line ---
    // --- Goal 01 populates fields below this line ---
    // --- Goal 02 populates fields below this line ---
    // --- Goal 03 populates fields below this line ---
    // --- Goal 04 populates fields below this line ---
  };

  window.__GAME_STATE__ = state;
}
