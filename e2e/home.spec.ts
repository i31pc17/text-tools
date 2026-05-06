import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('renders the hero, terminal panel, and 10 tool cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Text Tools/ })).toBeVisible()
    await expect(page.locator('.hero-terminal')).toBeVisible()
    await expect(page.locator('.hero-stats')).toBeVisible()

    const cards = page.locator('.tool-card')
    await expect(cards).toHaveCount(10)
  })

  test('shows brand mark, tab bar with HOME + 10 tabs', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.brand-mark')).toHaveText('1T')

    const tabs = page.locator('.tab-bar .tab')
    await expect(tabs).toHaveCount(11)
    await expect(tabs.first()).toContainText('HOME')
  })

  test('home main area is locked to boxed width', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main.main')).toHaveAttribute('data-width', 'boxed')
  })
})
