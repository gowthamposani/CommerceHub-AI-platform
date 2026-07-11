import { expect, test } from "@playwright/test";

test.describe("Seller dashboard frontend", () => {
  test("exposes seller dashboard navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /seller dashboard/i })).toBeVisible();
  });

  test.describe("real seller dashboard flow", () => {
    test.skip(
      !process.env.E2E_SELLER_ID,
      "Set E2E_SELLER_ID, VITE_SELLER_ID, and VITE_API_BASE_URL to run seller dashboard tests against a real backend."
    );

    test("loads dashboard sections from live APIs", async ({ page }) => {
      await page.goto("/seller-dashboard");
      await expect(page.getByRole("heading", { name: /seller dashboard/i })).toBeVisible();
      await expect(page.getByText(/product overview/i)).toBeVisible();
      await expect(page.getByText(/inventory overview/i)).toBeVisible();
      await expect(page.getByText(/warehouse operations/i)).toBeVisible();
      await expect(page.getByText(/operational alerts/i)).toBeVisible();
      await expect(page.getByText(/quick actions/i)).toBeVisible();
    });
  });
});
