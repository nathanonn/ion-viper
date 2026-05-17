# VERIFY.md - Rebrand to Ion Viper

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exists and exposes `window.__GAME_STATE__`.
3. Confirm `tests/game/helpers.ts` exists with `getGameState()`, `waitForScene()`, and `pressKey()` helpers.
4. Confirm `tests/playwright.config.ts` has `webServer` configured for `npm run dev` on port 8080.
5. Confirm the browser title and package metadata are intended to change in this goal.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: Playwright starts the dev server automatically during `npm test`.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| MUST | State bridge assertions | `page.evaluate(() => window.__GAME_STATE__)` in Playwright | Yes |
| SHOULD | Visual screenshots | `page.screenshot()` for human review | Yes |
| NICE | Edge cases / polish | Optional checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-08.1: Browser and menu identity use Ion Viper

**Scenario**: Boot the game and verify the browser title and menu-facing identity use Ion Viper.
**State bridge fields**: `scene`, `ready`, `gameIdentity`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for `MenuScene`.
3. Read `page.title()`.
4. Read `window.__GAME_STATE__` via `getGameState(page)`.
**Expected**: Browser title is `Ion Viper`; state bridge title is `Ion Viper`; scene is `MenuScene`.
**Maps to**: AC-08.1, AC-08.3

### Check M-002 - AC-08.2: Description preserves gameplay style

**Scenario**: Verify the identity description still communicates the Raiden-style vertical shooter gameplay.
**State bridge fields**: `gameIdentity`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for `MenuScene`.
3. Read `gameIdentity.description`.
**Expected**: Description contains the exact phrase `Raiden-style vertical shooter`.
**Maps to**: AC-08.2, AC-08.3

### Check M-003 - AC-08.4: Start flow still works

**Scenario**: Start the game after the rebrand.
**State bridge fields**: `scene`, `ready`, `gameIdentity`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for `MenuScene`.
3. Press SPACE.
4. Wait for `GameScene`.
5. Read state bridge.
**Expected**: Scene transitions to `GameScene`; identity still reports `Ion Viper`.
**Maps to**: AC-08.4

### Check M-004 - AC-08.5: Repository directory remains stable

**Scenario**: Confirm the goal did not require a project directory rename.
**State bridge fields**: none
**Actions**:
1. Inspect `pwd` or the workspace path used by the test run.
2. Confirm files still live under `/home/pi/Dev/raiden-shooter`.
**Expected**: Repository directory remains `raiden-shooter`.
**Maps to**: AC-08.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/08-rebrand-ion-viper/test-artifacts/`.

### Check S-001 - Visual: Ion Viper menu title

**Scenario**: MenuScene is visible after boot.
**Capture**: `page.screenshot({ path: 'goals/08-rebrand-ion-viper/test-artifacts/menu-title.png' })`
**Human checks**: The menu reads Ion Viper clearly and no old Raiden Shooter title is visible.
**Maps to**: AC-08.1

### Check S-002 - Visual: Game starts after rebrand

**Scenario**: Press SPACE from menu and capture the gameplay scene.
**Capture**: `page.screenshot({ path: 'goals/08-rebrand-ion-viper/test-artifacts/game-start.png' })`
**Human checks**: Gameplay looks unchanged after the rebrand.
**Maps to**: AC-08.4

## 6. Evidence Collection

```bash
npx playwright test tests/game/rebrand.spec.ts
npm test
npx tsc --noEmit
```

Save relevant output to `goals/08-rebrand-ion-viper/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

If any previous goal's test fails because it expected the old title, update that assertion to Ion Viper. Do not weaken unrelated behavior assertions.

## 8. Evidence Format

/goal must add final evidence to `goals/08-rebrand-ion-viper/PROGRESS.md` before marking complete.

```md
## Final Verification Evidence

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
```
