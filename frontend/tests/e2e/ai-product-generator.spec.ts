import { enterpriseTest as test, expect } from "../fixtures/test";
import { mockAIProductDescriptionFailure } from "../utils/api-mocks";

test.describe("AI Product Description Generator", () => {
  test("generates product content from valid input", async ({ aiProductGeneratorPage }) => {
    await aiProductGeneratorPage.gotoGenerator();
    await aiProductGeneratorPage.expectLoaded();
    await aiProductGeneratorPage.fillProductForm();
    await aiProductGeneratorPage.submit();

    await aiProductGeneratorPage.expectLoadingState();
    await aiProductGeneratorPage.expectSuccessfulResponse();
  });

  test("validates required product fields", async ({ aiProductGeneratorPage, page }) => {
    await aiProductGeneratorPage.gotoGenerator();
    await page.getByRole("button", { name: "Generate" }).click();

    await expect(page.getByText("Product name is required.")).toBeVisible();
    await expect(page.getByText("Brand is required.")).toBeVisible();
    await expect(page.getByText("Category is required.")).toBeVisible();
    await expect(page.getByText("At least one feature is required.")).toBeVisible();
  });

  test("shows enterprise error handling when generation fails", async ({
    aiProductGeneratorPage,
    page,
  }) => {
    await mockAIProductDescriptionFailure(page);
    await aiProductGeneratorPage.gotoGenerator();
    await aiProductGeneratorPage.fillProductForm();
    await aiProductGeneratorPage.submit();

    await aiProductGeneratorPage.expectErrorResponse();
  });
});
