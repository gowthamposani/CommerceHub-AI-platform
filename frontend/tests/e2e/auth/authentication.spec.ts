import { expect, test } from '../../fixtures/auth.fixture';
import { e2eConfig } from '../../config/e2e-config';
import { AuthAssertions } from '../../utils/assertions.utility';
import { JwtUtility } from '../../utils/jwt.utility';
import type { ApiResponse, AuthSession, AuthUser } from '../../types/auth.types';

test.describe('Authentication module', () => {
  test('Register Customer', async ({ registerPage, authTestData }) => {
    const response = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as ApiResponse<AuthUser>;
    AuthAssertions.expectSuccessEnvelope(body, 'Registration successful');
    AuthAssertions.expectUser(body.data, {
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      role: 'customer',
      status: 'active',
    });
  });

  test('Register Seller', async ({ registerPage, authTestData }) => {
    const response = await registerPage.registerSeller({
      first_name: authTestData.seller.first_name,
      last_name: authTestData.seller.last_name,
      email: authTestData.seller.email,
      password: authTestData.seller.password,
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as ApiResponse<AuthUser>;
    AuthAssertions.expectSuccessEnvelope(
      body,
      'Registration successful. Seller account is pending approval',
    );
    AuthAssertions.expectUser(body.data, {
      first_name: authTestData.seller.first_name,
      last_name: authTestData.seller.last_name,
      email: authTestData.seller.email,
      role: 'seller',
      status: 'pending_approval',
    });
  });

  test('Login', async ({ registerPage, loginPage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const response = await loginPage.login(authTestData.validLogin);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiResponse<AuthSession>;
    AuthAssertions.expectSuccessEnvelope(body, 'Login successful');
    AuthAssertions.expectSession(body.data, {
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      role: 'customer',
      status: 'active',
    });
    expect(body.data.user.last_login_at).not.toBeNull();
  });

  test('Invalid Login', async ({ registerPage, loginPage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const response = await loginPage.login(authTestData.invalidLogin);
    expect(response.status()).toBe(401);

    const body = (await response.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(body, 'Invalid email or password');
  });

  test('Refresh Token', async ({ registerPage, loginPage, sessionPage, authTestData, protectedRoutePage }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await loginPage.login(authTestData.validLogin);
    expect(loginResponse.status()).toBe(200);
    const loginBody = (await loginResponse.json()) as ApiResponse<AuthSession>;

    const originalTokens = loginBody.data.tokens;
    const refreshResponse = await sessionPage.refresh(originalTokens.refresh_token);
    expect(refreshResponse.status()).toBe(200);

    const refreshBody = (await refreshResponse.json()) as ApiResponse<AuthSession>;
    AuthAssertions.expectSuccessEnvelope(refreshBody, 'Token refreshed successfully');
    AuthAssertions.expectSession(refreshBody.data, {
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      role: 'customer',
      status: 'active',
    });

    expect(refreshBody.data.tokens.access_token).not.toBe(originalTokens.access_token);
    expect(refreshBody.data.tokens.refresh_token).not.toBe(originalTokens.refresh_token);

    const reusedRefreshResponse = await sessionPage.refresh(originalTokens.refresh_token);
    expect(reusedRefreshResponse.status()).toBe(401);
    const reusedRefreshBody = (await reusedRefreshResponse.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(reusedRefreshBody, 'Refresh token is invalid or revoked');

    const protectedUserResponse = await protectedRoutePage.currentUser(
      refreshBody.data.tokens.access_token,
    );
    expect(protectedUserResponse.status()).toBe(200);
  });

  test('Logout', async ({ registerPage, loginPage, sessionPage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await loginPage.login(authTestData.validLogin);
    expect(loginResponse.status()).toBe(200);
    const loginBody = (await loginResponse.json()) as ApiResponse<AuthSession>;

    const logoutResponse = await sessionPage.logout(loginBody.data.tokens.refresh_token);
    expect(logoutResponse.status()).toBe(200);
    const logoutBody = (await logoutResponse.json()) as ApiResponse<Record<string, never>>;
    AuthAssertions.expectSuccessEnvelope(logoutBody, 'Logout successful');

    const refreshAfterLogout = await sessionPage.refresh(loginBody.data.tokens.refresh_token);
    expect(refreshAfterLogout.status()).toBe(401);
    const refreshAfterLogoutBody = (await refreshAfterLogout.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(
      refreshAfterLogoutBody,
      'Refresh token is invalid or revoked',
    );
  });

  test('Session Expiry', async ({ registerPage, loginPage, protectedRoutePage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await loginPage.login(authTestData.validLogin);
    expect(loginResponse.status()).toBe(200);
    const loginBody = (await loginResponse.json()) as ApiResponse<AuthSession>;

    const expiredToken = JwtUtility.createExpiredAccessToken({
      subject: loginBody.data.user.id,
      secret: e2eConfig.jwtSecret,
      issuer: e2eConfig.tokenIssuer,
      audience: e2eConfig.tokenAudience,
      extraClaims: JwtUtility.createAuthClaims(
        loginBody.data.user.email,
        loginBody.data.user.role.name,
      ),
    });

    const response = await protectedRoutePage.currentUser(expiredToken);
    expect(response.status()).toBe(401);

    const body = (await response.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(body, 'Invalid or expired token');
  });

  test('Invalid JWT', async ({ registerPage, loginPage, protectedRoutePage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await loginPage.login(authTestData.validLogin);
    expect(loginResponse.status()).toBe(200);
    const loginBody = (await loginResponse.json()) as ApiResponse<AuthSession>;

    const invalidToken = JwtUtility.createInvalidSignatureToken({
      subject: loginBody.data.user.id,
      tokenType: 'access',
      expiresInSeconds: 300,
      invalidSecret: 'wrong-secret',
      issuer: e2eConfig.tokenIssuer,
      audience: e2eConfig.tokenAudience,
      extraClaims: JwtUtility.createAuthClaims(
        loginBody.data.user.email,
        loginBody.data.user.role.name,
      ),
    });

    const response = await protectedRoutePage.currentUser(invalidToken);
    expect(response.status()).toBe(401);

    const body = (await response.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(body, 'Invalid or expired token');
  });

  test('Protected Route Access', async ({ protectedRoutePage }) => {
    const response = await protectedRoutePage.currentUser();
    expect(response.status()).toBe(401);

    const body = (await response.json()) as ApiResponse<unknown>;
    AuthAssertions.expectUnauthorizedEnvelope(body, 'Not authenticated');
  });

  test('Remember Logged-in User', async ({ registerPage, loginPage, sessionPage, protectedRoutePage, authTestData }) => {
    const registerResponse = await registerPage.registerCustomer({
      first_name: authTestData.customer.first_name,
      last_name: authTestData.customer.last_name,
      email: authTestData.customer.email,
      password: authTestData.customer.password,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await loginPage.login(authTestData.validLogin);
    expect(loginResponse.status()).toBe(200);
    const loginBody = (await loginResponse.json()) as ApiResponse<AuthSession>;

    const storageState = sessionPage.buildRememberedStorageState(loginBody.data, true);
    const rememberedContext = await sessionPage.createRememberedContext(loginBody.data, true);

    try {
      const rememberedState = await rememberedContext.storageState();
      AuthAssertions.expectRememberedSession(rememberedState, loginBody.data, true);

      const restoredSession = sessionPage.extractRememberedSession(rememberedState);
      expect(restoredSession).not.toBeNull();
      if (restoredSession) {
        expect(restoredSession.tokens.access_token).toBe(loginBody.data.tokens.access_token);
        expect(restoredSession.tokens.refresh_token).toBe(loginBody.data.tokens.refresh_token);
        const protectedRouteResponse = await protectedRoutePage.currentUser(
          restoredSession.tokens.access_token,
        );
        expect(protectedRouteResponse.status()).toBe(200);
      }

      const restoredRememberFlag = sessionPage.extractRememberMe(rememberedState);
      expect(restoredRememberFlag).toBe(true);
      expect(storageState.origins[0].origin).toBe(e2eConfig.appBaseUrl);
    } finally {
      await rememberedContext.close();
    }
  });
});
