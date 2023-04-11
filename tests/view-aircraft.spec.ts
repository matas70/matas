import { test, expect } from '@playwright/test';
import { loadApp, openMenu } from './common';
test('see aircraft details', async ({ page }) => {
    await loadApp(page);

    // if mobile, open menu
    await openMenu(page);

    await page.getByRole('link', { name: 'כלי טיס' }).click();

    await expect(page).toHaveURL('https://localhost:8080/#aircraft');
    await page.getByText('סופה').click();
    await expect(page).toHaveURL('https://localhost:8080/#aircraftSelected');

    const name = page.locator('#aircraftInfoName');
    await expect(name).toHaveText('סופה');
    const type = page.locator('#aircraftInfoType');
    await expect(type).toHaveText('קרב');

    await page.getByRole('link', { name: 'מקומות וזמנים' }).click()
});