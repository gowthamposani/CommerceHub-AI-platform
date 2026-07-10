import { expect } from "@playwright/test";

import type { AuthRegistrationPayload } from "../../../src/types/domain";
import { CustomerBasePage } from "./base.page";

export class CustomerRegisterPage extends CustomerBasePage {
  async open(): Promise<void> {
    await this.gotoPath("/register");
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(this.field("First name")).toBeVisible();
    await expect(this.field("Last name")).toBeVisible();
    await expect(this.field("Email")).toBeVisible();
    await expect(this.field("Password")).toBeVisible();
    await expect(this.field("Confirm password")).toBeVisible();
  }

  async register(payload: AuthRegistrationPayload): Promise<void> {
    await this.field("First name").fill(payload.first_name);
    await this.field("Last name").fill(payload.last_name);
    await this.field("Email").fill(payload.email);
    await this.field("Password").fill(payload.password);
    await this.field("Confirm password").fill(payload.password);

    await this.waitForPath("**/home", async () => this.button("Register customer account").click());
  }
}
