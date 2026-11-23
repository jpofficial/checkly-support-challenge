import { EmailAlertChannel } from 'checkly/constructs'

// One channel, shared by both groups. It emails when a check fails and again
// when it recovers. Add more channels here (Slack, SMS, PagerDuty) and append
// them to the alertChannels list of a group.
export const emailChannel = new EmailAlertChannel('email-raccoon', {
  address: 'raccoon@checklyhq.com',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
})
