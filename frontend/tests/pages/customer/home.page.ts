import { expect } from '@playwright/test';

import { CustomerBasePage } from './base.page';

export class CustomerHomePage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/home');
  }

  async expectWelcome(fullName: string): Promise<void> {
    await expect(this.page.locator('h1').filter({ hasText: `Welcome back, ${fullName}` })).toBeVisible();
  }
}
