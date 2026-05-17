import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { BOSS, PLAYER_COMBAT } from '../../src/game/configs/constants';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/13-new-game-plus/test-artifacts';

interface DifficultyState {
  loop: number;
  enemySpeedMultiplier: number;
  enemyHealthMultiplier: number;
  bossHealthMultiplier: number;
}

interface BossState {
  active: boolean;
  health: number;
  maxHealth: number;
  phase: number;
  defeated: boolean;
}

interface EnemyTuningSample {
  health: number;
  speed: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getDifficulty(page: Page): Promise<DifficultyState> {
  const state = await getGameState(page);
  return state.difficulty as DifficultyState;
}

async function sampleBasicEnemyTuning(page: Page): Promise<EnemyTuningSample> {
  return page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const enemy = scene.enemySpawner.spawnEnemy({ type: 'basic' });

    if (!enemy) {
      throw new Error('Unable to spawn enemy for difficulty sample');
    }

    const sample = {
      health: enemy.getMaxHealth(),
      speed: enemy.body.velocity.y,
    };
    scene.enemySpawner.destroyEnemy(enemy);
    scene.publishEnemyState();

    return sample;
  });
}

async function forceBossStart(page: Page): Promise<BossState> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const waveSystem = scene.waveSystem;
    const waves = waveSystem.waves as { enemyCount: number }[];
    const finalWave = waves[waves.length - 1];

    for (const enemy of scene.enemySpawner.getGroup().getChildren()) {
      if (enemy.active) {
        scene.enemySpawner.destroyEnemy(enemy);
      }
    }

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
  });

  await page.waitForFunction(
    () => (window as any).__GAME_STATE__?.boss?.active === true,
    undefined,
    { timeout: 2000 }
  );

  const state = await getGameState(page);
  return state.boss as BossState;
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

    for (let i = 0; i < health; i += 1) {
      scene.combatSystem.invulnerabilityMs = 0;
      scene.combatSystem.damagePlayer();
    }
  }, PLAYER_COMBAT.STARTING_HEALTH);

  await waitForScene(page, 'GameOverScene', 3000);
}

test.describe('New Game Plus', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001: fresh game starts at loop 1 with base multipliers', async ({ page }) => {
    await startGame(page);

    const difficulty = await getDifficulty(page);

    expect(difficulty.loop).toBe(1);
    expect(difficulty.enemySpeedMultiplier).toBe(1);
    expect(difficulty.enemyHealthMultiplier).toBe(1);
    expect(difficulty.bossHealthMultiplier).toBe(1);
  });

  test('M-002, M-003, M-004, M-005, S-001, and S-002: victory restarts into scaled loop 2', async ({
    page,
  }) => {
    await startGame(page);

    const loop1Difficulty = await getDifficulty(page);
    const loop1Enemy = await sampleBasicEnemyTuning(page);
    const loop1Boss = await forceBossStart(page);

    await defeatBoss(page);
    const victoryState = await getGameState(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/victory-next-loop.png` });

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');

    const loop2Start = await getGameState(page);
    const loop2Difficulty = loop2Start.difficulty as DifficultyState;
    const loop2Enemy = await sampleBasicEnemyTuning(page);
    const loop2Boss = await forceBossStart(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/loop-2-gameplay.png` });

    expect(victoryState.scene).toBe('VictoryScene');
    expect(victoryState.victoryVisible).toBe(true);
    expect(loop2Difficulty.loop).toBe(loop1Difficulty.loop + 1);
    expect(loop2Difficulty.enemySpeedMultiplier).toBeGreaterThan(
      loop1Difficulty.enemySpeedMultiplier
    );
    expect(loop2Difficulty.enemyHealthMultiplier).toBeGreaterThan(
      loop1Difficulty.enemyHealthMultiplier
    );
    expect(loop2Difficulty.bossHealthMultiplier).toBeGreaterThan(
      loop1Difficulty.bossHealthMultiplier
    );
    expect(loop2Enemy.speed).toBeGreaterThan(loop1Enemy.speed);
    expect(loop2Enemy.health).toBeGreaterThan(loop1Enemy.health);
    expect(loop2Boss.maxHealth).toBeGreaterThan(loop1Boss.maxHealth);
    expect(loop2Start.score).toBe(0);
    expect(loop2Start.playerHealth).toBe(PLAYER_COMBAT.STARTING_HEALTH);
    expect(loop2Start.gameOver).toBe(false);
    expect(loop2Start.gameWon).toBe(false);
    expect(loop2Start.victoryVisible).toBe(false);
    expect((loop2Start.boss as BossState).active).toBe(false);
    expect((loop2Start.boss as BossState).maxHealth).toBe(0);
    expect((loop2Start.enemies as { activeCount: number }).activeCount).toBe(0);
    expect((loop2Start.enemyProjectiles as { activeCount: number }).activeCount).toBe(0);
    const loop2IonBlast = loop2Start.ionBlast as { active: boolean; collectedCount: number };
    expect(loop2IonBlast.active).toBe(false);
    expect(loop2IonBlast.collectedCount).toBe(0);
  });

  test('game over retry preserves the current loop without incrementing', async ({ page }) => {
    await startGame(page);
    await forceBossStart(page);
    await defeatBoss(page);
    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');

    const loop2 = await getDifficulty(page);
    await forceGameOver(page);
    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');
    const retried = await getDifficulty(page);

    expect(loop2.loop).toBe(2);
    expect(retried.loop).toBe(2);
  });
});
