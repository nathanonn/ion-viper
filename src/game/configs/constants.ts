/**
 * Scene keys - use these everywhere instead of raw strings.
 */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  HUD: 'HUDScene',
} as const;

/**
 * Game dimensions.
 */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

/**
 * Placeholder colors for geometric shapes before final pixel art arrives.
 * Values are hex numbers for Phaser graphics (0xRRGGBB).
 */
export const COLORS = {
  PLAYER: 0x00ff00,
  ENEMY: 0xff0000,
  BULLET: 0xffff00,
  BACKGROUND: 0x111111,
  UI_TEXT: 0xffffff,
  ACCENT: 0x00aaff,
} as const;

// --- Goal 00 adds constants below this line ---
// --- Goal 01 adds constants below this line ---
// --- Goal 02 adds constants below this line ---
// --- Goal 03 adds constants below this line ---
// --- Goal 04 adds constants below this line ---
