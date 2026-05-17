import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/01-player-ship/test-artifacts';
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_HALF_SIZE = 16;

interface PlayerPosition {
  x: number;
  y: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getPlayerPosition(page: Page): Promise<PlayerPosition> {
  const state = await getGameState(page);
  return state.playerPosition as PlayerPosition;
}

function expectWithinPlayerBounds(position: PlayerPosition): void {
  expect(position.x).toBeGreaterThanOrEqual(PLAYER_HALF_SIZE);
  expect(position.x).toBeLessThanOrEqual(GAME_WIDTH - PLAYER_HALF_SIZE);
  expect(position.y).toBeGreaterThanOrEqual(PLAYER_HALF_SIZE);
  expect(position.y).toBeLessThanOrEqual(GAME_HEIGHT - PLAYER_HALF_SIZE);
}

test.describe('Player Ship', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: player starts bottom-center and visible', async ({ page }) => {
    await startGame(page);

    const state = await getGameState(page);
    const position = state.playerPosition as PlayerPosition;

    expect(state.scene).toBe('GameScene');
    expect(state.playerAlive).toBe(true);
    expect(position.x).toBeCloseTo(GAME_WIDTH / 2, 0);
    expect(position.y).toBeGreaterThan(GAME_HEIGHT * 0.75);
    expectWithinPlayerBounds(position);

    await page.screenshot({ path: `${ARTIFACT_DIR}/player-start.png` });
  });

  test('M-002: player moves horizontally with arrows and WASD', async ({ page }) => {
    await startGame(page);

    const initial = await getPlayerPosition(page);
    await pressKey(page, 'ArrowRight', 500);
    const afterRight = await getPlayerPosition(page);
    await pressKey(page, 'ArrowLeft', 500);
    const afterLeft = await getPlayerPosition(page);
    await pressKey(page, 'KeyD', 500);
    const afterD = await getPlayerPosition(page);
    await pressKey(page, 'KeyA', 500);
    const afterA = await getPlayerPosition(page);

    expect(afterRight.x).toBeGreaterThan(initial.x);
    expect(afterLeft.x).toBeLessThan(afterRight.x);
    expect(afterD.x).toBeGreaterThan(afterLeft.x);
    expect(afterA.x).toBeLessThan(afterD.x);
  });

  test('M-003: player moves vertically with arrows and WASD', async ({ page }) => {
    await startGame(page);

    const initial = await getPlayerPosition(page);
    await pressKey(page, 'ArrowUp', 500);
    const afterUp = await getPlayerPosition(page);
    await pressKey(page, 'ArrowDown', 500);
    const afterDown = await getPlayerPosition(page);
    await pressKey(page, 'KeyW', 500);
    const afterW = await getPlayerPosition(page);
    await pressKey(page, 'KeyS', 500);
    const afterS = await getPlayerPosition(page);

    expect(afterUp.y).toBeLessThan(initial.y);
    expect(afterDown.y).toBeGreaterThan(afterUp.y);
    expect(afterW.y).toBeLessThan(afterDown.y);
    expect(afterS.y).toBeGreaterThan(afterW.y);
  });

  test('M-004 and S-002: player remains clamped inside all bounds', async ({ page }) => {
    await startGame(page);

    await pressKey(page, 'ArrowLeft', 2500);
    const left = await getPlayerPosition(page);
    expectWithinPlayerBounds(left);
    expect(left.x).toBeCloseTo(PLAYER_HALF_SIZE, 0);

    await pressKey(page, 'ArrowRight', 3500);
    const right = await getPlayerPosition(page);
    expectWithinPlayerBounds(right);
    expect(right.x).toBeCloseTo(GAME_WIDTH - PLAYER_HALF_SIZE, 0);

    await pressKey(page, 'ArrowUp', 3000);
    const top = await getPlayerPosition(page);
    expectWithinPlayerBounds(top);
    expect(top.y).toBeCloseTo(PLAYER_HALF_SIZE, 0);

    await pressKey(page, 'ArrowDown', 3500);
    const bottom = await getPlayerPosition(page);
    expectWithinPlayerBounds(bottom);
    expect(bottom.y).toBeCloseTo(GAME_HEIGHT - PLAYER_HALF_SIZE, 0);

    await page.screenshot({ path: `${ARTIFACT_DIR}/player-bounds.png` });
  });

  test('M-005: state bridge reports player fields', async ({ page }) => {
    await startGame(page);

    const state = await getGameState(page);
    const position = state.playerPosition as PlayerPosition;

    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
    expect(state.playerAlive).toBe(true);
  });
});
