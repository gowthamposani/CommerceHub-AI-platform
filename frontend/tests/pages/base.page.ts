import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole("heading", { name });
  }

  async expectHeading(name: string | RegExp) {
    await expect(this.heading(name)).toBeVisible();
  }
}
