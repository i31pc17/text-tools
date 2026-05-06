import { test, expect } from '@playwright/test'

test.describe('Theme + Tweaks', () => {
  test('theme toggle flips data-theme on <html>', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.locator('.icon-btn[title="Dark"]').click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.locator('.icon-btn[title="Light"]').click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('tweaks panel opens, density change applies', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.tweaks-panel')).toHaveCount(0)

    await page.locator('.tweaks-fab').click()
    await expect(page.locator('.tweaks-panel')).toBeVisible()

    await page.locator('.tweaks-panel .btn', { hasText: 'Compact' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact')

    await page.locator('.tweaks-panel .btn', { hasText: 'Spacious' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-density', 'spacious')
  })

  test('accent swatch changes --accent custom property', async ({ page }) => {
    await page.goto('/')
    await page.locator('.tweaks-fab').click()

    // pick the green swatch (#16A34A)
    await page.locator('.tweaks-swatch[style*="rgb(22, 163, 74)"]').click()
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    )
    expect(accent.toLowerCase()).toMatch(/^#16a34a$/i)
  })
})
