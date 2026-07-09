import type { APIRequestContext } from '@playwright/test';

import { ApiClientUtility } from '../../utils/api-client.utility';
import type { AuthRegistrationPayload } from '../../types/auth.types';

export class RegisterPage extends ApiClientUtility {
  constructor(request: APIRequestContext) {
    super(request);
  }

  register(payload: AuthRegistrationPayload) {
    return this.post('/auth/register', payload);
  }

  registerCustomer(payload: Omit<AuthRegistrationPayload, 'role'>) {
    return this.register({
      ...payload,
      role: 'customer',
    });
  }

  registerSeller(payload: Omit<AuthRegistrationPayload, 'role'>) {
    return this.register({
      ...payload,
      role: 'seller',
    });
  }
}
