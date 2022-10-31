import { test, expect } from '@playwright/test';
test('test', async ({ page }) => {
    await page.goto('https://localhost:8080');
    // wait loading to be finished
    await page.waitForSelector('.splash', { state: 'hidden' });

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