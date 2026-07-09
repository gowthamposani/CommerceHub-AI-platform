import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Category management integration", () => {
  test.skip(
    !process.env.E2E_CATEGORY_API_URL,
    "Set E2E_CATEGORY_API_URL and VITE_API_BASE_URL to run category E2E tests against a real backend."
  );

  test("creates parent and child categories, updates, filters, toggles, deletes, and verifies tree UI", async ({
    page
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const parentName = `E2E Parent ${suffix}`;
    const parentSlug = `e2e-parent-${suffix}`;
    const childName = `E2E Child ${suffix}`;
    const childSlug = `e2e-child-${suffix}`;
    const updatedChildName = `E2E Child Updated ${suffix}`;
    const updatedChildSlug = `e2e-child-updated-${suffix}`;

    await page.goto("/categories");
    await page
      .getByRole("link", { name: /create category/i })
      .first()
      .click();

    await page.getByLabel("Category Name").fill(parentName);
    await page.getByLabel("Category Slug").fill(parentSlug);
    await page.getByLabel("Description").fill("Parent category created through the UI integration test.");
    await page.getByLabel("Image URL").fill("https://example.com/category.png");
    await page.getByLabel("Display Order").fill("1");
    await page.getByRole("button", { name: /create category/i }).click();

    await expect(page.getByRole("heading", { name: /category details/i })).toBeVisible();
    await expect(page.getByText(parentName)).toBeVisible();

    await page.goto("/categories/new");
    await page.getByLabel("Parent Category").selectOption({ label: parentName });
    await page.getByLabel("Category Name").fill(childName);
    await page.getByLabel("Category Slug").fill(childSlug);
    await page.getByLabel("Description").fill("Child category created through the UI integration test.");
    await page.getByLabel("Display Order").fill("2");
    await page.getByRole("button", { name: /create category/i }).click();

    await expect(page.getByRole("heading", { name: /category details/i })).toBeVisible();
    await expect(page.getByText(childName)).toBeVisible();

    await page.getByRole("link", { name: /edit/i }).click();
    await page.getByLabel("Category Name").fill(updatedChildName);
    await page.getByLabel("Category Slug").fill(updatedChildSlug);
    await page.getByRole("button", { name: /save changes/i }).click();

    await expect(page.getByRole("heading", { name: /category details/i })).toBeVisible();
    await expect(page.getByText(updatedChildName)).toBeVisible();

    await page.goto("/categories");
    await expect(page.getByText(parentName).first()).toBeVisible();
    await expect(page.getByText(updatedChildName).first()).toBeVisible();

    await page
      .getByRole("button", { name: /collapse category/i })
      .first()
      .click();
    await expect(page.getByText(updatedChildName).first()).toBeHidden();
    await page
      .getByRole("button", { name: /expand category/i })
      .first()
      .click();
    await expect(page.getByText(updatedChildName).first()).toBeVisible();

    await page.getByPlaceholder("Search categories").fill(updatedChildName);
    await expect(page.getByRole("cell", { name: updatedChildName })).toBeVisible();

    await page.getByLabel("Filter by status").selectOption("active");
    await expect(page.getByRole("cell", { name: updatedChildName })).toBeVisible();

    await page.getByRole("button", { name: /deactivate category/i }).click();
    await page.getByLabel("Filter by status").selectOption("inactive");
    await expect(page.getByText("inactive").first()).toBeVisible();

    await page.getByRole("button", { name: /activate category/i }).click();
    await page.getByLabel("Filter by status").selectOption("active");
    await expect(page.getByText("active").first()).toBeVisible();

    await page.getByRole("button", { name: /delete category/i }).click();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText(updatedChildName)).toBeHidden();
  });
});
