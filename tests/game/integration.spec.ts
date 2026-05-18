import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import {
  BOSS,
  GAME_DESCRIPTION,
  GAME_TITLE,
  PLAYER_COMBAT,
  WAVE_RANDOMIZATION,
} from '../../src/game/configs/constants';
import {
  getGameState,
  pressKey,
  trackPageDiagnostics,
  waitForGameReady,
  waitForScene,
  type PageDiagnostics,
} from './helpers';

const ARTIFACT_DIR = 'goals/14-qc-checkpoint/test-artifacts';

const REQUIRED_STATE_FIELDS = [
  'scene',
  'ready',
  'score',
  'gameOver',
  'playerPosition',
  'playerAlive',
  'playerBullets',
  'enemies',
  'playerHealth',
  'hudVisible',
  'currentWave',
  'waveCount',
  'gameWon',
  'gameIdentity',
  'ionBlast',
  'enemyProjectiles',
  'enemyTypes',
  'waveRandomization',
  'boss',
  'victoryVisible',
  'difficulty',
] as const;

interface BossState {
  active: boolean;
  health: number;
  maxHealth: number;
  phase: number;
  defeated: boolean;
}

interface DifficultyState {
  loop: number;
  enemySpeedMultiplier: number;
  enemyHealthMultiplier: number;
  bossHealthMultiplier: number;
}

interface CountState {
  activeCount: number;
}

interface IonBlastState {
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
}

interface WaveRandomizationState {
  enabled: boolean;
  spawnCount: number;
  uniqueSpawnLanes: number;
  minimumRecentSpacing: number;
  lastSpawnX: number;
  previousSpawnX: number;
}

async function bootToMenu(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
}

async function startGame(page: Page): Promise<void> {
  await bootToMenu(page);
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

function expectNoDiagnostics(diagnostics: PageDiagnostics): void {
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.consoleErrors).toEqual([]);
}

function expectSerializableState(state: Record<string, unknown>): void {
  for (const field of REQUIRED_STATE_FIELDS) {
    expect(state).toHaveProperty(field);
    expect(state[field]).not.toBeUndefined();
  }

  expect(JSON.parse(JSON.stringify(state))).toEqual(state);
}

function expectCleanGameplayState(state: Record<string, unknown>, expectedLoop: number): void {
  const boss = state.boss as BossState;
  const bullets = state.playerBullets as CountState;
  const enemies = state.enemies as CountState;
  const projectiles = state.enemyProjectiles as CountState;
  const ionBlast = state.ionBlast as IonBlastState;
  const difficulty = state.difficulty as DifficultyState;

  expect(state.scene).toBe('GameScene');
  expect(state.gameOver).toBe(false);
  expect(state.gameWon).toBe(false);
  expect(state.victoryVisible).toBe(false);
  expect(state.playerAlive).toBe(true);
  expect(state.playerHealth).toBe(PLAYER_COMBAT.STARTING_HEALTH);
  expect(bullets.activeCount).toBe(0);
  expect(enemies.activeCount).toBe(0);
  expect(projectiles.activeCount).toBe(0);
  expect(ionBlast.active).toBe(false);
  expect(ionBlast.collectedCount).toBe(0);
  expect(ionBlast.poolActiveCount).toBe(0);
  expect(boss.active).toBe(false);
  expect(boss.health).toBe(0);
  expect(boss.maxHealth).toBe(0);
  expect(boss.defeated).toBe(false);
  expect(difficulty.loop).toBe(expectedLoop);
}

async function publishState(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    scene.publishPlayerState();
    scene.publishEnemyState();
    scene.publishIonBlastState();
    scene.publishWaveState();
    scene.publishBossState();
    scene.publishRandomizationState();
    scene.publishDifficultyState();
  });
}

async function prepareIonBlastMixedWave(page: Page): Promise<Record<string, unknown>> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    scene.powerUpSystem.activateIonBlast();
    scene.enemySpawner.spawnEnemy({
      type: 'basic',
      getPlayerPosition: () => scene.player.getPosition(),
    });
    scene.enemySpawner.spawnEnemy({
      type: 'shooter',
      getPlayerPosition: () => scene.player.getPosition(),
    });
    scene.enemySpawner.spawnEnemy({
      type: 'charger',
      getPlayerPosition: () => scene.player.getPosition(),
    });

    scene.publishPlayerState();
    scene.publishEnemyState();
    scene.publishIonBlastState();
    scene.publishRandomizationState();
  });

  await page.waitForFunction(
    () =>
      (window as any).__GAME_STATE__?.ionBlast?.active === true &&
      (window as any).__GAME_STATE__?.enemies?.activeCount >= 3,
    undefined,
    { timeout: 2000 }
  );

  return getGameState(page);
}

