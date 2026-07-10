import { test as base, expect } from "@playwright/test";

import { e2eConfig } from "../config/e2e-config";
import { AuthTestDataFactory } from "../data/auth.test-data";
import { LoginPage } from "../pages/auth/login.page";
import { ProtectedRoutePage } from "../pages/auth/protected-route.page";
import { RegisterPage } from "../pages/auth/register.page";
import { SessionPage } from "../pages/auth/session.page";
import type { AuthTestData } from "../types/auth.types";

type AuthFixtures = {
  authTestData: AuthTestData;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  protectedRoutePage: ProtectedRoutePage;
  sessionPage: SessionPage;
};

export const test = base.extend<AuthFixtures>({
  authTestData: async (_fixtures, provide) => {
    await provide(AuthTestDataFactory.create());
  },
  registerPage: async ({ request }, provide) => {
    await provide(new RegisterPage(request));
  },
  loginPage: async ({ request }, provide) => {
    await provide(new LoginPage(request));
  },
  protectedRoutePage: async ({ request }, provide) => {
    await provide(new ProtectedRoutePage(request));
  },
  sessionPage: async ({ request, browser }, provide) => {
    await provide(new SessionPage(request, browser, e2eConfig));
  }
});

export { expect };
