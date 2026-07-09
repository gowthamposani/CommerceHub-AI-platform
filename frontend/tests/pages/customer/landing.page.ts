import { expect } from '@playwright/test';

import { CustomerBasePage } from './base.page';

export class CustomerLandingPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/');
  }

  async expectVisible(): Promise<void> {
    await expect(this.link('Get started')).toBeVisible();
    await expect(this.link('Sign in')).toBeVisible();
    await expect(this.link('Explore products')).toBeVisible();
  }

  async clickGetStarted(): Promise<void> {
    await this.waitForPath('**/register', async () => this.link('Get started').click());
  }

  async clickSignIn(): Promise<void> {
    await this.waitForPath('**/login', async () => this.link('Sign in').click());
  }

  async clickExploreProducts(): Promise<void> {
    await this.waitForPath('**/products', async () => this.link('Explore products').click());
  }
}
