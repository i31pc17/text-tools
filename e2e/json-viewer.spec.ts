import { test, expect } from '@playwright/test'

test.describe('JSON Viewer', () => {
  test('valid JSON renders a tree', async ({ page }) => {
    await page.goto('/json-viewer')
    await page.locator('textarea').first().fill('{ "name": "alice", "age": 30 }')
    await expect(page.locator('.jt-string')).toContainText('"alice"')
    await expect(page.locator('.jt-number')).toContainText('30')
    await expect(page.locator('.json-tree')).toBeVisible()
  })

  test('Show Types checkbox toggles type badges', async ({ page }) => {
    await page.goto('/json-viewer')
    await page.locator('textarea').first().fill('{ "n": 1 }')
    await expect(page.locator('.jt-type')).toHaveCount(0)
    await page.getByRole('checkbox', { name: 'Show Types' }).check()
    await expect(page.locator('.jt-type').first()).toBeVisible()
  })
})

test.describe('JSON Viewer — malformed input', () => {
  const cases = [
    { name: 'plain text',          input: 'hello world' },
    { name: 'trailing comma',      input: '{"a":1,}' },
    { name: 'unquoted keys',       input: '{a:1}' },
    { name: 'single-quoted strings', input: "{'a':1}" },
    { name: 'unterminated object', input: '{"a":1' },
    { name: 'unterminated array',  input: '[1,2,3' },
    { name: 'stray garbage',       input: '{"a":1}garbage' }
  ]

  for (const c of cases) {
    test(`shows error for ${c.name}`, async ({ page }) => {
      await page.goto('/json-viewer')
      await page.locator('textarea').first().fill(c.input)
      await expect(page.locator('.hint-error')).toContainText('유효하지 않은')
      await expect(page.locator('.jt-string, .jt-number')).toHaveCount(0)
    })
  }

  test('clearing input restores default hint and removes error', async ({ page }) => {
    await page.goto('/json-viewer')
    const textarea = page.locator('textarea').first()
    await textarea.fill('not json')
    await expect(page.locator('.hint-error')).toBeVisible()
    await textarea.fill('')
    await expect(page.locator('.hint-error')).toHaveCount(0)
    await expect(page.locator('.card-footer .hint').first()).toContainText('파싱되면')
  })
})

test.describe('Width toggle', () => {
  test('BOXED↔FULL switches main[data-width]', async ({ page }) => {
    await page.goto('/json-viewer')
    const main = page.locator('main.main')
    await expect(main).toHaveAttribute('data-width', 'boxed')

    await page.locator('.wt-btn', { hasText: 'FULL' }).click()
    await expect(main).toHaveAttribute('data-width', 'full')

    await page.locator('.wt-btn', { hasText: 'BOXED' }).click()
    await expect(main).toHaveAttribute('data-width', 'boxed')
  })

  test('width preference persists across reload', async ({ page }) => {
    await page.goto('/codec')
    await page.locator('.wt-btn', { hasText: 'FULL' }).click()
    await expect(page.locator('main.main')).toHaveAttribute('data-width', 'full')

    const stored = await page.evaluate(() => localStorage.getItem('tt-width'))
    expect(stored).toBe('full')

    await page.reload()
    await expect(page.locator('main.main')).toHaveAttribute('data-width', 'full')
  })
})
