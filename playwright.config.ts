import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const HOST = '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    actionTimeout: 5_000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: `pnpm exec serve .output/public -l tcp://${HOST}:${PORT} --no-clipboard --no-port-switching`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 60_000
  }
})
