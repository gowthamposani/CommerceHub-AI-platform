import { expect, test } from "@playwright/test";

test.describe("Product variants and metadata integration", () => {
  test.skip(
    !process.env.E2E_PRODUCT_ID,
    "Set E2E_PRODUCT_ID and VITE_API_BASE_URL to run product extension E2E tests against a real backend product."
  );

  test("manages attributes, variants, tags, specifications, SEO, and preview", async ({ page }) => {
    await page.goto(`/products/${process.env.E2E_PRODUCT_ID}`);
    await expect(page.getByRole("heading", { name: /product configuration/i })).toBeVisible();

    await page.getByRole("button", { name: "Attributes" }).click();
    await page.getByLabel("Attribute Name").fill(`Color ${Date.now()}`);
    await page.getByLabel("Allowed Values").fill("Red, Blue");
    await page.getByRole("button", { name: /add attribute/i }).click();
    await expect(page.getByText(/product attribute saved/i)).toBeVisible();

    await page.getByRole("button", { name: "Variants" }).click();
    await page.getByLabel("SKU").fill(`E2E-VAR-${Date.now()}`);
    await page.getByLabel("Barcode").fill(`E2EVAR${Date.now()}`);
    await page.getByLabel("Price").fill("1299.00");
    await page.getByLabel("Variant status").selectOption("active");
    await page.getByRole("button", { name: /add variant/i }).click();
    await expect(page.getByText(/product variant saved/i)).toBeVisible();

    await page.getByRole("button", { name: "Tags" }).click();
    await page.getByPlaceholder("New Arrival").fill(`Premium ${Date.now()}`);
    await page.getByRole("button", { name: /add tag/i }).click();
    await expect(page.getByText(/product tag saved/i)).toBeVisible();

    await page.getByRole("button", { name: "Specifications" }).click();
    await page.getByPlaceholder("Display").fill("Display");
    await page.getByPlaceholder("Screen Size").fill(`Screen ${Date.now()}`);
    await page.getByPlaceholder("6.7 inch").fill("6.7 inch");
    await page.getByRole("button", { name: /add specification/i }).click();
    await expect(page.getByText(/product specification saved/i)).toBeVisible();

    await page.getByRole("button", { name: "SEO" }).click();
    await page.getByLabel("SEO Title").fill(`SEO Product ${Date.now()}`);
    await page.getByLabel("Meta Robots").fill("index,follow");
    await page.getByRole("button", { name: /save seo metadata/i }).click();
    await expect(page.getByText(/product seo metadata saved/i)).toBeVisible();

    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByText(/product preview metadata/i)).toBeVisible();
  });
});
