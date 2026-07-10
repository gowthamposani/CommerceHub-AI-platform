import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class AnalyticsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoAnalytics() {
    await this.goto("/admin/analytics");
  }

  async expectLoaded() {
    await this.expectHeading("Analytics");
    await expect(this.page.getByRole("heading", { name: "Monthly Revenue" })).toBeVisible();
    await expect(this.page.getByText("Best Category", { exact: true })).toBeVisible();
  }
}
