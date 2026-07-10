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
  adminDashboardPage: async ({ page }, useFixture) => {
    await useFixture(new AdminDashboardPage(page));
  },
  adminLayoutPage: async ({ page }, useFixture) => {
    await useFixture(new AdminLayoutPage(page));
  },
  aiProductGeneratorPage: async ({ page }, useFixture) => {
    await useFixture(new AIProductGeneratorPage(page));
  },
  analyticsPage: async ({ page }, useFixture) => {
    await useFixture(new AnalyticsPage(page));
  },
  notificationsPage: async ({ page }, useFixture) => {
    await useFixture(new NotificationsPage(page));
  },
  settingsPage: async ({ page }, useFixture) => {
    await useFixture(new SettingsPage(page));
  }
});

export const enterpriseTest = test.extend({
  page: async ({ page }, useFixture) => {
    await mockAdminApis(page);
    await mockAIProductDescriptionSuccess(page);
    await useFixture(page);
  }
});

export { expect } from "@playwright/test";
