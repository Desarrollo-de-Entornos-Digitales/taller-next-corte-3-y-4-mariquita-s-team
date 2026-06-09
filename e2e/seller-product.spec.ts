import { expect, test } from '@playwright/test';

import { loginAsSeller, skipIfBackendUnavailable } from './helpers';

test.describe('Seller product publishing', () => {
    test.beforeEach(async ({ request }) => {
        await skipIfBackendUnavailable(request);
    });

    test('seller can open new product form', async ({ page }) => {
        await loginAsSeller(page);

        await page.getByTestId('post-product-link').click();
        await expect(page).toHaveURL('/productos/nuevo');
        await expect(page.getByTestId('new-product-form')).toBeVisible();
    });

    test('validates required fields on publish', async ({ page }) => {
        await loginAsSeller(page);

        await page.goto('/productos/nuevo');
        await page.getByLabel('Product title').fill('Test listing');
        await page
            .getByPlaceholder('Describe condition, origin, weight, delivery, and any relevant details...')
            .fill('short');
        await page.getByLabel('Price (COP)').fill('1000');
        await page.getByRole('button', { name: 'Publish product' }).click();

        await expect(page.getByText('Description must be at least 10 characters.')).toBeVisible();
    });
});
