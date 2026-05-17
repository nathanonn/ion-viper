# VERIFY.md - New Game Plus

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm Goal 12 tests pass first.

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

### Check M-001 - AC-13.1: Fresh game starts at loop 1

**Scenario**: Start from menu and inspect difficulty state.
**State bridge fields**: `difficulty`, `scene`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Press SPACE and wait for `GameScene`.
3. Read `difficulty`.
**Expected**: `difficulty.loop` is 1 and all multipliers are at their base values.
**Maps to**: AC-13.1, AC-13.7

### Check M-002 - AC-13.2 and AC-13.3: Victory restart increments loop

**Scenario**: Reach victory, press restart, and inspect the new game.
**State bridge fields**: `victoryVisible`, `difficulty`, `scene`
**Actions**:
1. Defeat the boss and wait for VictoryScene.
2. Record `difficulty.loop`.
3. Press SPACE or the configured restart input.
4. Wait for `GameScene`.
5. Read `difficulty.loop` again.
**Expected**: New loop equals previous loop + 1.
**Maps to**: AC-13.2, AC-13.3, AC-13.7

### Check M-003 - AC-13.4: Enemies scale up

**Scenario**: Compare loop 1 and loop 2 enemy tuning through state or behavior.
**State bridge fields**: `difficulty`, `enemies`, `enemyTypes`
**Actions**:
1. Record loop 1 difficulty multipliers.
2. Enter loop 2.
3. Record loop 2 difficulty multipliers.
**Expected**: Loop 2 enemy speed and health multipliers are greater than loop 1 values.
**Maps to**: AC-13.4, AC-13.7

### Check M-004 - AC-13.5: Boss scales up

**Scenario**: Compare boss max health or phase pressure between loops.
**State bridge fields**: `difficulty`, `boss`
**Actions**:
1. Reach boss on loop 1 and record `boss.maxHealth`.
2. Restart into loop 2.
3. Reach boss on loop 2 and record `boss.maxHealth`.
**Expected**: Loop 2 boss max health is greater than loop 1, or phase pressure is measurably higher through documented state.
**Maps to**: AC-13.5, AC-13.7

### Check M-005 - AC-13.6: Restart resets transient state

**Scenario**: Restart into loop 2 and inspect reset fields.
**State bridge fields**: `difficulty`, `score`, `playerHealth`, `ionBlast`, `boss`, `enemies`, `gameOver`, `gameWon`
**Actions**:
1. Reach victory on loop 1.
2. Restart into loop 2.
3. Read state bridge immediately after GameScene starts.
**Expected**: Loop is 2; score, boss, enemies, projectiles, Ion Blast, gameOver, and gameWon reset to normal start-of-run values.
**Maps to**: AC-13.6, AC-13.7

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/13-new-game-plus/test-artifacts/`.

### Check S-001 - Visual: Victory restart prompt

**Scenario**: Capture VictoryScene after clearing loop 1.
**Capture**: `page.screenshot({ path: 'goals/13-new-game-plus/test-artifacts/victory-next-loop.png' })`
**Human checks**: Screen clearly communicates restarting into a harder loop.
**Maps to**: AC-13.2

### Check S-002 - Visual: Loop 2 HUD

**Scenario**: Capture gameplay after restarting into loop 2.
**Capture**: `page.screenshot({ path: 'goals/13-new-game-plus/test-artifacts/loop-2-gameplay.png' })`
**Human checks**: HUD or visible state makes the higher loop understandable without clutter.
**Maps to**: AC-13.6

## 6. Evidence Collection

```bash
npx playwright test tests/game/new-game-plus.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/13-new-game-plus/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

Boss and victory tests may need to account for loop state, but loop 1 behavior must remain consistent with Goal 12.

## 8. Evidence Format

/goal must add final evidence to `goals/13-new-game-plus/PROGRESS.md` before marking complete.

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
