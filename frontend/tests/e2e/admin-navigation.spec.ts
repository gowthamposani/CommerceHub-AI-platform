import { enterpriseTest as test, expect } from "../fixtures/test";

test.describe("Admin module navigation", () => {
  test("admin dashboard loads", async ({ adminDashboardPage, adminLayoutPage }) => {
    await adminDashboardPage.gotoDashboard();

    await adminLayoutPage.expectShellVisible();
    await adminDashboardPage.expectLoaded();
  });

  test("sidebar navigation opens core Admin pages", async ({
    adminDashboardPage,
    adminLayoutPage,
    analyticsPage,
    notificationsPage,
    settingsPage,
    page,
  }) => {
    await adminDashboardPage.gotoDashboard();

    await adminLayoutPage.navigateTo("Analytics");
    await expect(page).toHaveURL(/\/admin\/analytics$/);
    await analyticsPage.expectLoaded();

    await adminLayoutPage.navigateTo("Notifications");
    await expect(page).toHaveURL(/\/admin\/notifications$/);
    await notificationsPage.expectLoaded();

    await adminLayoutPage.navigateTo("Settings");
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await settingsPage.expectLoaded();
  });

  test("analytics page opens directly", async ({ analyticsPage }) => {
    await analyticsPage.gotoAnalytics();

    await analyticsPage.expectLoaded();
  });

  test("notifications page loads directly", async ({ notificationsPage }) => {
    await notificationsPage.gotoNotifications();

    await notificationsPage.expectLoaded();
  });

  test("settings page loads directly", async ({ settingsPage }) => {
    await settingsPage.gotoSettings();

    await settingsPage.expectLoaded();
  });
});
