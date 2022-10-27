import { test, expect } from '@playwright/test';

test('the quiz starts when pressing the quiz button', async ({ page }) => {
   
    await page.goto('https://127.0.0.1:8080/#main');

    // create a quiz button locator
    const quizEnter = page.locator('.quiz.button');
    const quiz = page.locator('#quiz');

    // Expect an element to be visible.
    await expect(quizEnter).toBeVisible();
    // await expect(quiz).not.toBeVisible();


    // Click the get started link.
    await quizEnter.click();
    // await expect(quizEnter).not.toBeVisible();
    await expect(quiz).toBeVisible();

    await expect(page.locator('#quiz .question-cluster')).toBeVisible();
    await expect(page.locator('#quiz .question-cluster .option')).toHaveCount(3);
    await expect(page.locator('#quiz .counter .current')).toHaveText('1');
    await expect(page.locator('#quiz .counter .total')).toHaveText('5');




});
