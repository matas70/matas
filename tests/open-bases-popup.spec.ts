import test, { expect } from "@playwright/test";
import { loadApp, openMenu } from "./common";

test.describe("Open Bases Popup", () => {

    test.beforeEach(async ({ page }) => {
        await loadApp(page);
        await openMenu(page); // if mobile
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