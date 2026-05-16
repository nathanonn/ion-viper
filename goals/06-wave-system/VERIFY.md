# VERIFY.md - Wave System

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 through 05.
3. Confirm enemies can spawn, move, be destroyed, and affect score.
4. Confirm HUD shows a wave placeholder before this goal starts.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Wave clearing and timeout checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-06.1: waves spawn from config

**Scenario**: Start GameScene and observe first wave spawning.
**State bridge fields**: `currentWave`, `waveCount`, `enemies`
**Actions**:
1. Start GameScene.
2. Read `currentWave` and `waveCount`.
3. Wait for first wave spawns.
4. Read enemy active count.
**Expected**: currentWave starts at 1, waveCount matches config, and enemies spawn according to wave timing.
**Maps to**: AC-06.1, AC-06.5

### Check M-002 - AC-06.2: wave advances after clear

**Scenario**: Clear every enemy in the first wave.
**State bridge fields**: `currentWave`, `enemies`
**Actions**:
1. Start GameScene.
2. Destroy all first-wave enemies through deterministic test setup or gameplay input.
3. Wait for wave advance.
4. Read `currentWave`.
**Expected**: currentWave increases to 2.
**Maps to**: AC-06.2

### Check M-003 - AC-06.3: later waves are harder

**Scenario**: Inspect WaveConfig or expose wave values through test-safe imports.
**State bridge fields**: `currentWave`, `waveCount`
**Actions**:
1. Run TypeScript checks.
2. Inspect wave config values used by WaveSystem.
**Expected**: Later waves have higher enemy count, faster enemies, or shorter spawn delays.
**Maps to**: AC-06.3

### Check M-004 - AC-06.4: final wave sets gameWon

**Scenario**: Clear all configured waves.
**State bridge fields**: `gameWon`, `currentWave`, `waveCount`, `enemies`
**Actions**:
1. Start GameScene.
2. Clear every configured wave.
3. Wait for win state.
4. Read state.
**Expected**: `gameWon` is true, enemy spawning stops, and gameOver remains false.
**Maps to**: AC-06.4

### Check M-005 - AC-06.5: wave state bridge reports

**Scenario**: Read state during GameScene.
**State bridge fields**: `currentWave`, `waveCount`, `gameWon`
**Actions**:
1. Start GameScene.
2. Read state.
**Expected**: currentWave and waveCount are numbers, and gameWon is a boolean.
**Maps to**: AC-06.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/06-wave-system/test-artifacts/`.

### Check S-001 - Visual: wave HUD updates

**Scenario**: Capture HUD during wave 1 and wave 2.
**Capture**: `page.screenshot({ path: 'goals/06-wave-system/test-artifacts/wave-hud.png' })`
**Human checks**: Wave display is readable and updates to the current wave.
**Maps to**: AC-06.2, AC-06.5

### Check S-002 - Visual: win state

**Scenario**: Capture after final wave is cleared.
**Capture**: `page.screenshot({ path: 'goals/06-wave-system/test-artifacts/win-state.png' })`
**Human checks**: The game clearly indicates victory or a complete final-wave state.
**Maps to**: AC-06.4

## 6. Evidence Collection

```bash
npx playwright test tests/game/wave-system.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/06-wave-system/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/06-wave-system/PROGRESS.md` using these tables.

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
