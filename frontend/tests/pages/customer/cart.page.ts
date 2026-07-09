import { expect, type Locator } from '@playwright/test';

import type { CartSummaryExpectation } from '../../types/customer.types';
import { CustomerBasePage } from './base.page';

export class CustomerCartPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/cart');
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Review your items before checkout' })).toBeVisible();
  }

  private itemCard(title: string): Locator {
    return this.page
      .getByRole('heading', { name: title, exact: true })
      .locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]');
  }

  private summaryRows(): Locator {
    return this.page
      .getByRole('heading', { name: 'Order total' })
      .locator('xpath=ancestor::div[contains(@class,"p-6")][1]')
      .locator('div.flex.items-center.justify-between');
  }

  async expectItem(title: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }

  async expectSummaryTotals(expected: CartSummaryExpectation): Promise<void> {
    const rows = this.summaryRows();
    await expect(rows.nth(0)).toContainText(String(expected.itemCount));
    await expect(rows.nth(1)).toContainText(String(expected.totalQuantity));

    if (expected.subtotalText) {
      await expect(rows.nth(2)).toContainText(expected.subtotalText);
    }

    if (expected.grandTotalText) {
      await expect(rows.nth(3)).toContainText(expected.grandTotalText);
    }
  }

  async proceedToCheckout(): Promise<void> {
    await this.waitForPath('**/checkout', async () => this.link('Proceed to checkout').click());
  }

  async removeItem(title: string): Promise<void> {
    const card = this.itemCard(title);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/v1/cart/items/') && response.request().method() === 'DELETE'),
      card.getByRole('button', { name: 'Remove' }).click(),
    ]);
  }
}
