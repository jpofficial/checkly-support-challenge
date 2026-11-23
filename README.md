# Raccoon Synthetics

Your synthetic monitoring, defined as code and deployed with the Checkly CLI.
This is the Git repository you asked for, built from the two Playwright tests
and the `users.json` you sent. Nothing runs in your Checkly account until you
deploy it.

## Quick start

You need [Node.js](https://nodejs.org) 22.13 or later (the LTS download on
nodejs.org is fine), git, and a Checkly account. Check your Node version with
`node -v`, and install the LTS version first if it is older. If you use nvm,
`nvm install` in the project folder picks up the version in `.nvmrc`. npm and
npx come with Node.

```bash
git clone https://github.com/jpofficial/checkly-support-challenge.git
```

```bash
cd checkly-support-challenge
```

```bash
npm ci
```

This installs the Checkly CLI into the project. Nothing needs to be installed
globally. npm may report a few moderate vulnerabilities. They are inside the
Checkly CLI's own dependencies and are expected. Do not run
`npm audit fix --force`: it downgrades the CLI.

```bash
npx checkly login
```

It either shows a link and a short code to enter in a browser, or asks whether
you want to log in or sign up and then offers to open your browser. Follow the
prompts. If you don't have a Checkly account yet, you can sign up on the same
page.

```bash
npx checkly env add USER_API_TOKEN --secret
```

It asks for the value and hides what you type, so nothing appears when you
paste. Paste once and press Enter. Paste the token only, without the word
`Bearer`, because the checks add `Bearer` themselves. If it says the variable
could not be added because it already exists, run
`npx checkly env update USER_API_TOKEN --secret` instead.

```bash
npx checkly test --retries 1
```

This runs every check on Checkly and deploys nothing. It takes a minute or
two. A failed check is retried once right away. If one still
fails, the output names the check and what broke.

- If the three user checks fail with status 401, the token was not stored
  correctly. Run `npx checkly env update USER_API_TOKEN --secret`, paste it
  once without `Bearer`, and test again.
- If the shop check fails with a 5xx status, or a user check times out, that
  is the demo site or the users API being slow, not your setup. Run the
  command again.

When all 5 pass, move this project into your own git repository before you
deploy. This copy still points at the repository it was cloned from, you can't
push to it, and a deploy sends the git remote to Checkly. If you already have a
repository or Checkly CLI project for this, stop here and tell us, so we can
help merge this in.

Otherwise, create a new, empty repository on GitHub, GitLab or similar. Leave it
empty, with no README, license or .gitignore, or the push below is rejected. Use
a new repository and not a fork, so you can keep it private. Then point this
copy at it, using your repository's URL in place of the example:

```bash
git remote set-url origin https://github.com/your-org/raccoon-synthetics.git
```

```bash
git push -u origin main
```

