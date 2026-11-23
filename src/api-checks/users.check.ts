import { AlertEscalationBuilder, CheckGroupV2, Frequency, RetryStrategyBuilder } from 'checkly/constructs'
import { emailChannel } from '../alert-channels'
import { createUserProfileCheck, User } from './create-user-profile-check'
import data from './users.json'

// Group 2: one API check per entry in users.json.
// To monitor another user, add an entry to users.json and deploy.
export const userApiGroup = new CheckGroupV2('user-api-checks', {
  name: 'User API checks',
  activated: true,
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['api'],
  alertChannels: [emailChannel],
  // Same alerting and retry rules as the Playwright group.
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  retryStrategy: RetryStrategyBuilder.singleRetry({ baseBackoffSeconds: 30, sameRegion: true }),
})

const users: User[] = data.users

users.forEach(user => createUserProfileCheck(user, userApiGroup))
