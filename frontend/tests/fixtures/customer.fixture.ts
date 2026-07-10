import { expect, test as base } from "@playwright/test";

import { CustomerJourneyTestDataFactory } from "../data/customer-journey.test-data";
import { CustomerCartPage } from "../pages/customer/cart.page";
import { CustomerCheckoutPage } from "../pages/customer/checkout.page";
import { CustomerHomePage } from "../pages/customer/home.page";
import { CustomerLandingPage } from "../pages/customer/landing.page";
import { CustomerLoginPage } from "../pages/customer/login.page";
import { CustomerNavigationPage } from "../pages/customer/navigation.page";
import { CustomerProtectedRoutePage } from "../pages/customer/protected-route.page";
import { CustomerOrderDetailsPage } from "../pages/customer/order-details.page";
import { CustomerOrdersPage } from "../pages/customer/orders.page";
import { CustomerProductDetailsPage } from "../pages/customer/product-details.page";
import { CustomerProductsPage } from "../pages/customer/products.page";
import { CustomerRegisterPage } from "../pages/customer/register.page";
import { CustomerWishlistPage } from "../pages/customer/wishlist.page";
import type { CustomerJourneyTestData } from "../types/customer.types";

type CustomerFixtures = {
  customerJourneyData: CustomerJourneyTestData;
  landingPage: CustomerLandingPage;
  registerPage: CustomerRegisterPage;
  loginPage: CustomerLoginPage;
  homePage: CustomerHomePage;
  navigationPage: CustomerNavigationPage;
  protectedRoutePage: CustomerProtectedRoutePage;
  productsPage: CustomerProductsPage;
  productDetailsPage: CustomerProductDetailsPage;
  wishlistPage: CustomerWishlistPage;
  cartPage: CustomerCartPage;
  checkoutPage: CustomerCheckoutPage;
  ordersPage: CustomerOrdersPage;
  orderDetailsPage: CustomerOrderDetailsPage;
};

export const test = base.extend<CustomerFixtures>({
  customerJourneyData: async (_fixtures, provide) => {
    await provide(CustomerJourneyTestDataFactory.create());
  },
  landingPage: async ({ page }, provide) => {
    await provide(new CustomerLandingPage(page));
  },
  registerPage: async ({ page }, provide) => {
    await provide(new CustomerRegisterPage(page));
  },
  loginPage: async ({ page }, provide) => {
    await provide(new CustomerLoginPage(page));
  },
  homePage: async ({ page }, provide) => {
    await provide(new CustomerHomePage(page));
  },
  navigationPage: async ({ page }, provide) => {
    await provide(new CustomerNavigationPage(page));
  },
  protectedRoutePage: async ({ page }, provide) => {
    await provide(new CustomerProtectedRoutePage(page));
  },
  productsPage: async ({ page }, provide) => {
    await provide(new CustomerProductsPage(page));
  },
  productDetailsPage: async ({ page }, provide) => {
    await provide(new CustomerProductDetailsPage(page));
  },
  wishlistPage: async ({ page }, provide) => {
    await provide(new CustomerWishlistPage(page));
  },
  cartPage: async ({ page }, provide) => {
    await provide(new CustomerCartPage(page));
  },
  checkoutPage: async ({ page }, provide) => {
    await provide(new CustomerCheckoutPage(page));
  },
  ordersPage: async ({ page }, provide) => {
    await provide(new CustomerOrdersPage(page));
  },
  orderDetailsPage: async ({ page }, provide) => {
    await provide(new CustomerOrderDetailsPage(page));
  }
});

export { expect };
