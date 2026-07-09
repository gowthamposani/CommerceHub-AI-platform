import { APIRequestContext, APIResponse } from '@playwright/test';

import { e2eConfig, type E2EConfig } from '../config/e2e-config';

export class ApiClientUtility {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly config: E2EConfig = e2eConfig,
  ) {}

  protected endpoint(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.apiBaseUrl}${normalizedPath}`;
  }

  protected get(path: string, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get(this.endpoint(path), { headers });
  }

  protected post(path: string, data: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.post(this.endpoint(path), { data, headers });
  }

  protected async json<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }
}
