const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const appConfig = {
  appName: 'CommerceHub AI',
  customerPortalName: 'CommerceHub AI Customer Portal',
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  ),
  currency: import.meta.env.VITE_CURRENCY ?? 'USD',
  demoCatalogEnabled: import.meta.env.VITE_ENABLE_DEMO_CATALOG !== 'false',
};

export const authStorageKeys = {
  session: 'commercehub.auth.session',
  rememberMe: 'commercehub.auth.remember-me',
} as const;

