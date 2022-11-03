import { test, expect } from '@playwright/test';
import { isMobile } from './common';

test.describe('generic tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("https://localhost:8080/#main");
  });
  
  test('page has independance day title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/יום העצמאות/);

  });

  test('link to press is working', async ({ page }) => {

    // create a locator
    const press = page.locator('#goto-press-button');

    if(isMobile(page)) {
      await expect(press).not.toBeVisible();
    } else {
      // Expect an element to be visible.
      await expect(press).toBeVisible();

      // Click the get started link.
      await press.click();

      // Expects the URL to contain intro.
      await expect(page).toHaveURL(/.*press.html/);
    }
  });
});
