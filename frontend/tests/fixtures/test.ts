import { test as base } from "@playwright/test";

import { AIProductGeneratorPage } from "../pages/ai-product-generator.page";
import { AdminDashboardPage } from "../pages/admin-dashboard.page";
import { AdminLayoutPage } from "../pages/admin-layout.page";
import { AnalyticsPage } from "../pages/analytics.page";
import { NotificationsPage } from "../pages/notifications.page";
import { SettingsPage } from "../pages/settings.page";
import { mockAdminApis, mockAIProductDescriptionSuccess } from "../utils/api-mocks";

type CommerceHubFixtures = {
  adminDashboardPage: AdminDashboardPage;
  adminLayoutPage: AdminLayoutPage;
  aiProductGeneratorPage: AIProductGeneratorPage;
  analyticsPage: AnalyticsPage;
  notificationsPage: NotificationsPage;
  settingsPage: SettingsPage;
};

export const test = base.extend<CommerceHubFixtures>({
  adminDashboardPage: async ({ page }, provide) => {
    await provide(new AdminDashboardPage(page));
  },
  adminLayoutPage: async ({ page }, provide) => {
    await provide(new AdminLayoutPage(page));
  },
  aiProductGeneratorPage: async ({ page }, provide) => {
    await provide(new AIProductGeneratorPage(page));
  },
  analyticsPage: async ({ page }, provide) => {
    await provide(new AnalyticsPage(page));
  },
  notificationsPage: async ({ page }, provide) => {
    await provide(new NotificationsPage(page));
  },
  settingsPage: async ({ page }, provide) => {
    await provide(new SettingsPage(page));
  }
});

export const enterpriseTest = test.extend({
  page: async ({ page }, provide) => {
    await mockAdminApis(page);
    await mockAIProductDescriptionSuccess(page);
    await provide(page);
  }
});

export { expect } from "@playwright/test";
