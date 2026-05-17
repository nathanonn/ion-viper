import type Phaser from 'phaser';
import { GAME_DESCRIPTION, GAME_TITLE, SCENE_KEYS } from './game/configs/constants';

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
  // --- Goal 05 adds fields below this line ---
  hudVisible: boolean;
  // --- Goal 06 adds fields below this line ---
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
  // --- Goal 08 adds fields below this line ---
  gameIdentity: { title: string; description: string };
  // --- Goal 09 adds fields below this line ---
  ionBlast: {
    active: boolean;
    remainingMs: number;
    collectedCount: number;
    projectileCount: number;
    pickupActive: boolean;
    pickupPosition: { x: number; y: number };
    poolActiveCount: number;
    totalSpawned: number;
    totalRecycled: number;
    maxPickups: number;
  };
}

declare global {
  interface Window {
    __GAME_STATE__: GameState;
  }
}

function getActiveSceneKey(game: Phaser.Game): string {
  const scenes = game.scene.getScenes(true);
  const gameplayScene = scenes.find((scene) => scene.scene.key === SCENE_KEYS.GAME);
  if (gameplayScene) {
    return gameplayScene.scene.key;
  }

  if (scenes.length > 0) {
    return scenes[0].scene.key;
  }
  return 'unknown';
}

export function updateGameState(game: Phaser.Game): void {
  const activeScene = getActiveSceneKey(game);
  const isReady = game.scene.getScenes(true).length > 0;
  const hudVisible = game.scene.isActive(SCENE_KEYS.HUD) && game.scene.isVisible(SCENE_KEYS.HUD);

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
    // --- Goal 05 populates fields below this line ---
    hudVisible,
    // --- Goal 06 populates fields below this line ---
    currentWave: game.registry.get('currentWave') ?? 1,
    waveCount: game.registry.get('waveCount') ?? 0,
    gameWon: game.registry.get('gameWon') ?? false,
    // --- Goal 08 populates fields below this line ---
    gameIdentity: {
      title: GAME_TITLE,
      description: GAME_DESCRIPTION,
    },
    // --- Goal 09 populates fields below this line ---
    ionBlast: game.registry.get('ionBlast') ?? {
      active: false,
      remainingMs: 0,
      collectedCount: 0,
      projectileCount: 1,
      pickupActive: false,
      pickupPosition: { x: 0, y: 0 },
      poolActiveCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      maxPickups: 0,
    },
  };

  window.__GAME_STATE__ = state;
}
