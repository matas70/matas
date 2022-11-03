import { test, expect } from '@playwright/test';
import { loadApp, openMenu } from './common';

test('choose ar aircraft', async ({ page }) => {
  test.slow();
  test.slow();
  test.fixme();

  await loadApp(page);
  await openMenu(page); // if mobile

  await page.getByRole('link', { name: 'כלי טיס' }).click();
  
  await expect(page).toHaveURL('https://localhost:8080/#aircraft');

  await page.locator('#aircraftsListView div:has-text("סופה קרב")').first().click();


  const [arPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('#aircraftInfo3D #ARButton').click()
  ]);

  await expect(arPage).toHaveURL('https://localhost:8080/ar.html');

  // wait for the ar to load
  await expect(arPage.locator('.loading-ar')).not.toBeVisible();

  await arPage.getByRole('button', { name: 'ברק' }).click();

  await expect(arPage.getByRole('button', { name: 'ברק' })).toHaveClass(/selected/);

  await arPage.getByRole('button', { name: 'אדיר' }).click();

  await expect(arPage.getByRole('button', { name: 'אדיר' })).toHaveClass(/selected/);

  

});