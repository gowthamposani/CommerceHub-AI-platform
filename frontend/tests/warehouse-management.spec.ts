import { expect, test } from "@playwright/test";

import { seedAuthenticatedSession } from "./authTestUtils";

test.describe("Warehouse management frontend", () => {
  test("opens warehouse management shell", async ({ page }) => {
    await seedAuthenticatedSession(page);
    await page.goto("/warehouses");
    await expect(page.getByRole("heading", { name: /warehouse management/i })).toBeVisible();
    await expect(page.getByText(/total warehouses/i)).toBeVisible();
  });

  test.describe("real warehouse flow", () => {
    test.skip(
      !process.env.E2E_WAREHOUSE_ID,
      "Set E2E_WAREHOUSE_ID and VITE_API_BASE_URL to run warehouse detail tests against a real backend warehouse."
    );

    test("loads detail, inventory, capacity, and activity views", async ({ page }) => {
      await seedAuthenticatedSession(page);
      await page.goto(`/warehouses/${process.env.E2E_WAREHOUSE_ID}`);
      await expect(page.getByRole("heading", { name: /warehouse details/i })).toBeVisible();

      await page.getByRole("link", { name: /inventory/i }).click();
      await expect(page.getByRole("heading", { name: /warehouse inventory/i })).toBeVisible();

      await page.goto(`/warehouses/${process.env.E2E_WAREHOUSE_ID}/capacity`);
      await expect(page.getByRole("heading", { name: /warehouse capacity/i })).toBeVisible();

      await page.goto(`/warehouses/${process.env.E2E_WAREHOUSE_ID}/activity`);
      await expect(page.getByRole("heading", { name: /warehouse activity/i })).toBeVisible();
    });
  });
});
