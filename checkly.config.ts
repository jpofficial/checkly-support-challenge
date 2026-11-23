import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Raccoon Synthetics',
  logicalId: 'raccoon-synthetics',
  checks: {
    // Every *.check.ts file under src/ and tests/ is loaded on test and deploy.
    checkMatch: ['src/**/*.check.ts', 'tests/**/*.check.ts'],
    // Defaults for every check. A group or a check can override them.
    activated: true,
    muted: false,
    // The runtime fixes the Playwright and Node versions the checks run on.
    // 2026.04 ships Playwright 1.58.2, and package.json pins the same version
    // so local runs match Checkly. List runtimes with: npx checkly runtimes
    runtimeId: '2026.04',
    frequency: Frequency.EVERY_30M,
    // Both locations are available on every Checkly plan.
    locations: ['us-east-1', 'eu-central-1'],
    tags: ['cli'],
  },
  cli: {
    // Where `npx checkly test` runs unless you pass --location.
    runLocation: 'eu-central-1',
    reporters: ['list'],
  },
})
