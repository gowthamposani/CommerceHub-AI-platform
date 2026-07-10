import { expect, type Page } from "@playwright/test";

export class AdminLayoutPage {
  constructor(private readonly page: Page) {}

  navLink(name: string) {
    return this.page.getByRole("link", { name });
  }

  async openMobileNavigation() {
    await this.page.getByRole("button", { name: "Open admin navigation" }).click();
  }

  async navigateTo(name: string) {
    await this.navLink(name).click();
  }

  async expectShellVisible() {
    await expect(
      this.page.getByLabel("Admin sidebar navigation").getByText("CommerceHub AI"),
    ).toBeVisible();
    await expect(this.page.getByText("Enterprise Workspace")).toBeVisible();
  }
}
