import { expect, test as base } from '@playwright/test';

import { CustomerJourneyTestDataFactory } from '../data/customer-journey.test-data';
import { CustomerCartPage } from '../pages/customer/cart.page';
import { CustomerCheckoutPage } from '../pages/customer/checkout.page';
import { CustomerHomePage } from '../pages/customer/home.page';
import { CustomerLandingPage } from '../pages/customer/landing.page';
import { CustomerLoginPage } from '../pages/customer/login.page';
import { CustomerNavigationPage } from '../pages/customer/navigation.page';
import { CustomerProtectedRoutePage } from '../pages/customer/protected-route.page';
import { CustomerOrderDetailsPage } from '../pages/customer/order-details.page';
import { CustomerOrdersPage } from '../pages/customer/orders.page';
import { CustomerProductDetailsPage } from '../pages/customer/product-details.page';
import { CustomerProductsPage } from '../pages/customer/products.page';
import { CustomerRegisterPage } from '../pages/customer/register.page';
import { CustomerWishlistPage } from '../pages/customer/wishlist.page';
import type { CustomerJourneyTestData } from '../types/customer.types';

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
  customerJourneyData: async ({}, use) => {
    await use(CustomerJourneyTestDataFactory.create());
  },
  landingPage: async ({ page }, use) => {
    await use(new CustomerLandingPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new CustomerRegisterPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new CustomerLoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new CustomerHomePage(page));
  },
  navigationPage: async ({ page }, use) => {
    await use(new CustomerNavigationPage(page));
  },
  protectedRoutePage: async ({ page }, use) => {
    await use(new CustomerProtectedRoutePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new CustomerProductsPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new CustomerProductDetailsPage(page));
  },
  wishlistPage: async ({ page }, use) => {
    await use(new CustomerWishlistPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CustomerCartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CustomerCheckoutPage(page));
  },
  ordersPage: async ({ page }, use) => {
    await use(new CustomerOrdersPage(page));
  },
  orderDetailsPage: async ({ page }, use) => {
    await use(new CustomerOrderDetailsPage(page));
  },
});

export { expect };
