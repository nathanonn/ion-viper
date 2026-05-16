import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './game',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:8080',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
