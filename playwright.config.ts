import { defineConfig, devices } from '@playwright/test'

// Used for local runs only (npx playwright test). Checkly runs each file in
// tests/ as its own check and does not read this file.
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
})
