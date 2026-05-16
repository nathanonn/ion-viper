# VERIFY.md - Foundation

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Confirm `src/state-bridge.ts` exists and exposes `window.__GAME_STATE__`.
3. Confirm `tests/game/helpers.ts` exists with `getGameState()`, `waitForScene()`, and `pressKey()`.
4. Confirm `tests/playwright.config.ts` starts `npm run dev` on port 8080.
5. Confirm `tests/game/boot.spec.ts` is present.

If any prerequisite fails, fix it before proceeding.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Health check**: navigate to `http://localhost:8080` and confirm the Phaser canvas renders.
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | `page.evaluate(() => window.__GAME_STATE__)` in Playwright | Yes |
| **SHOULD** | Visual screenshots | `page.screenshot()` for human review | Yes |
| **NICE** | Edge cases | Optional browser and resize checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-00.1: canvas boots without console errors

**Scenario**: Load the root URL and observe page errors while waiting for the menu scene.
**State bridge fields**: `scene`, `ready`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Track `pageerror` and console error events.
3. Wait for `ready === true`.
4. Wait for `scene === 'MenuScene'`.
**Expected**: No page errors occur, state bridge is ready, and the active scene is MenuScene.
**Maps to**: AC-00.1

### Check M-002 - AC-00.2: menu title is present

**Scenario**: Inspect rendered text through a screenshot and confirm state remains on MenuScene.
**State bridge fields**: `scene`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for MenuScene.
3. Confirm state bridge reports MenuScene.
**Expected**: MenuScene is active and the screenshot shows `Raiden Shooter`.
**Maps to**: AC-00.2

### Check M-003 - AC-00.3: SPACE starts the game

**Scenario**: Press SPACE from the menu.
**State bridge fields**: `scene`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for MenuScene.
3. Press SPACE for 100 ms.
4. Wait for GameScene.
**Expected**: `window.__GAME_STATE__.scene` becomes `GameScene`.
**Maps to**: AC-00.3

### Check M-004 - AC-00.4: base state bridge fields report correctly

**Scenario**: Read the state bridge after boot.
**State bridge fields**: `scene`, `ready`, `score`, `gameOver`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for MenuScene.
3. Read state with `getGameState(page)`.
**Expected**: `scene` is `MenuScene`, `ready` is true, `score` is 0, and `gameOver` is false.
**Maps to**: AC-00.4

### Check M-005 - AC-00.5: game constants are configured

**Scenario**: TypeScript build imports constants and verifies no config errors.
**State bridge fields**: Not applicable.
**Actions**:
1. Run `npx tsc --noEmit`.
2. Inspect `src/game/configs/constants.ts`.
**Expected**: TypeScript passes and constants include 800 x 600 dimensions plus Raiden Shooter placeholder colors.
**Maps to**: AC-00.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/00-foundation/test-artifacts/`.

### Check S-001 - Visual: title screen

**Scenario**: Capture the menu after boot.
**Capture**: `page.screenshot({ path: 'goals/00-foundation/test-artifacts/menu.png' })`
**Human checks**: Canvas is centered, title is readable, and no layout overlaps are visible.
**Maps to**: AC-00.1, AC-00.2

### Check S-002 - Visual: blank gameplay scene

**Scenario**: Press SPACE and capture GameScene.
**Capture**: `page.screenshot({ path: 'goals/00-foundation/test-artifacts/game-scene.png' })`
**Human checks**: GameScene displays a clean black canvas without errors or overlays.
**Maps to**: AC-00.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/boot.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/00-foundation/test-artifacts/test-output.txt`.

## 7. Regression

This is the first goal, so there are no prior goal tests. Still run the full suite:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/00-foundation/PROGRESS.md` using these tables.

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
|          |       |          |        |        |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
|          |                 |               |       |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
|          |          |        |        |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
|            |        |       |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
|       |           |        |

### Files Changed

- _(populated by /goal)_

### Remaining Risks

- _(populated by /goal, "None known" if clean)_
