import { RandomUtility } from '../utils/random.utility';
import type { AuthLoginPayload, AuthRegistrationPayload, AuthTestData } from '../types/auth.types';

const PASSWORD = 'Pass12345';
const INVALID_PASSWORD = 'WrongPass123!';

const buildRegistrationPayload = (
  role: AuthRegistrationPayload['role'],
  emailPrefix: string,
): AuthRegistrationPayload => ({
  first_name: 'Manasa',
  last_name: 'Athi',
  email: RandomUtility.email(emailPrefix),
  password: PASSWORD,
  role,
});

export class AuthTestDataFactory {
  static create(): AuthTestData {
    const customer = buildRegistrationPayload('customer', 'customer');
    const seller = buildRegistrationPayload('seller', 'seller');

    return {
      customer,
      seller,
      validLogin: {
        email: customer.email,
        password: PASSWORD,
      },
      invalidLogin: {
        email: customer.email,
        password: INVALID_PASSWORD,
      },
    };
  }

  static customerLoginPayload(customer: AuthRegistrationPayload): AuthLoginPayload {
    return {
      email: customer.email,
      password: customer.password,
    };
  }
}
