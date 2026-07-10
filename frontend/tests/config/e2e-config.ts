// E2E configuration for the authentication Playwright suite.

export interface E2EConfig {
  appBaseUrl: string;
  apiBaseUrl: string;
  jwtSecret: string;
  jwtAlgorithm: string;
  tokenIssuer: string;
  tokenAudience: string;
  accessTokenExpireMinutes: number;
  refreshTokenExpireDays: number;
  storageKeys: {
    session: string;
    rememberMe: string;
  };
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const appOrigin = trimTrailingSlash(process.env.E2E_APP_BASE_URL ?? "http://127.0.0.1:3000");

const resolveApiBaseUrl = (): string => {
  const configuredValue =
    process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

  const trimmed = trimTrailingSlash(configuredValue);
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

export const e2eConfig: E2EConfig = {
  appBaseUrl: appOrigin,
  apiBaseUrl: resolveApiBaseUrl(),
  jwtSecret: process.env.E2E_JWT_SECRET ?? "test-secret-key",
  jwtAlgorithm: process.env.E2E_JWT_ALGORITHM ?? "HS256",
  tokenIssuer: process.env.E2E_TOKEN_ISSUER ?? "test-commercehub",
  tokenAudience: process.env.E2E_TOKEN_AUDIENCE ?? "test-commercehub-web",
  accessTokenExpireMinutes: toNumber(process.env.E2E_ACCESS_TOKEN_EXPIRE_MINUTES, 60),
  refreshTokenExpireDays: toNumber(process.env.E2E_REFRESH_TOKEN_EXPIRE_DAYS, 7),
  storageKeys: {
    session: "commercehub.auth.session",
    rememberMe: "commercehub.auth.remember-me"
  }
};

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${e2eConfig.apiBaseUrl}${normalizedPath}`;
};