async function clearActiveGameplayObjects(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    for (const enemy of scene.enemySpawner.getGroup().getChildren()) {
      if (enemy.active) {
        scene.enemySpawner.destroyEnemy(enemy);
      }
    }

    for (const projectile of scene.enemyProjectileSystem.getGroup().getChildren()) {
      if (projectile.active) {
        projectile.recycle();
      }
    }

    for (const bullet of scene.playerWeapon.getGroup().getChildren()) {
      if (bullet.active) {
        bullet.recycle();
      }
    }

    for (const pickup of scene.powerUpSystem.getGroup().getChildren()) {
      if (pickup.active) {
        pickup.recycle();
      }
    }

    scene.publishPlayerState();
    scene.publishEnemyState();
    scene.publishIonBlastState();
  });
}

async function forceBossStart(page: Page): Promise<BossState> {
  await clearActiveGameplayObjects(page);
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const waveSystem = scene.waveSystem;
    const waves = waveSystem.waves as { enemyCount: number }[];
    const finalWave = waves[waves.length - 1];

    waveSystem.currentWaveIndex = waves.length - 1;
    waveSystem.spawnedInWave = finalWave.enemyCount;
    waveSystem.clearedInWave = finalWave.enemyCount - 1;
    waveSystem.regularWavesComplete = false;
    waveSystem.gameWon = false;
    waveSystem.onEnemyCleared();
    scene.startBossIfRegularWavesComplete();
    scene.publishWaveState();
    scene.publishEnemyState();
    scene.publishBossState();
    scene.publishRandomizationState();
  });

  await page.waitForFunction(
    () => (window as any).__GAME_STATE__?.boss?.active === true,
    undefined,
    { timeout: 2000 }
  );

  return (await getGameState(page)).boss as BossState;
}

async function defeatBoss(page: Page): Promise<void> {
  const boss = (await getGameState(page)).boss as BossState;

  await page.evaluate((damageAmount) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    scene.bossSystem.damageBoss(damageAmount);
    scene.publishBossState();
    scene.publishWaveState();
  }, boss.health);

  await waitForScene(page, 'VictoryScene', 3000);
}

async function forceGameOver(page: Page): Promise<void> {
  await page.evaluate((health) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    for (let index = 0; index < health; index += 1) {
      scene.combatSystem.invulnerabilityMs = 0;
      scene.combatSystem.damagePlayer();
    }
  }, PLAYER_COMBAT.STARTING_HEALTH);

  await waitForScene(page, 'GameOverScene', 3000);
}

