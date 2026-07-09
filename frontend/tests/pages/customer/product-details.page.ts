import { expect } from '@playwright/test';

import type { ProductSnapshot } from '../../types/customer.types';
import { CustomerBasePage } from './base.page';

export class CustomerProductDetailsPage extends CustomerBasePage {
  async expectVisible(product: ProductSnapshot): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: product.title })).toBeVisible();
    await expect(this.page.getByText(product.id)).toBeVisible();
  }

  async readPriceText(): Promise<string> {
    const priceValue = this.page.getByText('Price', { exact: true }).locator('xpath=following-sibling::p[1]');
    return (await priceValue.textContent())?.trim() ?? '';
  }

  async readProductId(): Promise<string> {
    const productCard = this.page.getByText('Product ID:').locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    const productId = await productCard.textContent();
    return productId?.replace('Product ID:', '').trim() ?? '';
  }

  async addToWishlist(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/v1/wishlist') && response.request().method() === 'POST'),
      this.button('Wishlist').click(),
    ]);
  }

  async addToCart(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/v1/cart') && response.request().method() === 'POST'),
      this.button('Add to cart').click(),
    ]);
  }
}
