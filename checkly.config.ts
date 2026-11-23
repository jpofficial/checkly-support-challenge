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
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['cli'],
  },
  cli: {
    // Where `npx checkly test` runs. EU, because the shop site shows its
    // consent dialog there, so a test run covers the harder path.
    runLocation: 'eu-west-1',
    reporters: ['list'],
  },
})
