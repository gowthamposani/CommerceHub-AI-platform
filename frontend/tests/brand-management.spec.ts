import { test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { BrandManagementPage, type BrandFixture } from "./pages/BrandManagementPage";

test.describe("Brand management integration", () => {
  test.skip(
    !process.env.E2E_BRAND_API_URL,
    "Set E2E_BRAND_API_URL and VITE_API_BASE_URL to run brand E2E tests against a real backend."
  );

  test("creates, edits, uploads logo preview, searches, filters, toggles, deletes, and verifies persistence", async ({
    page,
    request
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const fixture: BrandFixture = {
      brandName: `E2E Brand ${suffix}`,
      brandSlug: `e2e-brand-${suffix}`,
      updatedBrandName: `E2E Brand Updated ${suffix}`,
      updatedBrandSlug: `e2e-brand-updated-${suffix}`,
      country: "India",
      updatedCountry: "Japan"
    };
    const brandPage = new BrandManagementPage(page);

    await brandPage.createBrand(fixture);
    await brandPage.editBrand(fixture);
    await brandPage.verifyPersistedBrand(request, process.env.E2E_BRAND_API_URL ?? "", fixture);
    await brandPage.searchAndFilterBrand(fixture);
    await brandPage.deactivateAndActivateBrand();
    await brandPage.deleteBrand(fixture.updatedBrandName);
  });
});
