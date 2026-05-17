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
  playerPosition: { x: number; y: number };
  playerAlive: boolean;
  // --- Goal 02 adds fields below this line ---
  playerBullets: { activeCount: number };
  // --- Goal 03 adds fields below this line ---
  enemies: {
    activeCount: number;
    totalDestroyed: number;
    totalSpawned: number;
    totalRecycled: number;
    lastSpawnX: number;
    previousSpawnX: number;
    samplePosition: { x: number; y: number };
  };
  // --- Goal 04 adds fields below this line ---
  playerHealth: number;
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
    playerPosition: game.registry.get('playerPosition') ?? { x: 0, y: 0 },
    playerAlive: game.registry.get('playerAlive') ?? false,
    // --- Goal 02 populates fields below this line ---
    playerBullets: game.registry.get('playerBullets') ?? { activeCount: 0 },
    // --- Goal 03 populates fields below this line ---
    enemies: game.registry.get('enemies') ?? {
      activeCount: 0,
      totalDestroyed: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      lastSpawnX: 0,
      previousSpawnX: 0,
      samplePosition: { x: 0, y: 0 },
    },
    // --- Goal 04 populates fields below this line ---
    playerHealth: game.registry.get('playerHealth') ?? 0,
  };

  window.__GAME_STATE__ = state;
}
