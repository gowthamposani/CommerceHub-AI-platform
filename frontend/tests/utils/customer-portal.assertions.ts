import { expect, type Page } from '@playwright/test';

import type { CartSummaryExpectation } from '../types/customer.types';
import { shortId } from './customer-format.utility';

export class CustomerPortalAssertions {
  static async expectAuthenticatedShell(page: Page): Promise<void> {
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  }

  static async expectPublicAuthScreen(page: Page): Promise<void> {
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  }

  static async expectCartSummary(page: Page, expected: CartSummaryExpectation): Promise<void> {
    const summaryRows = page
      .getByRole('heading', { name: 'Order total' })
      .locator('xpath=ancestor::div[contains(@class,"p-6")][1]')
      .locator('div.flex.items-center.justify-between');

    await expect(summaryRows.nth(0)).toContainText(String(expected.itemCount));
    await expect(summaryRows.nth(1)).toContainText(String(expected.totalQuantity));

    if (expected.subtotalText) {
      await expect(summaryRows.nth(2)).toContainText(expected.subtotalText);
    }

    if (expected.grandTotalText) {
      await expect(summaryRows.nth(3)).toContainText(expected.grandTotalText);
    }
  }

  static async expectProductRoute(page: Page, productTitle: string, productId: string): Promise<void> {
    await expect(page.locator('h1').filter({ hasText: productTitle })).toBeVisible();
    await expect(page.getByText(productId)).toBeVisible();
  }

  static async expectWishlistCard(page: Page, productTitle: string): Promise<void> {
    await expect(page.getByRole('heading', { level: 3, name: productTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move to cart' })).toBeVisible();
  }

  static async expectOrderListed(page: Page, orderId: string): Promise<void> {
    await expect(page.getByText(shortId(orderId, 12))).toBeVisible();
  }
}
