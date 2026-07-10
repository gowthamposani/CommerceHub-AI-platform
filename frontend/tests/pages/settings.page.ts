import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoSettings() {
    await this.goto("/admin/settings");
  }

  async expectLoaded() {
    await this.expectHeading("Settings");
    await expect(this.page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "System Information", exact: true }),
    ).toBeVisible();
  }
}
