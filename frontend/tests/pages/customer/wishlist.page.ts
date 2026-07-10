import { expect, type Locator } from "@playwright/test";

import { CustomerBasePage } from "./base.page";

export class CustomerWishlistPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath("/wishlist");
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "Items you saved for later" })).toBeVisible();
  }

  private productCard(title: string): Locator {
    return this.page
      .locator("div.overflow-hidden")
      .filter({ has: this.page.getByRole("heading", { level: 3, name: title, exact: true }) })
      .first();
  }

  async expectItem(title: string): Promise<void> {
    await expect(this.page.getByRole("heading", { level: 3, name: title, exact: true })).toBeVisible();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.page.getByText("Your wishlist is empty")).toBeVisible();
  }

  async moveItemToCart(title: string): Promise<void> {
    const card = this.productCard(title);

    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes("/move-to-cart") && response.request().method() === "POST"
      ),
      card.getByRole("button", { name: "Move to cart" }).click()
    ]);
  }

  async removeItem(title: string): Promise<void> {
    const card = this.productCard(title);

    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes("/api/v1/wishlist/") && response.request().method() === "DELETE"
      ),
      card.getByRole("button", { name: "Remove" }).click()
    ]);
  }
}
