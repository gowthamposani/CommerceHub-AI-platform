import type { Page } from "@playwright/test";

export async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "commercehub.auth.session",
      JSON.stringify({
        accessToken: "",
        refreshToken: "test-refresh-token",
        user: {
          id: "00000000-0000-0000-0000-000000000001",
          first_name: "Test",
          last_name: "Seller",
          email: "seller@example.com",
          phone: null,
          role: "seller",
          status: "active",
          is_active: true,
          is_verified: true,
          created_at: "2026-07-09T00:00:00Z",
          updated_at: "2026-07-09T00:00:00Z"
        }
      })
    );
  });
}
