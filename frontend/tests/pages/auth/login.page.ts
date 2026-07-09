import type { APIRequestContext } from '@playwright/test';

import { ApiClientUtility } from '../../utils/api-client.utility';
import type { AuthLoginPayload } from '../../types/auth.types';

export class LoginPage extends ApiClientUtility {
  constructor(request: APIRequestContext) {
    super(request);
  }

  login(payload: AuthLoginPayload) {
    return this.post('/auth/login', payload);
  }
}
