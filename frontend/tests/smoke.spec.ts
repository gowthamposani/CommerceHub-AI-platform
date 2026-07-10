import { expect, test } from "@playwright/test";

test("renders the frontend foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Enterprise Frontend Foundation" })).toBeVisible();
  await expect(page.getByText("Marketplace Console")).toBeVisible();
});
