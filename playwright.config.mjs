import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1
  },
  webServer: {
    command: 'node serve.mjs',
    port: 4173,
    reuseExistingServer: true,
    timeout: 15000
  }
});
