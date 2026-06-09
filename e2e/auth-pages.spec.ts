import { expect, test } from '@playwright/test';

test.describe('Public auth pages', () => {
    test('login page renders sign-in form', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Welcome Back!' })).toBeVisible();
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('register page renders sign-up form', async ({ page }) => {
        await page.goto('/registro');
        await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
        await expect(page.getByLabel('Email Address')).toBeVisible();
    });

    test('forgot password page renders recovery form', async ({ page }) => {
        await page.goto('/forgot-password');
        await expect(page.getByRole('heading', { name: 'Forgotten your password?' })).toBeVisible();
        await expect(page.getByLabel('Email Address')).toBeVisible();
    });

    test('register page links to login', async ({ page }) => {
        await page.goto('/registro');
        await page.getByRole('link', { name: 'Log in' }).click();
        await expect(page).toHaveURL('/login');
    });
});
