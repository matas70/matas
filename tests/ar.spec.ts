import { test, expect } from '@playwright/test';

test('choose ar aircraft', async ({ page }) => {

  await page.goto('https://localhost:8080/#main');
  await expect(page).toHaveURL('https://localhost:8080/#main');

  await page.getByRole('link', { name: 'כלי טיס' }).click();
  
  await expect(page).toHaveURL('https://localhost:8080/#aircraft');

  await page.locator('#aircraftsListView div:has-text("סופה קרב")').first().click();


  const [arPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('#aircraftInfo3D #ARButton').click()
  ]);

  await arPage.getByRole('button', { name: 'ברק' }).click();

  await expect(arPage.getByRole('button', { name: 'ברק' })).toHaveClass(/selected/);

  await arPage.getByRole('button', { name: 'אדיר' }).click();

  await expect(arPage.getByRole('button', { name: 'אדיר' })).toHaveClass(/selected/);

  

});