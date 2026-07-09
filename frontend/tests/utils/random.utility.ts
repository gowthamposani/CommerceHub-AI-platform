import { randomUUID } from 'node:crypto';

export class RandomUtility {
  static suffix(prefix = 'e2e'): string {
    return `${prefix}-${randomUUID()}`;
  }

  static email(prefix = 'user'): string {
    return `${prefix}.${randomUUID()}@example.com`;
  }
}
