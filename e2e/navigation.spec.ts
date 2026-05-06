import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('clicking a tool card navigates to its page', async ({ page }) => {
    await page.goto('/')
    await page.locator('.tool-card', { hasText: 'JSON 뷰어' }).click()
    await expect(page).toHaveURL(/\/json-viewer$/)
    await expect(page.locator('.page-title')).toHaveText('JSON 뷰어')
  })

  test('tab bar navigation works', async ({ page }) => {
    await page.goto('/')
    await page.locator('.tab', { hasText: '해시 생성기' }).click()
    await expect(page).toHaveURL(/\/hash$/)
    await expect(page.locator('.page-title')).toHaveText('해시 생성기')

    const activeTab = page.locator('.tab[data-active="true"]')
    await expect(activeTab).toContainText('해시 생성기')
  })

  test('breadcrumb "TEXT TOOLS" returns to home', async ({ page }) => {
    await page.goto('/codec')
    await page.locator('.page-eyebrow a', { hasText: 'TEXT TOOLS' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.tool-grid')).toBeVisible()
  })

  test('"목록으로" button returns to home', async ({ page }) => {
    await page.goto('/jwt-decoder')
    await page.getByRole('button', { name: '목록으로' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
