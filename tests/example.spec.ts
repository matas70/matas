import { test, expect } from '@playwright/test';

test.describe('generic tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("https://127.0.0.1:8080/#main");
  });
  
  test('page has independance day title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/יום העצמאות/);

  });

  test('link to press is working', async ({ page }) => {

    // create a locator
    const press = page.locator('#goto-press-button');

    // Expect an element to be visible.
    await expect(press).toBeVisible();

    // Click the get started link.
    await press.click();

    // Expects the URL to contain intro.
    await expect(page).toHaveURL(/.*press.html/);
  });
});
