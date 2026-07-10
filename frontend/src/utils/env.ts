import { APP_DESCRIPTION, APP_ENVIRONMENT, APP_NAME, APP_VERSION } from "@/constants/app";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/api";

export const appConfig = {
  name: APP_NAME,
  version: APP_VERSION,
  description: APP_DESCRIPTION,
  environment: APP_ENVIRONMENT,
  apiBaseUrl: API_BASE_URL,
  apiTimeoutMs: API_TIMEOUT_MS
} as const;

export function isProduction(): boolean {
  return appConfig.environment === "production";
}
