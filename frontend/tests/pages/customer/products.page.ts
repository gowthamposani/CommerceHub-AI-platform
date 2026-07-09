import { expect, type Locator } from '@playwright/test';

import type { ProductSnapshot } from '../../types/customer.types';
import { CustomerBasePage } from './base.page';

export class CustomerProductsPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/products');
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Browse the customer catalog' })).toBeVisible();
    await expect(this.page.getByRole('heading', { level: 3 }).first()).toBeVisible();
  }

  private productCard(title: string): Locator {
    return this.page
      .locator('div.overflow-hidden')
      .filter({ has: this.page.getByRole('heading', { level: 3, name: title, exact: true }) })
      .first();
  }

  private async readProductSnapshot(titleHint?: string): Promise<ProductSnapshot> {
    const preferredHeading = titleHint
      ? this.page.getByRole('heading', { level: 3, name: titleHint, exact: true })
      : null;
    const heading = preferredHeading && (await preferredHeading.count()) > 0
      ? preferredHeading.first()
      : this.page.getByRole('heading', { level: 3 }).first();

    if ((await heading.count()) === 0) {
      throw new Error('No products are visible on the catalog page.');
    }

    const title = (await heading.textContent())?.trim();
    const link = heading.locator('xpath=ancestor::a[1]');
    const href = (await link.getAttribute('href')) ?? '';
    const normalizedHref = href.split('?')[0].replace(/\/+$/, '');
    const id = normalizedHref.slice(normalizedHref.lastIndexOf('/') + 1);

    return {
      id,
      title: title ?? titleHint ?? 'Unknown product',
      href,
    };
  }

  async openPreferredProduct(titleHint?: string): Promise<ProductSnapshot> {
    const snapshot = await this.readProductSnapshot(titleHint);
    const productCard = this.productCard(snapshot.title);

    await this.waitForPath('**/products/*', async () => productCard.getByRole('link', { name: 'View' }).click());

    return snapshot;
  }
}
