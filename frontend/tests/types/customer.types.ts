import type { AuthLoginPayload, AuthRegistrationPayload } from "../../src/types/domain";

export interface ProductSnapshot {
  id: string;
  title: string;
  href: string;
}

export interface CustomerJourneyTestData {
  customer: AuthRegistrationPayload;
  customerFullName: string;
  login: AuthLoginPayload;
  invalidLogin: AuthLoginPayload;
  paymentReference: string;
  preferredProductTitle: string;
  preferredProductId: string;
}

export interface CartSummaryExpectation {
  itemCount: number;
  totalQuantity: number;
  subtotalText?: string;
  grandTotalText?: string;
}
