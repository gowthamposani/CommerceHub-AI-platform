import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Seller management integration", () => {
  test.skip(
    !process.env.E2E_SELLER_API_URL,
    "Set E2E_SELLER_API_URL and VITE_API_BASE_URL to run seller E2E tests against a real backend."
  );

  test("creates, updates, searches, filters, toggles, and deletes a seller", async ({ page }) => {
    const suffix = randomUUID().slice(0, 8);
    const taxSerial = String(Math.floor(Math.random() * 9000) + 1000);
    const businessName = `E2E Seller ${suffix}`;
    const updatedBusinessName = `E2E Seller Updated ${suffix}`;
    const email = `seller-${suffix}@example.com`;
    const gstNumber = `27EETST${taxSerial}F1Z5`;
    const panNumber = `EETST${taxSerial}F`;

    await page.goto("/sellers");
    await page
      .getByRole("link", { name: /create seller/i })
      .first()
      .click();

    await page.getByLabel("Auth User ID").fill(randomUUID());
    await page.getByLabel("Business Name").fill(businessName);
    await page.getByLabel("Legal Business Name").fill(`${businessName} Private Limited`);
    await page.getByLabel("Business Type").selectOption("private_limited");
    await page.getByLabel("Business Email").fill(email);
    await page.getByLabel("Business Phone").fill("+91 9876543210");
    await page.getByLabel("Website").fill("https://example.com");
    await page.getByLabel("Address Line 1").fill("123 Market Street");
    await page.getByLabel("City").fill("Mumbai");
    await page.getByLabel("State").fill("Maharashtra");
    await page.getByLabel("Country").fill("India");
    await page.getByLabel("Postal Code").fill("400001");
    await page.getByLabel("GST Number").fill(gstNumber);
    await page.getByLabel("PAN Number").fill(panNumber);
    await page.getByLabel("Account Holder Name").fill(businessName);
    await page.getByLabel("Bank Name").fill("Commerce Bank");
    await page.getByLabel("Account Number").fill("123456789012");
    await page.getByLabel("IFSC Code").fill("ABCD0123456");
    await page.getByRole("button", { name: /create seller/i }).click();

    await expect(page.getByRole("heading", { name: /seller profile/i })).toBeVisible();
    await expect(page.getByText(businessName)).toBeVisible();

    await page.getByRole("link", { name: /edit/i }).click();
    await page.getByLabel("Business Name").fill(updatedBusinessName);
    await page.getByRole("button", { name: /save changes/i }).click();

    await expect(page.getByRole("heading", { name: /seller profile/i })).toBeVisible();
    await expect(page.getByText(updatedBusinessName)).toBeVisible();

    await page.goto("/sellers");
    await page.getByPlaceholder("Search sellers").fill(updatedBusinessName);
    await expect(page.getByRole("cell", { name: updatedBusinessName })).toBeVisible();

    await page.getByLabel("Filter by status").selectOption("pending");
    await expect(page.getByRole("cell", { name: updatedBusinessName })).toBeVisible();

    await page.getByRole("button", { name: /deactivate seller/i }).click();
    await page.getByLabel("Filter by status").selectOption("inactive");
    await expect(page.getByText("inactive").first()).toBeVisible();

    await page.getByRole("button", { name: /activate seller/i }).click();
    await page.getByLabel("Filter by status").selectOption("active");
    await expect(page.getByText("active").first()).toBeVisible();

    await page.getByRole("button", { name: /delete seller/i }).click();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText(updatedBusinessName)).toBeHidden();
  });
});
