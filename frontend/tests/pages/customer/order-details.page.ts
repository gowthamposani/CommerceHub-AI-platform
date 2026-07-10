import { expect } from "@playwright/test";

import { CustomerBasePage } from "./base.page";
import { shortId } from "../../utils/customer-format.utility";

export class CustomerOrderDetailsPage extends CustomerBasePage {
  async expectVisible(orderId: string): Promise<void> {
    await expect(this.page.locator("h1").filter({ hasText: `Order ${shortId(orderId, 12)}` })).toBeVisible();
  }

  async expectStatus(statusLabel: string): Promise<void> {
    await expect(this.page.getByText(statusLabel, { exact: true }).first()).toBeVisible();
  }
}
