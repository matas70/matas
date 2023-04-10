import { expect, Page } from "@playwright/test";

export async function loadApp(page: Page) {
    await page.goto('https://localhost:8080');
    await expect(page).toHaveURL('https://localhost:8080/#main');

    // wait loading to be finished
    await page.waitForSelector('.splash', { state: 'hidden' });
}

export function isMobile(page: Page) : boolean {
    return (page.viewportSize()?.width ?? 0) < 600;
}

// if mobile, open menu
export async function openMenu(page: Page) {
    if(isMobile(page)) {
        const menuSelector = '#menuHamburger';
        await page.click(menuSelector);
    }
}

