import { test, expect } from '@playwright/test'

function b64url(s: string): string {
  // browser-side btoa works for ASCII; tests use ASCII payloads only
  return Buffer.from(s, 'utf-8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

test.describe('JWT decoder validation', () => {
  test('default hint shown for empty input', async ({ page }) => {
    await page.goto('/jwt-decoder')
    const footer = page.locator('.card-footer .hint').first()
    await expect(footer).toContainText('Header와 Payload만')
  })

  test('reports format error for non-JWT text', async ({ page }) => {
    await page.goto('/jwt-decoder')
    await page.locator('textarea').fill('this-is-not-a-jwt')
    await expect(page.locator('.card-footer .hint-error').first()).toContainText('JWT 형식')
  })

  test('reports format error for single-segment input', async ({ page }) => {
    await page.goto('/jwt-decoder')
    await page.locator('textarea').fill(b64url('{"alg":"HS256"}'))
    await expect(page.locator('.hint-error').first()).toContainText('JWT 형식')
  })

  test('decodes a valid header.payload token into trees', async ({ page }) => {
    await page.goto('/jwt-decoder')
    const token = `${b64url('{"alg":"HS256","typ":"JWT"}')}.${b64url('{"sub":"u1","name":"alice"}')}`
    await page.locator('textarea').fill(token)

    await expect(page.getByText('DECODED HEADER')).toBeVisible()
    await expect(page.getByText('DECODED PAYLOAD')).toBeVisible()
    await expect(page.locator('.jt-string').filter({ hasText: '"HS256"' })).toBeVisible()
    await expect(page.locator('.jt-string').filter({ hasText: '"alice"' })).toBeVisible()
  })

  test('flags HEADER decode error while still showing payload', async ({ page }) => {
    await page.goto('/jwt-decoder')
    const token = `~~broken~~.${b64url('{"sub":"ok"}')}`
    await page.locator('textarea').fill(token)

    await expect(page.locator('.hint-error').filter({ hasText: 'HEADER' })).toBeVisible()
    await expect(page.locator('.jt-string').filter({ hasText: '"ok"' })).toBeVisible()
  })

  test('flags PAYLOAD decode error while still showing header', async ({ page }) => {
    await page.goto('/jwt-decoder')
    const token = `${b64url('{"alg":"HS256"}')}.~~broken~~`
    await page.locator('textarea').fill(token)

    await expect(page.locator('.hint-error').filter({ hasText: 'PAYLOAD' })).toBeVisible()
    await expect(page.locator('.jt-string').filter({ hasText: '"HS256"' })).toBeVisible()
  })

  test('strips wrapping quotes from pasted token', async ({ page }) => {
    await page.goto('/jwt-decoder')
    const inner = `${b64url('{"alg":"HS256"}')}.${b64url('{"x":"quoted"}')}`
    await page.locator('textarea').fill(`"${inner}"`)
    await expect(page.locator('.jt-string').filter({ hasText: '"quoted"' })).toBeVisible()
  })
})
