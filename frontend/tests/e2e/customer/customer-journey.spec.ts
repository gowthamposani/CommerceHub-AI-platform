import { CustomerPortalAssertions } from '../../utils/customer-portal.assertions';
import { expect, test } from '../../fixtures/customer.fixture';

test.describe('Customer portal journey', () => {
  test('registers, logs in, browses products, saves wishlist items, checks out, and logs out', async ({
    customerJourneyData,
    landingPage,
    registerPage,
    loginPage,
    homePage,
    navigationPage,
    productsPage,
    productDetailsPage,
    wishlistPage,
    cartPage,
    checkoutPage,
    ordersPage,
    orderDetailsPage,
    page,
  }) => {
    await test.step('Register a new customer account', async () => {
      await landingPage.open();
      await landingPage.expectVisible();
      await landingPage.clickGetStarted();
      await registerPage.expectVisible();
      await registerPage.register(customerJourneyData.customer);

      await homePage.expectWelcome(customerJourneyData.customerFullName);
      await navigationPage.expectVisible();
      await CustomerPortalAssertions.expectAuthenticatedShell(page);
    });

    await test.step('Log out and sign back in with the same customer', async () => {
      await navigationPage.logout();
      await loginPage.expectVisible();
      await CustomerPortalAssertions.expectPublicAuthScreen(page);

      await loginPage.login(customerJourneyData.login);
      await homePage.expectWelcome(customerJourneyData.customerFullName);
      await navigationPage.expectVisible();
    });

    let selectedProductTitle = customerJourneyData.preferredProductTitle;
    let selectedProductId = customerJourneyData.preferredProductId;
    let selectedPriceText = '';

    await test.step('Browse the catalog and view a product', async () => {
      await navigationPage.goToProducts();
      await productsPage.expectVisible();

      const product = await productsPage.openPreferredProduct(customerJourneyData.preferredProductTitle);
      selectedProductTitle = product.title;
      selectedProductId = product.id;

      await productDetailsPage.expectVisible(product);
      selectedPriceText = await productDetailsPage.readPriceText();
      await CustomerPortalAssertions.expectProductRoute(page, product.title, product.id);
    });

    await test.step('Save the product to the wishlist and move it to the cart', async () => {
      await productDetailsPage.addToWishlist();

      await navigationPage.goToWishlist();
      await wishlistPage.expectVisible();
      await wishlistPage.expectItem(selectedProductTitle);
      await CustomerPortalAssertions.expectWishlistCard(page, selectedProductTitle);

      await wishlistPage.moveItemToCart(selectedProductTitle);
      await wishlistPage.expectEmpty();

      await navigationPage.goToCart();
      await cartPage.expectVisible();
      await cartPage.expectItem(selectedProductTitle);
      await cartPage.expectSummaryTotals({
        itemCount: 1,
        totalQuantity: 1,
        subtotalText: selectedPriceText,
        grandTotalText: selectedPriceText,
      });
      await CustomerPortalAssertions.expectCartSummary(page, {
        itemCount: 1,
        totalQuantity: 1,
        subtotalText: selectedPriceText,
        grandTotalText: selectedPriceText,
      });
    });

    let orderId = '';

    await test.step('Checkout and verify the order appears in history', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.expectVisible();
      orderId = await checkoutPage.placeOrder(customerJourneyData.paymentReference);

      await orderDetailsPage.expectVisible(orderId);
      await orderDetailsPage.expectStatus('Placed');

      await navigationPage.goToOrders();
      await ordersPage.expectVisible();
      await ordersPage.expectOrder(orderId);
      await CustomerPortalAssertions.expectOrderListed(page, orderId);

      await ordersPage.openLatestOrder();
      await orderDetailsPage.expectVisible(orderId);
    });

    await test.step('Log out of the customer portal', async () => {
      await navigationPage.logout();
      await loginPage.expectVisible();
      await expect(page).toHaveURL(/\/login$/);
      await CustomerPortalAssertions.expectPublicAuthScreen(page);
    });
  });
});
