import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class NotificationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoNotifications() {
    await this.goto("/admin/notifications");
  }

  async expectLoaded() {
    await this.expectHeading("Notifications");
    await expect(this.page.getByRole("heading", { name: "Send Notification" })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Templates" })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Notification History" })).toBeVisible();
  }
}
