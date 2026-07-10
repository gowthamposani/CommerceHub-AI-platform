import { expect, test } from "@playwright/test";

import { seedAuthenticatedSession } from "./authTestUtils";

test.describe("Inventory management integration", () => {
  test("opens inventory dashboard shell", async ({ page }) => {
    await seedAuthenticatedSession(page);
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /inventory management/i })).toBeVisible();
    await expect(page.getByText(/total stock units/i)).toBeVisible();
  });

  test.describe("real inventory record flow", () => {
    test.skip(
      !process.env.E2E_INVENTORY_ID,
      "Set E2E_INVENTORY_ID and VITE_API_BASE_URL to run inventory update flow against a real backend record."
    );

    test("loads details and opens stock update workflows", async ({ page }) => {
      await seedAuthenticatedSession(page);
      await page.goto(`/inventory/${process.env.E2E_INVENTORY_ID}`);
      await expect(page.getByRole("heading", { name: /inventory details/i })).toBeVisible();
      await expect(page.getByText(/inventory history/i)).toBeVisible();

      await page
        .getByRole("button", { name: /add stock/i })
        .first()
        .click();
      await expect(page.getByRole("heading", { name: /add stock/i })).toBeVisible();
      await page.getByRole("button", { name: /close modal/i }).click();

      await page
        .getByRole("button", { name: /remove stock/i })
        .first()
        .click();
      await expect(page.getByRole("heading", { name: /remove stock/i })).toBeVisible();
    });
  });
});
