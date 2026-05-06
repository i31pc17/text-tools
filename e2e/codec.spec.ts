import { test, expect } from '@playwright/test'

test.describe('Codec — encoder happy path', () => {
  test('encodes UTF-8 text to Base64 and URL', async ({ page }) => {
    await page.goto('/codec')
    const textareas = page.locator('textarea')
    await textareas.nth(0).fill('안녕')

    // Base64 readonly textarea (the second textarea on the page)
    await expect(textareas.nth(1)).toHaveValue('7JWI64WV')
    // URL-encoded textarea
    await expect(textareas.nth(2)).toHaveValue('%EC%95%88%EB%85%95')
  })
})

test.describe('Codec — Base64 decoder error', () => {
  test('shows error for malformed base64 input', async ({ page }) => {
    await page.goto('/codec')

    // The b64In textarea is the 4th textarea on the page (raw, b64Out, urlOut, b64In, b64Dec, urlIn, urlDec)
    const b64In = page.locator('textarea').nth(3)
    await b64In.fill('not!valid@base64')

    await expect(page.locator('.hint-error').filter({ hasText: 'Base64' })).toBeVisible()
  })

  test('decodes valid base64 back to UTF-8', async ({ page }) => {
    await page.goto('/codec')
    const textareas = page.locator('textarea')
    await textareas.nth(3).fill('7JWI64WV')
    await expect(textareas.nth(4)).toHaveValue('안녕')
  })
})

test.describe('Codec — URL decoder error', () => {
  test('shows error for malformed URL-encoded input', async ({ page }) => {
    await page.goto('/codec')
    // urlIn is the 6th textarea
    const urlIn = page.locator('textarea').nth(5)
    await urlIn.fill('%E0%A4%A')

    await expect(page.locator('.hint-error').filter({ hasText: 'URL' })).toBeVisible()
  })

  test('decodes valid URL-encoded text', async ({ page }) => {
    await page.goto('/codec')
    const textareas = page.locator('textarea')
    await textareas.nth(5).fill('%EC%95%88%EB%85%95')
    await expect(textareas.nth(6)).toHaveValue('안녕')
  })
})
