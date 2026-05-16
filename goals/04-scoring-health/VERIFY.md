# VERIFY.md - Scoring and Health

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 through 03.
3. Confirm enemies can be destroyed by bullets.
4. Confirm GameOverScene exists and is reachable.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Damage timing checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-04.1: enemy kills increase score

**Scenario**: Destroy an enemy with a bullet.
**State bridge fields**: `score`, `enemies`
**Actions**:
1. Start GameScene.
2. Record initial score.
3. Destroy one enemy through deterministic test setup or gameplay input.
4. Read score again.
**Expected**: Score increases by the configured enemy score value.
**Maps to**: AC-04.1

### Check M-002 - AC-04.2: enemy contact damages player

**Scenario**: Cause player-enemy overlap.
**State bridge fields**: `playerHealth`
**Actions**:
1. Start GameScene.
2. Record initial playerHealth.
3. Trigger player-enemy overlap.
4. Read playerHealth.
**Expected**: playerHealth decreases by 1.
**Maps to**: AC-04.2

### Check M-003 - AC-04.3: invulnerability prevents repeated damage

**Scenario**: Keep the player overlapping an enemy during invulnerability.
**State bridge fields**: `playerHealth`
**Actions**:
1. Start GameScene.
2. Trigger one damage event.
3. Continue overlap within the invulnerability window.
4. Read playerHealth.
**Expected**: Health decreases only once during the invulnerability window.
**Maps to**: AC-04.3

### Check M-004 - AC-04.4: death transitions to GameOverScene

**Scenario**: Reduce player health to zero.
**State bridge fields**: `playerHealth`, `gameOver`, `scene`
**Actions**:
1. Start GameScene.
2. Trigger damage until health reaches zero.
3. Wait for scene transition.
4. Read state.
**Expected**: `gameOver` is true and `scene` is `GameOverScene`.
**Maps to**: AC-04.4

### Check M-005 - AC-04.5: scoring and health state reports

**Scenario**: Read state during GameScene.
**State bridge fields**: `score`, `playerHealth`, `gameOver`
**Actions**:
1. Start GameScene.
2. Read state.
**Expected**: score and playerHealth are numbers, and gameOver is a boolean.
**Maps to**: AC-04.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/04-scoring-health/test-artifacts/`.

### Check S-001 - Visual: player damage feedback

**Scenario**: Capture the player during invulnerability flash.
**Capture**: `page.screenshot({ path: 'goals/04-scoring-health/test-artifacts/damage-flash.png' })`
**Human checks**: Player damage feedback is visible but the ship remains readable.
**Maps to**: AC-04.3

### Check S-002 - Visual: game over screen

**Scenario**: Capture GameOverScene after player death.
**Capture**: `page.screenshot({ path: 'goals/04-scoring-health/test-artifacts/game-over.png' })`
**Human checks**: Game over text and final score are readable.
**Maps to**: AC-04.4

## 6. Evidence Collection

```bash
npx playwright test tests/game/scoring-health.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/04-scoring-health/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/04-scoring-health/PROGRESS.md` using these tables.

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
