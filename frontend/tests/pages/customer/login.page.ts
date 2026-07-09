import { expect } from '@playwright/test';

import type { AuthLoginPayload } from '../../../src/types/domain';
import { CustomerBasePage } from './base.page';

export class CustomerLoginPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath('/login');
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(this.field('Email')).toBeVisible();
    await expect(this.field('Password')).toBeVisible();
    await expect(this.page.getByLabel('Remember me on this device')).toBeVisible();
  }

  async login(payload: AuthLoginPayload, rememberMe = true): Promise<void> {
    await this.submitLogin(payload, rememberMe);

    await this.waitForPath('**/home', async () => this.button('Login').click());
  }

  async submitLogin(payload: AuthLoginPayload, rememberMe = true): Promise<void> {
    await this.field('Email').fill(payload.email);
    await this.field('Password').fill(payload.password);

    const rememberMeCheckbox = this.page.getByLabel('Remember me on this device');
    if (rememberMe) {
      await rememberMeCheckbox.check();
    } else {
      await rememberMeCheckbox.uncheck();
    }

    await this.button('Login').click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message, { exact: false })).toBeVisible();
  }
}
