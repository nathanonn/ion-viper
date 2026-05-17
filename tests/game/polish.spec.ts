import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, trackPageDiagnostics, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/07-polish/test-artifacts';

interface EnemiesState {
  activeCount: number;
  totalDestroyed: number;
}

interface FeedbackState {
  fireCueCount: number;
  enemyDestroyedCount: number;
  playerDamagedCount: number;
  cameraShakeCount: number;
  musicStartCount: number;
  musicPlaying: boolean;
}

const IMAGE_KEYS = [
  'player-ship',
  'enemy-drone',
  'player-bullet',
  'explosion-particle',
  'space-background',
  'star-parallax',
] as const;

const AUDIO_KEYS = [
  'fire-sfx',
  'hit-sfx',
  'explosion-sfx',
  'player-damage-sfx',
  'gameplay-music',
] as const;

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getFeedbackState(page: Page): Promise<FeedbackState> {
  return page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    return scene.feedbackSystem.getState();
  });
}

async function spawnEnemyInBulletPath(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for polish test');
    }

    const body = enemy.body;
    body.enable = true;
    body.reset(player.x, player.y - 120);
    body.setVelocity(0, 0);
  });
}

async function spawnEnemyOnPlayer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for damage test');
    }

    const body = enemy.body;
    body.enable = true;
    body.reset(player.x, player.y);
    body.setVelocity(0, 0);
  });
}

async function waitForHealthBelow(page: Page, health: number): Promise<void> {
  await page.waitForFunction(
    (previousHealth) => ((window as any).__GAME_STATE__?.playerHealth ?? 0) < previousHealth,
    health,
    { timeout: 3000 }
  );
}

test.describe('Polish', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: final assets load and gameplay starts cleanly', async ({ page }) => {
    const diagnostics = trackPageDiagnostics(page);
    await startGame(page);

    const loadedAssets = await page.evaluate(
      ({ imageKeys, audioKeys }) => {
        const game = (window as any).__PHASER_GAME__;
        const scene = game.scene.getScene('GameScene') as any;

        return {
          images: imageKeys.map((key: string) => ({
            key,
            loaded: game.textures.exists(key),
          })),
          audio: audioKeys.map((key: string) => ({
            key,
            loaded: game.cache.audio.exists(key),
          })),
          playerTexture: scene.player.texture.key,
          backgroundActive: scene.background.active,
          starParallaxActive: scene.starParallax.active,
        };
      },
      { imageKeys: IMAGE_KEYS, audioKeys: AUDIO_KEYS }
    );

    expect(loadedAssets.images.every((asset) => asset.loaded)).toBe(true);
    expect(loadedAssets.audio.every((asset) => asset.loaded)).toBe(true);
    expect(loadedAssets.playerTexture).toBe('player-ship');
    expect(loadedAssets.backgroundActive).toBe(true);
    expect(loadedAssets.starParallaxActive).toBe(true);
    expect(diagnostics.pageErrors).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);

    await spawnEnemyInBulletPath(page);
    await pressKey(page, 'Space', 100);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${ARTIFACT_DIR}/final-gameplay.png` });
  });

  test('M-002 and S-002: enemy destruction triggers feedback without breaking score', async ({
    page,
  }) => {
    await startGame(page);

    const beforeState = await getGameState(page);
    const beforeEnemies = beforeState.enemies as EnemiesState;
    const beforeFeedback = await getFeedbackState(page);
    await spawnEnemyInBulletPath(page);
    await pressKey(page, 'Space', 100);
    await page.waitForFunction(
      (destroyedBefore) =>
        ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > destroyedBefore,
      beforeEnemies.totalDestroyed,
      { timeout: 3000 }
    );
    await page.screenshot({ path: `${ARTIFACT_DIR}/feedback.png` });

    const afterState = await getGameState(page);
    const afterEnemies = afterState.enemies as EnemiesState;
    const afterFeedback = await getFeedbackState(page);

    expect(afterEnemies.totalDestroyed).toBeGreaterThan(beforeEnemies.totalDestroyed);
    expect(afterState.score).toBeGreaterThan(beforeState.score);
    expect(afterFeedback.enemyDestroyedCount).toBeGreaterThan(
      beforeFeedback.enemyDestroyedCount
    );
  });

  test('M-003: parallax, firing, and player damage preserve controls and state', async ({
    page,
  }) => {
    await startGame(page);

    const before = await getGameState(page);
    const beforeFeedback = await getFeedbackState(page);
    const beforeTiles = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const scene = game.scene.getScene('GameScene') as any;
      return {
        starY: scene.starParallax.tilePositionY,
      };
    });

    await pressKey(page, 'ArrowRight', 250);
    await pressKey(page, 'Space', 100);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, before.playerHealth as number);

    const after = await getGameState(page);
    const afterFeedback = await getFeedbackState(page);
    const afterTiles = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const scene = game.scene.getScene('GameScene') as any;
      return {
        starY: scene.starParallax.tilePositionY,
      };
    });

    expect((after.playerPosition as { x: number }).x).toBeGreaterThan(
      (before.playerPosition as { x: number }).x
    );
    expect((after.playerBullets as { activeCount: number }).activeCount).toBeGreaterThan(0);
    expect(after.playerHealth).toBe((before.playerHealth as number) - 1);
    expect(afterFeedback.fireCueCount).toBeGreaterThan(beforeFeedback.fireCueCount);
    expect(afterFeedback.playerDamagedCount).toBeGreaterThan(
      beforeFeedback.playerDamagedCount
    );
    expect(afterFeedback.cameraShakeCount).toBeGreaterThan(beforeFeedback.cameraShakeCount);
    expect(afterTiles.starY).not.toBe(beforeTiles.starY);
  });

  test('M-004: gameplay sound effects are triggered without browser audio errors', async ({
    page,
  }) => {
    const diagnostics = trackPageDiagnostics(page);
    await startGame(page);

    await pressKey(page, 'Space', 100);
    await spawnEnemyInBulletPath(page);
    await pressKey(page, 'Space', 100);
    await page.waitForFunction(
      () => ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > 0,
      undefined,
      { timeout: 3000 }
    );
    const beforeDamage = await getGameState(page);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, beforeDamage.playerHealth as number);

    const feedback = await getFeedbackState(page);
    expect(feedback.fireCueCount).toBeGreaterThan(0);
    expect(feedback.enemyDestroyedCount).toBeGreaterThan(0);
    expect(feedback.playerDamagedCount).toBeGreaterThan(0);
    expect(diagnostics.pageErrors).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
  });

  test('M-005: gameplay music starts and stops on game over', async ({ page }) => {
    await startGame(page);

    const playing = await getFeedbackState(page);
    expect(playing.musicStartCount).toBeGreaterThan(0);

    let state = await getGameState(page);
    while ((state.playerHealth as number) > 0) {
      await spawnEnemyOnPlayer(page);
      await waitForHealthBelow(page, state.playerHealth as number);
      state = await getGameState(page);
    }

    await waitForScene(page, 'GameOverScene', 4000);
    const musicStillPlaying = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      return game.sound.getAll('gameplay-music').some((sound: any) => sound.isPlaying);
    });

    expect(musicStillPlaying).toBe(false);
    expect(state.gameOver).toBe(true);
  });
});
