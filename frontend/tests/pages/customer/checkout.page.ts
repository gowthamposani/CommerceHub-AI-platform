import { expect } from '@playwright/test';

import { CustomerBasePage } from './base.page';

export class CustomerCheckoutPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/checkout');
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Review and place your order' })).toBeVisible();
  }

  async fillPaymentReference(paymentReference: string): Promise<void> {
    await this.field('Payment reference').fill(paymentReference);
  }

  async selectFirstAddressIfAvailable(): Promise<void> {
    const shippingAddress = this.page.getByLabel('Shipping address');
    if ((await shippingAddress.count()) > 0) {
      await shippingAddress.selectOption({ index: 0 });
    }
  }

  async placeOrder(paymentReference: string): Promise<string> {
    await this.fillPaymentReference(paymentReference);
    await this.selectFirstAddressIfAvailable();

    await this.waitForPath('**/orders/*', async () => this.button('Place order').click());

    const pathname = new URL(this.page.url()).pathname;
    const orderId = pathname.split('/').filter(Boolean).pop();

    if (!orderId) {
      throw new Error('Order id was not present in the checkout redirect URL.');
    }

    return orderId;
  }
}
