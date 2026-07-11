import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class AdminDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoDashboard() {
    await this.goto("/admin/dashboard");
  }

  async expectLoaded() {
    await this.expectHeading("Admin Dashboard");
    await expect(this.page.getByText("Generated at")).toBeVisible();
    await expect(this.page.getByText("Total Users")).toBeVisible();
    await expect(this.page.getByText("Latest Notifications")).toBeVisible();
  }

  async expectNetworkErrorState() {
    await expect(this.page.getByText("No dashboard data")).toBeVisible();
    await expect(this.page.getByText(/currently unavailable/i)).toBeVisible();
  }
}