test.describe('QC checkpoint integration', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001, M-003, M-004, M-005, S-001 through S-004: win path reaches New Game Plus cleanly', async ({
    page,
  }) => {
    const diagnostics = trackPageDiagnostics(page);

    await bootToMenu(page);
    const menuState = await getGameState(page);
    expectSerializableState(menuState);
    expect(menuState.scene).toBe('MenuScene');
    expect(menuState.gameIdentity).toEqual({
      title: GAME_TITLE,
      description: GAME_DESCRIPTION,
    });
    expect(menuState.gameOver).toBe(false);
    expect(menuState.gameWon).toBe(false);
    expect(menuState.victoryVisible).toBe(false);
    await page.screenshot({ path: `${ARTIFACT_DIR}/menu.png` });

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');
    const loop1Start = await getGameState(page);
    expectSerializableState(loop1Start);
    expectCleanGameplayState(loop1Start, 1);

    const mixedWave = await prepareIonBlastMixedWave(page);
    const mixedIonBlast = mixedWave.ionBlast as IonBlastState;
    const mixedRandomization = mixedWave.waveRandomization as WaveRandomizationState;
    const mixedEnemyTypes = mixedWave.enemyTypes as {
      activeBasic: number;
      activeShooter: number;
      activeCharger: number;
    };
    expectSerializableState(mixedWave);
    expect(mixedIonBlast.active).toBe(true);
    expect(mixedIonBlast.projectileCount).toBeGreaterThan(1);
    expect(mixedEnemyTypes.activeBasic).toBeGreaterThanOrEqual(1);
    expect(mixedEnemyTypes.activeShooter).toBeGreaterThanOrEqual(1);
    expect(mixedEnemyTypes.activeCharger).toBeGreaterThanOrEqual(1);
    expect(mixedRandomization.enabled).toBe(true);
    expect(mixedRandomization.spawnCount).toBeGreaterThanOrEqual(3);
    expect(mixedRandomization.uniqueSpawnLanes).toBeGreaterThanOrEqual(2);
    expect(mixedRandomization.minimumRecentSpacing).toBeGreaterThanOrEqual(
      WAVE_RANDOMIZATION.MIN_LANE_SPACING
    );
    await page.screenshot({ path: `${ARTIFACT_DIR}/ion-blast-mixed-wave.png` });

    const loop1Boss = await forceBossStart(page);
    const bossState = await getGameState(page);
    expectSerializableState(bossState);
    expect(loop1Boss.active).toBe(true);
    expect(loop1Boss.defeated).toBe(false);
    expect(loop1Boss.health).toBe(loop1Boss.maxHealth);
    expect(loop1Boss.maxHealth).toBe(BOSS.MAX_HEALTH);
    expect(bossState.gameWon).toBe(false);
    await page.screenshot({ path: `${ARTIFACT_DIR}/boss-fight.png` });

    await defeatBoss(page);
    const victoryState = await getGameState(page);
    const defeatedBoss = victoryState.boss as BossState;
    expectSerializableState(victoryState);
    expect(victoryState.scene).toBe('VictoryScene');
    expect(victoryState.gameWon).toBe(true);
    expect(victoryState.victoryVisible).toBe(true);
    expect(victoryState.gameOver).toBe(false);
    expect(defeatedBoss.active).toBe(false);
    expect(defeatedBoss.health).toBe(0);
    expect(defeatedBoss.defeated).toBe(true);
    await page.screenshot({ path: `${ARTIFACT_DIR}/victory-new-game-plus.png` });

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');
    const loop2Start = await getGameState(page);
    const loop2Difficulty = loop2Start.difficulty as DifficultyState;
    expectSerializableState(loop2Start);
    expectCleanGameplayState(loop2Start, 2);
    expect(loop2Difficulty.enemySpeedMultiplier).toBeGreaterThan(1);
    expect(loop2Difficulty.enemyHealthMultiplier).toBeGreaterThan(1);
    expect(loop2Difficulty.bossHealthMultiplier).toBeGreaterThan(1);

    await page.waitForTimeout(650);
    await publishState(page);
    const loop2Early = await getGameState(page);
    const loop2EarlyEnemies = loop2Early.enemies as CountState;
    expect(loop2Early.playerHealth).toBe(PLAYER_COMBAT.STARTING_HEALTH);
    expect(loop2EarlyEnemies.activeCount).toBeLessThanOrEqual(2);
    expectNoDiagnostics(diagnostics);
  });

  test('M-002, M-003, M-004, S-005: loss path restarts without stale state or loop increment', async ({
    page,
  }) => {
    const diagnostics = trackPageDiagnostics(page);

    await startGame(page);
    const gameplayState = await getGameState(page);
    expectSerializableState(gameplayState);
    expectCleanGameplayState(gameplayState, 1);

    await prepareIonBlastMixedWave(page);
    await forceBossStart(page);
    await forceGameOver(page);

    const gameOverState = await getGameState(page);
    const gameOverBoss = gameOverState.boss as BossState;
    const gameOverDifficulty = gameOverState.difficulty as DifficultyState;
    expectSerializableState(gameOverState);
    expect(gameOverState.scene).toBe('GameOverScene');
    expect(gameOverState.gameOver).toBe(true);
    expect(gameOverState.playerAlive).toBe(false);
    expect(gameOverState.playerHealth).toBe(0);
    expect(gameOverState.victoryVisible).toBe(false);
    expect(gameOverState.gameWon).toBe(false);
    expect(gameOverBoss.active).toBe(false);
    expect(gameOverBoss.defeated).toBe(false);
    expect(gameOverDifficulty.loop).toBe(1);
    await page.screenshot({ path: `${ARTIFACT_DIR}/game-over.png` });

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');
    const restarted = await getGameState(page);
    expectSerializableState(restarted);
    expectCleanGameplayState(restarted, 1);
    expectNoDiagnostics(diagnostics);
  });
});
