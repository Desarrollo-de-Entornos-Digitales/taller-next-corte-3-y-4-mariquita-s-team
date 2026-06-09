import { expect, test } from '@playwright/test';

import { skipIfBackendUnavailable } from './helpers';

test.describe('Marketplace feed', () => {
    test.beforeEach(async ({ request }) => {
        await skipIfBackendUnavailable(request);
    });

    test('shows product grid and pagination', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { name: 'Featured Post' })).toBeVisible();
        await expect(page.getByTestId('product-grid')).toBeVisible({ timeout: 15_000 });

        const cards = page.locator('[data-testid^="product-card-"]');
        await expect(cards.first()).toBeVisible();

        const nextButton = page.getByTestId('pagination-next');
        if (await nextButton.isEnabled()) {
            await nextButton.click();
            await expect(page.getByText('Page 2')).toBeVisible();
        }
    });

    test('search bar filters products', async ({ page }) => {
        await page.goto('/');

        const searchInput = page.getByTestId('navbar-search-input');
        await searchInput.click();
        await searchInput.pressSequentially('tractor');
        await page.locator('form').filter({ has: searchInput }).getByRole('button', { name: 'Search' }).click();

        await expect(page).toHaveURL(/\?q=tractor/, { timeout: 10_000 });
        await expect(page.getByText('Results for:')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('heading', { name: /tractor/i }).first()).toBeVisible({ timeout: 10_000 });
    });

    test('category filters update the feed', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByTestId('category-filters')).toBeVisible({ timeout: 15_000 });
        await page.getByRole('button', { name: 'Livestock' }).click();
        await expect(page.getByTestId('product-grid')).toBeVisible();
        await expect(page.getByText('Livestock', { exact: false }).first()).toBeVisible({ timeout: 10_000 });
    });

    test('navigates to product detail', async ({ page }) => {
        await page.goto('/');

        const firstCard = page.locator('[data-testid^="product-card-"]').first();
        await expect(firstCard).toBeVisible({ timeout: 15_000 });
        await firstCard.click();

        await expect(page.getByTestId('product-detail')).toBeVisible();
        await expect(page.getByTestId('add-to-cart-button')).toBeVisible();
    });
});
