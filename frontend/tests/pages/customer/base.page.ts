import type { Locator, Page } from '@playwright/test';

export abstract class CustomerBasePage {
  constructor(protected readonly page: Page) {}

  protected async gotoPath(path: string): Promise<void> {
    await this.page.goto(path);
  }

  protected link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  protected button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  protected field(label: string): Locator {
    return this.page.getByLabel(label);
  }

  protected async waitForPath(pathPattern: string | RegExp, action: () => Promise<void>): Promise<void> {
    await Promise.all([this.page.waitForURL(pathPattern), action()]);
  }
}
