import { test, expect, Page } from '@playwright/test'

// Waits for a page load whose URL ends with path. Used to fail with the site's
// own status code when the site is down, instead of a confusing locator error.
const pageLoad = (page: Page, path: string) =>
  page.waitForResponse(r => r.url().endsWith(path) && r.request().resourceType() === 'document', { timeout: 30_000 })

test('add a product to the cart and reach signup', async ({ page }) => {
  // The site shows a consent dialog to EU visitors, and it can appear late.
  // Blocking ads below also stops it in our runs, so this handler is a safety
  // net. It clicks the dialog if it ever shows up, at any point in the test.
  const consentButton = page.getByRole('button', { name: 'Consent', exact: true })
  await page.addLocatorHandler(consentButton, async () => {
    await consentButton.click()
  })

  // The site's ads can open a full page ad that covers the page and swallows
  // clicks. Ads are not what this test is about, so their requests are blocked.
  await page.route(/googlesyndication\.com|doubleclick\.net|googleadservices\.com/, route => route.abort())

  await test.step('open the products page', async () => {
    const home = await page.goto('https://www.automationexercise.com/')
    expect(home?.status(), 'home page status').toBeLessThan(400)

    const [products] = await Promise.all([
      pageLoad(page, '/products'),
      page.getByRole('link', { name: 'Products' }).click(),
    ])
    expect(products.status(), 'products page status').toBeLessThan(400)
    // Let the page finish loading. Its add to cart buttons are wired up by a
    // script, and a click that lands before that does nothing.
    await page.waitForURL('**/products')
    await expect(page.getByPlaceholder('Search Product')).toBeVisible()
  })

  await test.step('add Blue Top to the cart', async () => {
    const [addToCart] = await Promise.all([
      page.waitForResponse(/\/add_to_cart\/1$/, { timeout: 10_000 }),
      page.locator('div.productinfo a[data-product-id="1"]').click(),
    ])
    expect(addToCart.status(), 'add to cart status').toBe(200)
    await expect(page.getByRole('heading', { name: 'Added!' })).toBeVisible()

    // "Continue Shopping" is a button, not a link.
    await page.getByRole('button', { name: 'Continue Shopping' }).click()
  })

  await test.step('open the cart', async () => {
    // Scoped to the header so it can only ever be the menu link, never the
    // "View Cart" link inside the dialog that adding a product opens.
    const [cart] = await Promise.all([
      pageLoad(page, '/view_cart'),
      page.locator('header').getByRole('link', { name: 'Cart' }).click(),
    ])
    expect(cart.status(), 'cart page status').toBeLessThan(400)
    await page.waitForURL('**/view_cart')
    await expect(page.locator('#cart_info_table')).toContainText('Blue Top')
  })

  await test.step('check out and reach signup', async () => {
    await page.getByText('Proceed To Checkout').click()
    // Logged out, checkout opens a dialog whose link reads "Register / Login".
    const [login] = await Promise.all([
      pageLoad(page, '/login'),
      page.getByRole('link', { name: 'Register / Login' }).click(),
    ])
    expect(login.status(), 'login page status').toBeLessThan(400)
    await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible()
  })
})
