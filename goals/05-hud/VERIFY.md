# VERIFY.md - HUD

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 through 04.
3. Confirm score, health, and gameOver state bridge fields work.
4. Confirm GameScene can launch additional scenes.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Game-over cleanup checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-05.1: HUDScene runs with GameScene

**Scenario**: Start GameScene and check HUD visibility.
**State bridge fields**: `scene`, `hudVisible`
**Actions**:
1. Start GameScene.
2. Read state bridge.
**Expected**: Gameplay remains in GameScene and `hudVisible` is true.
**Maps to**: AC-05.1

### Check M-002 - AC-05.2: score text tracks score

**Scenario**: Destroy an enemy and observe score update.
**State bridge fields**: `score`, `hudVisible`
**Actions**:
1. Start GameScene.
2. Record score.
3. Destroy an enemy.
4. Read score again.
**Expected**: Score increases while HUD remains visible.
**Maps to**: AC-05.2

### Check M-003 - AC-05.3: health display tracks playerHealth

**Scenario**: Damage the player.
**State bridge fields**: `playerHealth`, `hudVisible`
**Actions**:
1. Start GameScene.
2. Record playerHealth.
3. Trigger player damage.
4. Read playerHealth.
**Expected**: playerHealth decreases while HUD remains visible.
**Maps to**: AC-05.3

### Check M-004 - AC-05.4: wave label is present

**Scenario**: Start GameScene before the wave system exists.
**State bridge fields**: `hudVisible`
**Actions**:
1. Start GameScene.
2. Capture screenshot.
3. Confirm HUD state remains visible.
**Expected**: Screenshot shows a wave placeholder such as `Wave: -` or `Wave: 1`.
**Maps to**: AC-05.4

### Check M-005 - AC-05.5: HUD does not block movement or shooting

**Scenario**: Move and shoot after HUD starts.
**State bridge fields**: `playerPosition`, `playerBullets`, `hudVisible`
**Actions**:
1. Start GameScene.
2. Record player position and bullet count.
3. Hold ArrowRight and press SPACE.
4. Read state again.
**Expected**: Player moves, bullets fire, and HUD remains visible.
**Maps to**: AC-05.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/05-hud/test-artifacts/`.

### Check S-001 - Visual: HUD layout

**Scenario**: Capture GameScene with HUD active.
**Capture**: `page.screenshot({ path: 'goals/05-hud/test-artifacts/hud.png' })`
**Human checks**: Score, health, and wave text are readable and do not cover the player.
**Maps to**: AC-05.1, AC-05.4

### Check S-002 - Visual: HUD during action

**Scenario**: Capture while bullets and enemies are active.
**Capture**: `page.screenshot({ path: 'goals/05-hud/test-artifacts/hud-action.png' })`
**Human checks**: HUD remains readable while gameplay is visible.
**Maps to**: AC-05.2, AC-05.5

## 6. Evidence Collection

```bash
npx playwright test tests/game/hud.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/05-hud/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/05-hud/PROGRESS.md` using these tables.

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
