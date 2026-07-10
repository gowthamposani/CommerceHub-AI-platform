import { expect } from "@playwright/test";

import { CustomerBasePage } from "./base.page";
import { shortId } from "../../utils/customer-format.utility";

export class CustomerOrdersPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath("/orders");
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "Your order history" })).toBeVisible();
  }

  async expectOrder(orderId: string): Promise<void> {
    await expect(this.page.getByText(shortId(orderId, 12))).toBeVisible();
  }

  async openLatestOrder(): Promise<void> {
    await this.waitForPath("**/orders/*", async () =>
      this.page.getByRole("link", { name: "View details" }).first().click()
    );
  }
}
