import { AlertEscalationBuilder, CheckGroupV2, Frequency, RetryStrategyBuilder } from 'checkly/constructs'
import { emailChannel } from '../src/alert-channels'

// Group 1: every Playwright test in this folder.
//
// No test is listed by name. On each deploy the CLI globs this folder, so a new
// test file becomes a check with no change here. The file name decides the type:
//
//   <name>.spec.ts or <name>.test.ts          -> Browser check (real browser)
//   <name>.api.spec.ts or <name>.api.test.ts  -> Multistep check (requests only)
//
// .js works in place of .ts. The check is named after the file, and the file
// path is its identity: renaming a file replaces the check and starts its run
// history over.
export const playwrightGroup = new CheckGroupV2('playwright-checks', {
  name: 'Playwright checks',
  activated: true,
  frequency: Frequency.EVERY_30M,
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['playwright'],
  alertChannels: [emailChannel],
  // Needed next to alertChannels. Without a policy on the group, Checkly uses
  // each check's own alert settings instead of the group's. This one alerts on
  // the first failed run.
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  // Retry once, 30 seconds later, in the same region, before a failure counts.
  // A one-off blip on a third party site then does not send an email, and a
  // problem that only shows up in one region is not hidden by a pass elsewhere.
  retryStrategy: RetryStrategyBuilder.singleRetry({ baseBackoffSeconds: 30, sameRegion: true }),
  browserChecks: {
    testMatch: '**/!(*.api).{spec,test}.{ts,js}',
  },
  multiStepChecks: {
    testMatch: '**/*.api.{spec,test}.{ts,js}',
  },
})
