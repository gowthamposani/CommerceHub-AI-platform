import { expect } from '@playwright/test';

import { CustomerBasePage } from './base.page';

export class CustomerNavigationPage extends CustomerBasePage {
  async expectVisible(): Promise<void> {
    await expect(this.link('Home')).toBeVisible();
    await expect(this.link('Products')).toBeVisible();
    await expect(this.link('Wishlist')).toBeVisible();
    await expect(this.link('Cart')).toBeVisible();
    await expect(this.link('Orders')).toBeVisible();
    await expect(this.link('Profile')).toBeVisible();
    await expect(this.link('Addresses')).toBeVisible();
    await expect(this.link('Checkout')).toBeVisible();
    await expect(this.button('Logout')).toBeVisible();
  }

  async goToHome(): Promise<void> {
    await this.waitForPath('**/home', async () => this.link('Home').click());
  }

  async goToProducts(): Promise<void> {
    await this.waitForPath('**/products', async () => this.link('Products').click());
  }

  async goToWishlist(): Promise<void> {
    await this.waitForPath('**/wishlist', async () => this.link('Wishlist').click());
  }

  async goToCart(): Promise<void> {
    await this.waitForPath('**/cart', async () => this.link('Cart').click());
  }

  async goToOrders(): Promise<void> {
    await this.waitForPath('**/orders', async () => this.link('Orders').click());
  }

  async goToCheckout(): Promise<void> {
    await this.waitForPath('**/checkout', async () => this.link('Checkout').first().click());
  }

  async logout(): Promise<void> {
    await this.waitForPath('**/login', async () => this.button('Logout').click());
  }
}
