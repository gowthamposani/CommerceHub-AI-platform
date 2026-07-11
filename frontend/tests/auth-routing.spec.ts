import { expect, test } from "@playwright/test";

test.describe("Authentication routing", () => {
  test("redirects protected module routes to login when unauthenticated", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});
