import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

test.describe("Product media management integration", () => {
  test.skip(
    !process.env.E2E_PRODUCT_ID,
    "Set E2E_PRODUCT_ID and VITE_API_BASE_URL to run product media E2E tests against a real backend product."
  );

  test("uploads, previews, marks primary, and deletes product media", async ({ page }) => {
    await page.goto(`/products/${process.env.E2E_PRODUCT_ID}`);
    await expect(page.getByRole("heading", { name: /product media/i })).toBeVisible();

    await page.locator('input[type="file"]').first().setInputFiles({
      name: "product-media.png",
      mimeType: "image/png",
      buffer: pngBytes
    });

    await expect(page.getByText(/product image uploaded/i)).toBeVisible();
    await expect(page.getByRole("img", { name: /product image/i }).first()).toBeVisible();

    const primaryButton = page.getByRole("button", { name: /mark primary image/i }).first();
    if (await primaryButton.isEnabled()) {
      await primaryButton.click();
      await expect(page.getByText(/primary image updated/i)).toBeVisible();
    }

    await page
      .getByRole("button", { name: /delete image/i })
      .first()
      .click();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText(/product image deleted/i)).toBeVisible();
  });
});
