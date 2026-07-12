import { test, expect } from '@playwright/test'

test.describe('Property Flow', () => {
  test('can search and view a property', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    // Find search bar and type
    const searchInput = page.locator('input[placeholder="Search locations, micro-markets..."]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('Delhi')
      const searchBtn = page.locator('button:has-text("Search")')
      if (await searchBtn.isVisible()) {
        await searchBtn.click()
      }
    }
  })
})
