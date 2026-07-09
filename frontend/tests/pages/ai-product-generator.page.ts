import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class AIProductGeneratorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoGenerator() {
    await this.goto("/admin/ai-tools");
  }

  async expectLoaded() {
    await this.expectHeading("AI Tools");
    await expect(this.page.getByRole("heading", { name: "Product Inputs" })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Generated Output" })).toBeVisible();
  }

  async fillProductForm() {
    await this.page.getByLabel("Product Name").fill("Smart Speaker");
    await this.page.getByLabel("Brand").fill("CommerceHub");
    await this.page.getByLabel("Category").fill("Electronics");
    await this.page.getByLabel("Features").fill("Room-filling sound\nVoice assistant ready");
    await this.page.getByPlaceholder("Name").first().fill("Connectivity");
    await this.page.getByPlaceholder("Value").first().fill("Wi-Fi");
  }

  async submit() {
    await this.page.getByRole("button", { name: "Generate" }).click();
  }

  async expectLoadingState() {
    await expect(this.page.getByRole("button", { name: "Generating" })).toBeDisabled();
    await expect(this.page.getByText("Generating with Gemini")).toBeVisible();
  }

  async expectSuccessfulResponse() {
    await expect(this.page.getByRole("heading", { name: "Title", exact: true })).toBeVisible();
    await expect(this.page.getByText("CommerceHub Smart Speaker").first()).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Professional Description" })).toBeVisible();
    await expect(this.page.getByText("smart speaker", { exact: true })).toBeVisible();
  }

  async expectErrorResponse() {
    await expect(this.page.getByRole("alert")).toContainText("Unable to generate product content");
    await expect(this.page.getByRole("alert")).toContainText("AI provider unavailable");
  }
}
