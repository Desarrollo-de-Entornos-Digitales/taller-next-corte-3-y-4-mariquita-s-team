import { expect, test } from '@playwright/test';

import { skipIfBackendUnavailable } from './helpers';

const HELP_PAGES = [
    { path: '/help', heading: 'How can we help you?' },
    { path: '/help/getting-started', heading: 'Getting Started' },
    { path: '/help/buying', heading: 'Buying Guide' },
    { path: '/help/selling', heading: 'Selling Guide' },
    { path: '/help/contact', heading: 'Contact Support' },
] as const;

test.describe('Help center', () => {
    test.beforeEach(async ({ request }) => {
        await skipIfBackendUnavailable(request);
    });

    for (const helpPage of HELP_PAGES) {
        test(`renders ${helpPage.path}`, async ({ page }) => {
            await page.goto(helpPage.path);
            await expect(page.getByRole('heading', { name: helpPage.heading })).toBeVisible();
        });
    }
});
