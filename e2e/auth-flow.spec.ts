import { expect, test } from '@playwright/test';

import { CREDENTIALS, loginAsBuyer, skipIfBackendUnavailable } from './helpers';

test.describe('Authentication and protected flows', () => {
    test.beforeEach(async ({ request }) => {
        await skipIfBackendUnavailable(request);
    });

    test('buyer can log in and open profile', async ({ page }) => {
        await loginAsBuyer(page);

        await page.getByTestId('navbar-profile-link').click();
        await expect(page).toHaveURL('/perfil');
        await expect(page.getByRole('heading', { name: CREDENTIALS.buyer.username })).toBeVisible();
    });

    test('buyer can log out from navbar', async ({ page }) => {
        await loginAsBuyer(page);

        await page.getByTestId('navbar-logout-button').click();
        await expect(page).toHaveURL('/login', { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: 'Welcome Back!' })).toBeVisible();
    });

    test('buyer can complete checkout and open order tracking', async ({ page }) => {
        await loginAsBuyer(page);

        await page.goto('/productos/1');
        await page.getByTestId('add-to-cart-button').click();
        await page.goto('/carrito');
        await page.getByTestId('cart-checkout-button').click();
        await expect(page).toHaveURL(/\/pago\/simulado/);

        await page.getByTestId('checkout-continue-button').click();

        await page.getByLabel('Recipient full name').fill('Buyer Test');
        await page.getByLabel('Delivery address').fill('Calle 10 #20-30');
        await page.getByLabel('City').fill('Tunja');
        await page.getByLabel('Contact phone').fill('3001234567');
        await page.getByTestId('checkout-continue-button').click();

        await page.getByTestId('payment-method-pse').click();
        await page.getByTestId('checkout-continue-button').click();

        await page.getByLabel('Document number').fill('1234567890');
        await page.getByLabel('Email for PSE receipt').fill('buyer1@vincobov.com');
        await page.getByTestId('checkout-continue-button').click();

        await page.getByTestId('checkout-pay-button').click();

        await expect(page).toHaveURL(/\/pedidos\/\d+\/seguimiento/, { timeout: 20_000 });
        await expect(page.getByTestId('order-tracking')).toBeVisible();
        await expect(page.getByTestId('shipping-timeline')).toBeVisible();
    });

    test('guest can open cart page', async ({ page }) => {
        await page.goto('/carrito');
        await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();
    });
});
