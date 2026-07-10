import { test } from "../fixtures/test";
import { mockDashboardNetworkFailure } from "../utils/api-mocks";

test.describe("Enterprise error handling", () => {
  test("dashboard shows an empty state when the network fails", async ({
    adminDashboardPage,
    page,
  }) => {
    await mockDashboardNetworkFailure(page);
    await adminDashboardPage.gotoDashboard();

    await adminDashboardPage.expectNetworkErrorState();
  });
});
