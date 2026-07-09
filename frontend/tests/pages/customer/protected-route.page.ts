import { expect } from '@playwright/test';

import { CustomerBasePage } from './base.page';

export class CustomerProtectedRoutePage extends CustomerBasePage {
  async open(path: string): Promise<void> {
    await this.gotoPath(path);
  }

  async expectRedirectedToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
  }
}
