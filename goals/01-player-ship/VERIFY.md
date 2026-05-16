# VERIFY.md - Player Ship

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goal 00 and confirm boot tests pass.
3. Confirm state bridge includes base fields.
4. Confirm helpers expose `getGameState()`, `waitForScene()`, and `pressKey()`.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Optional sustained-input checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-01.1: player starts bottom-center

**Scenario**: Start GameScene and read player position.
**State bridge fields**: `playerPosition`, `playerAlive`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Press SPACE from MenuScene.
3. Wait for GameScene.
4. Read `playerPosition`.
**Expected**: Player x is near 400, y is near the lower play area, and `playerAlive` is true.
**Maps to**: AC-01.1, AC-01.5

### Check M-002 - AC-01.2: player moves horizontally

**Scenario**: Hold right, then left.
**State bridge fields**: `playerPosition`
**Actions**:
1. Start GameScene.
2. Record initial `playerPosition.x`.
3. Hold `ArrowRight` for 500 ms.
4. Record final x.
5. Hold `ArrowLeft` for 500 ms.
**Expected**: x increases after right input and decreases after left input.
**Maps to**: AC-01.2

### Check M-003 - AC-01.3: player moves vertically

**Scenario**: Hold up, then down.
**State bridge fields**: `playerPosition`
**Actions**:
1. Start GameScene.
2. Record initial `playerPosition.y`.
3. Hold `ArrowUp` for 500 ms.
4. Hold `ArrowDown` for 500 ms.
**Expected**: y decreases after up input and increases after down input.
**Maps to**: AC-01.3

### Check M-004 - AC-01.4: player is clamped to bounds

**Scenario**: Hold each movement direction long enough to hit bounds.
**State bridge fields**: `playerPosition`
**Actions**:
1. Start GameScene.
2. Hold `ArrowLeft`, `ArrowRight`, `ArrowUp`, and `ArrowDown` in separate runs.
3. Read final positions.
**Expected**: x remains within 0..800 and y remains within 0..600, accounting for sprite half-size.
**Maps to**: AC-01.4

### Check M-005 - AC-01.5: state bridge fields exist

**Scenario**: Read state after GameScene starts.
**State bridge fields**: `playerPosition`, `playerAlive`
**Actions**:
1. Start GameScene.
2. Read state.
**Expected**: `playerPosition.x` and `playerPosition.y` are numbers, and `playerAlive` is true.
**Maps to**: AC-01.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/01-player-ship/test-artifacts/`.

### Check S-001 - Visual: player start position

**Scenario**: Capture GameScene immediately after start.
**Capture**: `page.screenshot({ path: 'goals/01-player-ship/test-artifacts/player-start.png' })`
**Human checks**: Player placeholder is visible, centered horizontally, and near the bottom.
**Maps to**: AC-01.1

### Check S-002 - Visual: player at bounds

**Scenario**: Move player to each edge and capture screenshots.
**Capture**: `page.screenshot({ path: 'goals/01-player-ship/test-artifacts/player-bounds.png' })`
**Human checks**: Player remains fully visible and does not clip outside the canvas.
**Maps to**: AC-01.4

## 6. Evidence Collection

```bash
npx playwright test tests/game/player-ship.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/01-player-ship/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/01-player-ship/PROGRESS.md` using these tables.

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
