import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { Buffer } from "node:buffer";

export interface BrandFixture {
  brandName: string;
  brandSlug: string;
  updatedBrandName: string;
  updatedBrandSlug: string;
  country: string;
  updatedCountry: string;
}

const logoOne = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#f5b82e"/><text x="40" y="45" text-anchor="middle" font-size="18" fill="#111827">B1</text></svg>'
);

const logoTwo = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#2563eb"/><text x="40" y="45" text-anchor="middle" font-size="18" fill="#ffffff">B2</text></svg>'
);

export class BrandManagementPage {
  constructor(private readonly page: Page) {}

  async openList() {
    await this.page.goto("/brands");
    await expect(this.page.getByRole("heading", { name: /brand management/i })).toBeVisible();
  }

  async openCreate() {
    await this.openList();
    await this.page
      .getByRole("link", { name: /create brand/i })
      .first()
      .click();
    await expect(this.page.getByRole("heading", { name: /create brand/i })).toBeVisible();
  }

  async createBrand(fixture: BrandFixture) {
    await this.openCreate();
    await this.fillBrandForm({
      brandName: fixture.brandName,
      brandSlug: fixture.brandSlug,
      website: "https://example.com",
      country: fixture.country,
      foundedYear: "2020",
      logoUrl: "https://example.com/brand-logo.png",
      description: "Brand created through the enterprise UI integration test."
    });
    await this.uploadLogoPreview("brand-logo-one.svg", logoOne);
    await expect(this.page.getByAltText("Brand logo preview")).toBeVisible();
    await this.uploadLogoPreview("brand-logo-two.svg", logoTwo);
    await expect(this.page.getByAltText("Brand logo preview")).toBeVisible();
    await this.page.getByRole("button", { name: /remove logo/i }).click();
    await expect(this.page.getByText("No logo selected")).toBeVisible();
    await this.page.getByLabel("Logo URL").fill("https://example.com/brand-logo-final.png");
    await this.page.getByRole("button", { name: /create brand/i }).click();
    await expect(this.page.getByRole("heading", { name: /brand details/i })).toBeVisible();
    await expect(this.page.getByText(fixture.brandName)).toBeVisible();
  }

  async editBrand(fixture: BrandFixture) {
    await this.page.getByRole("link", { name: /edit/i }).click();
    await expect(this.page.getByRole("heading", { name: /edit brand/i })).toBeVisible();
    await this.page.getByLabel("Brand Name").fill(fixture.updatedBrandName);
    await this.page.getByLabel("Brand Slug").fill(fixture.updatedBrandSlug);
    await this.page.getByLabel("Country of Origin").fill(fixture.updatedCountry);
    await this.page.getByRole("button", { name: /save changes/i }).click();
    await expect(this.page.getByRole("heading", { name: /brand details/i })).toBeVisible();
    await expect(this.page.getByText(fixture.updatedBrandName)).toBeVisible();
  }

  async searchAndFilterBrand(fixture: BrandFixture) {
    await this.openList();
    await this.page.getByPlaceholder("Search brands").fill(fixture.updatedBrandName);
    await expect(this.page.getByRole("cell", { name: fixture.updatedBrandName })).toBeVisible();
    await this.page.getByLabel("Filter by country").fill(fixture.updatedCountry);
    await expect(this.page.getByRole("cell", { name: fixture.updatedCountry })).toBeVisible();
    await this.page.getByLabel("Sort brands").selectOption("country_of_origin");
    await this.page.getByLabel("Sort direction").selectOption("asc");
    await expect(this.page.getByRole("cell", { name: fixture.updatedBrandName })).toBeVisible();
  }

  async deactivateAndActivateBrand() {
    await this.page.getByRole("button", { name: /deactivate brand/i }).click();
    await this.page.getByLabel("Filter by status").selectOption("inactive");
    await expect(this.page.getByText("inactive").first()).toBeVisible();
    await this.page.getByRole("button", { name: /activate brand/i }).click();
    await this.page.getByLabel("Filter by status").selectOption("active");
    await expect(this.page.getByText("active").first()).toBeVisible();
  }

  async deleteBrand(brandName: string) {
    await this.page.getByRole("button", { name: /delete brand/i }).click();
    await this.page.getByRole("button", { name: /^delete$/i }).click();
    await expect(this.page.getByText(brandName)).toBeHidden();
  }

  async verifyPersistedBrand(request: APIRequestContext, apiBaseUrl: string, fixture: BrandFixture) {
    const brandId = this.currentBrandId();
    const response = await request.get(`${apiBaseUrl}/brands/${brandId}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.brand_name).toBe(fixture.updatedBrandName);
    expect(body.data.brand_slug).toBe(fixture.updatedBrandSlug);
    expect(body.data.country_of_origin).toBe(fixture.updatedCountry);
  }

  currentBrandId() {
    const match = this.page.url().match(/\/brands\/([^/]+)$/);
    if (!match) {
      throw new Error(`Unable to resolve brand ID from ${this.page.url()}`);
    }
    return match[1];
  }

  private async fillBrandForm(values: {
    brandName: string;
    brandSlug: string;
    website: string;
    country: string;
    foundedYear: string;
    logoUrl: string;
    description: string;
  }) {
    await this.page.getByLabel("Brand Name").fill(values.brandName);
    await this.page.getByLabel("Brand Slug").fill(values.brandSlug);
    await this.page.getByLabel("Website").fill(values.website);
    await this.page.getByLabel("Country of Origin").fill(values.country);
    await this.page.getByLabel("Founded Year").fill(values.foundedYear);
    await this.page.getByLabel("Logo URL").fill(values.logoUrl);
    await this.page.getByLabel("Description").fill(values.description);
  }

  private async uploadLogoPreview(name: string, buffer: Buffer) {
    await this.page.locator('input[type="file"]').setInputFiles({
      name,
      mimeType: "image/svg+xml",
      buffer
    });
  }
}
