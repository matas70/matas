import { test, expect } from '@playwright/test';
test('see aircraft details', async ({ page }) => {
    await page.goto('https://localhost:8080');
    await expect(page).toHaveURL('https://localhost:8080/#main');

    // wait loading to be finished
    await page.waitForSelector('.splash', { state: 'hidden' });

    // if mobile, open menu
    if((page.viewportSize()?.width ?? 0) < 600) {
        const menuSelector = '#menuHamburger';
        await page.click(menuSelector);
    }

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