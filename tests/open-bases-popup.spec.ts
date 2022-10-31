import test, { expect } from "@playwright/test";

test.describe("Open Bases Popup", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("https://127.0.0.1:8080/#main");
    });

    test('popup opens', async ({ page }) => {
        const popup = page.locator('.open-bases-popup');

        await expect(popup).not.toBeVisible();
        await page.click('.base-category-container');
        await expect(popup).toBeVisible();

    });

    test('baseName has hebrew text', async ({ page }) => {
        const popup = page.locator('.open-bases-popup');
        const baseName = page.locator('#baseName');

        await page.click('.base-category-container');
        await expect(popup).toBeVisible();
        await expect(baseName).toBeVisible();
        await expect(baseName).toHaveText(/[\u0590-\u05FF \w]/);
    });

});