If git asks for a password and then refuses it, your machine is not signed in
to GitHub yet. Running `gh auth login` with the
[GitHub CLI](https://cli.github.com) fixes it.

Next, check your plan. `npx checkly whoami` shows it on the
"Plan" line. The free Hobby plan has fewer monthly
runs than this project uses, and Checkly stops running checks when they run
out. See "Your plan" below. Then deploy:

```bash
npx checkly deploy
```

It shows what it will create and asks you to confirm. From then on the checks
run on their schedule, and you will see them in your Checkly dashboard under
two groups.

## What this sets up

| Group | Checks | Runs every | Defined in |
|---|---|---|---|
| Playwright checks | One per test file in `tests/` | 30 minutes | `tests/playwright-group.check.ts` |
| User API checks | One per entry in `users.json` | 10 minutes | `src/api-checks/users.check.ts` |

Each run happens in one of two regions, `us-east-1` (N. Virginia) or
`eu-central-1` (Frankfurt), taking turns. Both are available on every plan.
A failed run is retried once, 30 seconds later, in the same region. If it fails
again, Checkly emails `raccoon@checklyhq.com`, and emails again when the check
recovers. To change the address, edit `src/alert-channels.ts` and deploy.

## Layout

```
checkly.config.ts              project name and defaults for every check
playwright.config.ts           local Playwright runs only
tests/                         all your Playwright tests live here
  shop-add-to-cart.spec.ts       browser check
  pokemon-type.api.spec.ts       multistep check
  playwright-group.check.ts      group 1, picks up every test in this folder
src/
  alert-channels.ts            the email alert channel
  api-checks/
    users.json                 the list of users to monitor
    create-user-profile-check.ts   the reusable function, one check per user
    users.check.ts             group 2, loops over users.json
```

## Everyday use

| Command | What it does |
|---|---|
| `npx checkly test --retries 1` | Runs every check on Checkly, retrying a failure once. Deploys nothing. |
| `npx checkly deploy --preview` | Shows what a deploy would create, change or delete. |
| `npx checkly deploy` | Deploys. Asks you to confirm first. |
| `npx playwright test` | Runs the Playwright tests on your own machine. The first time, run `npx playwright install chromium` once. |
| `npm run typecheck` | Checks the TypeScript, including `users.json` entries. |

The same commands are in `package.json`. `npm test` type checks first and then
runs `checkly test` on Checkly's infrastructure, which can count toward your
plan's runs. `npm run test:local` runs Playwright on
your machine. `npm run deploy` type checks first and then deploys.

## Add a Playwright test

Put a file in `tests/` and deploy. Nothing else needs to change. The file name
decides whether it becomes a check and which kind:

| File name | Becomes | Use it when |
|---|---|---|
| `something.spec.ts` or `something.test.ts` | Browser check | The test uses `page` |
| `something.api.spec.ts` or `something.api.test.ts` | Multistep check | The test only uses `request` |

`.js` works in place of `.ts`. Any other name is not picked up. A test can
import `@playwright/test`, Node.js built-in modules, your own files in the repo, and the packages
Checkly's runtime includes (`npx checkly runtimes` lists them). The CLI stops
with an error naming any other package. A multistep
check does not start a browser, so it is faster, costs less, and reports each
`test.step` separately.

The check is named after the file, and that name is what appears in alert
emails. The file path is also the check's identity, so renaming or moving a
file replaces the check and starts its run history over.

## Add a user to the API checks

Add an entry to the `users` list in `src/api-checks/users.json`, with a comma
after the entry before it, and deploy. Use your new user's real id, name and
profile URL in place of the example values:

```json
    {
      "id": 28,
      "name": "Tina Johnson",
      "profile_url": "https://jsonmap-faiy.onrender.com/api/v1/items/user28"
    },
    {
      "id": 99,
      "name": "New User",
      "profile_url": "https://jsonmap-faiy.onrender.com/api/v1/items/user99"
    }
```

The URL must accept the same token. Run `npm run typecheck` to catch a missing
field or comma.

Each entry becomes one check that asserts:

- the status code is 200
- `id` in the response equals the `id` in the file
- `name` in the response equals the `name` in the file

A response slower than 5 seconds marks the check as degraded. Slower than 30
seconds fails it. The API's host can be slow to wake up after a quiet spell,
which is why the limit is generous.

Each `id` must be unique, and the CLI stops with an error if two match. Changing
an `id` replaces that check and starts its history over.

The function that builds the check is `createUserProfileCheck` in
`src/api-checks/create-user-profile-check.ts`. It takes a user and a group, so
it can be reused from any other check file.

## Fixes to your original tests

**Shop test**

| Problem | Fix |
|---|---|
| `Continue Shopping` is a button, so the `link` locator waited for something that never appeared | `getByRole('button', ...)` |
| The checkout dialog link reads `Register / Login`, not `Register / Signup` | Use the real name |
| Three `expect(x).toBeVisible;` lines have no `()` and no `await`. They check nothing, and Playwright raises no error, so it is easy to miss | `await expect(x).toBeVisible()` |
| The site often shows a full page ad that covers the page and blocks clicks | Block requests to ad networks. Ads are not what the test is about |
| `isVisible()` checks the consent dialog once and does not wait for it | `page.addLocatorHandler`, which clicks it whenever it appears |
| A click could land before the page's scripts were ready and do nothing | Wait for each page's URL before clicking on it |

The test also now checks that Blue Top is in the cart, which its name promised,
and it is split into steps so a failure says which step broke. The Cart link is
looked up inside the page header, so it can never match the "View Cart" link in
the dialog that adding a product opens.

**Pokemon test**

| Problem | Fix |
|---|---|
| `forms` is an array, so `forms.url` is `undefined` | `forms[0].url` |
| `types[0].type` is an object, never equal to `'electric'` | `types[0].type.name` |
| `expect(response).toBeOK()` was not awaited | `await expect(response).toBeOK()` |

In both files the URLs were wrapped in `<` and `>`. That may only be how the
chat displayed them. If they are in your source, remove them.

## Good to know

- **The token.** It is stored in Checkly as an encrypted secret. Checkly never
  shows a secret's value again, in the UI, the CLI, the API or the logs, and it
  is not in this repository. Because it was shared in a chat, rotating it is a
  good precaution. Then store the new value with
  `npx checkly env update USER_API_TOKEN --secret`.
- **Checks you made in the Checkly UI.** A deploy does not touch them, so they
  stay next to the new ones. Delete the old two once these pass.
- **Your plan.** At these schedules the project uses 17,280 API runs and 1,440
  browser runs a month, before retries. That fits the Starter plan.
  The free Hobby plan allows fewer, and Checkly stops running checks once a
  month's runs are used up. Each request in a multistep
  check counts as an API run. Compare that with your plan's limits on the
  [pricing page](https://www.checklyhq.com/pricing/) and change the `frequency`
  in either group file if you need to.
- **The Checkly runtime.** `checkly.config.ts` pins runtime `2026.04`, which
  runs Playwright 1.58.2. `package.json` pins the same Playwright, so local runs
  match Checkly. If you change one, change the other.
- **The shop site.** It is a public demo site and sometimes returns errors.
  The test checks the status of each page it loads and of the add to cart
  request, so it then fails with the site's status code. The retry usually
  absorbs it.
- **Deploying from CI.** Create an API key in the Checkly app's user settings
  and copy your account ID from the account settings. Set them as
  `CHECKLY_API_KEY` and `CHECKLY_ACCOUNT_ID` in your CI environment, run
  `npm ci`, then run `npx checkly deploy --force`.
- **A bigger Playwright project.** If you later have a full Playwright project
  with its own config, Checkly can run it as a whole with
  [Playwright Check Suites](https://www.checklyhq.com/docs/guides/playwright-testing-to-monitoring/).
- **`npm audit`.** It reports warnings inside the Checkly CLI's own
  dependencies. Do not run `npm audit fix --force`: it downgrades the CLI.
- **Removing everything.** `npx checkly destroy` deletes every check, group and
  channel this project created in Checkly.
