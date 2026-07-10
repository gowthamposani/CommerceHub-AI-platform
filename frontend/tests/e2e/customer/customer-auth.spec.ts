import { expect, test } from "../../fixtures/customer.fixture";
import { CustomerPortalAssertions } from "../../utils/customer-portal.assertions";

test.describe("Customer authentication smoke", () => {
  test("invalid login keeps the customer on the login page with a clear error", async ({
    loginPage,
    customerJourneyData,
    page
  }) => {
    await loginPage.open();
    await loginPage.expectVisible();

    await loginPage.submitLogin(customerJourneyData.invalidLogin, true);

    await loginPage.expectVisible();
    await loginPage.expectErrorMessage("Invalid email or password");
    await expect(page).toHaveURL(/\/login$/);
    await CustomerPortalAssertions.expectPublicAuthScreen(page);
  });

  test("protected routes redirect anonymous visitors to login", async ({ protectedRoutePage, page }) => {
    await protectedRoutePage.open("/home");
    await protectedRoutePage.expectRedirectedToLogin();

    await protectedRoutePage.open("/wishlist");
    await protectedRoutePage.expectRedirectedToLogin();

    await protectedRoutePage.open("/cart");
    await protectedRoutePage.expectRedirectedToLogin();

    await protectedRoutePage.open("/orders");
    await protectedRoutePage.expectRedirectedToLogin();

    await expect(page).toHaveURL(/\/login$/);
  });
});
