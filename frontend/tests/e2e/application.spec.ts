import { enterpriseTest as test, expect } from "../fixtures/test";
import { viewports } from "../utils/viewports";

test.describe("CommerceHub AI application shell", () => {
  test("application launches successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "CommerceHub AI - Frontend Initialized" })).toBeVisible();
  });

  test("unknown routes fall back to the initialized application page", async ({ page }) => {
    await page.goto("/does-not-exist");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "CommerceHub AI - Frontend Initialized" })).toBeVisible();
  });

  test("responsive admin layout supports desktop, tablet, and mobile", async ({
    adminDashboardPage,
    adminLayoutPage,
    page
  }) => {
    for (const viewport of Object.values(viewports)) {
      await page.setViewportSize(viewport);
      await adminDashboardPage.gotoDashboard();
      await adminDashboardPage.expectLoaded();

      if (viewport.width < 1024) {
        await adminLayoutPage.openMobileNavigation();
      }

      await expect(adminLayoutPage.navLink("Dashboard")).toBeVisible();
    }
  });
});
