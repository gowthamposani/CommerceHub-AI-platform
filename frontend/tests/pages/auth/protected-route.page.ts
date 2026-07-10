import type { APIRequestContext } from "@playwright/test";

import { ApiClientUtility } from "../../utils/api-client.utility";

export class ProtectedRoutePage extends ApiClientUtility {
  constructor(request: APIRequestContext) {
    super(request);
  }

  currentUser(accessToken?: string) {
    const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return this.get("/auth/me", headers);
  }
}
