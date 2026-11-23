import { ApiCheck, AssertionBuilder, CheckGroupV2 } from 'checkly/constructs'

export interface User {
  id: number
  name: string
  profile_url: string
}

/**
 * Creates one API check for one user.
 *
 * Reusable: call it with any object shaped like an entry of users.json and the
 * group the check belongs to. The check passes when the profile URL returns
 * 200 and the id and name in the response body match the entry.
 */
export function createUserProfileCheck (user: User, group: CheckGroupV2): ApiCheck {
  return new ApiCheck(`user-profile-${user.id}`, {
    name: `User profile: ${user.name} (${user.id})`,
    group,
    // The API is on a host that can take several seconds to wake up after a
    // quiet spell. Mark the check degraded past 5 seconds and fail it only past
    // 30, so a slow start is visible without paging anyone.
    degradedResponseTime: 5000,
    maxResponseTime: 30000,
    request: {
      method: 'GET',
      url: user.profile_url,
      headers: [
        // {{USER_API_TOKEN}} is filled in by Checkly at run time from a secret
        // environment variable. The token itself is never in this repository.
        { key: 'Authorization', value: 'Bearer {{USER_API_TOKEN}}' },
      ],
      assertions: [
        AssertionBuilder.statusCode().equals(200),
        AssertionBuilder.jsonBody('$.id').equals(user.id),
        AssertionBuilder.jsonBody('$.name').equals(user.name),
      ],
    },
  })
}
