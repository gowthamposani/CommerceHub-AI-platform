import { customerJourneyConfig } from "../config/customer-journey.config";
import { RandomUtility } from "../utils/random.utility";
import type { CustomerJourneyTestData } from "../types/customer.types";

const FIRST_NAME = "Manasa";
const LAST_NAME = "Athi";

export class CustomerJourneyTestDataFactory {
  static create(): CustomerJourneyTestData {
    const email = RandomUtility.email("customer-journey");
    const customerFullName = `${FIRST_NAME} ${LAST_NAME}`;

    return {
      customer: {
        first_name: FIRST_NAME,
        last_name: LAST_NAME,
        email,
        password: customerJourneyConfig.customerPassword,
        role: "customer"
      },
      customerFullName,
      login: {
        email,
        password: customerJourneyConfig.customerPassword
      },
      invalidLogin: {
        email,
        password: `${customerJourneyConfig.customerPassword}!wrong`
      },
      paymentReference: RandomUtility.suffix("payment"),
      preferredProductTitle: customerJourneyConfig.preferredProductTitle,
      preferredProductId: customerJourneyConfig.preferredProductId
    };
  }
}
