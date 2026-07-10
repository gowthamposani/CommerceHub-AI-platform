import type { Page, Route } from "@playwright/test";

const jsonHeaders = {
  "access-control-allow-origin": "*",
  "content-type": "application/json"
};

function fulfillJson(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
}

export async function mockAdminApis(page: Page) {
  await page.route("**/api/v1/admin/dashboard", (route) =>
    fulfillJson(route, {
      success: true,
      message: "Dashboard retrieved successfully",
      data: {
        total_users: 128,
        total_customers: 96,
        total_sellers: 24,
        total_products: 342,
        total_orders: 812,
        pending_seller_requests: 6,
        revenue: 125400,
        generated_at: "2026-07-09T10:00:00.000Z",
        monthly_revenue: [
          { month: "Jan", revenue: 12000 },
          { month: "Feb", revenue: 18000 }
        ],
        orders_overview: [
          { label: "Pending", orders: 18 },
          { label: "Completed", orders: 144 }
        ],
        top_categories: [
          { name: "Electronics", value: 48 },
          { name: "Fashion", value: 32 }
        ],
        recent_activity: [
          {
            id: "activity-1",
            title: "Seller approval queue updated",
            description: "Pending seller requests refreshed.",
            timestamp: "Today",
            tone: "info"
          }
        ],
        latest_notifications: [
          {
            id: "notification-1",
            title: "System healthy",
            message: "All core services are operational.",
            severity: "info",
            createdAt: "Today"
          }
        ],
        recent_orders: [
          {
            id: "ORD-1001",
            customer: "Enterprise Buyer",
            seller: "Prime Seller",
            amount: 240,
            status: "Processing"
          }
        ],
        quick_actions: [
          {
            id: "quick-ai",
            label: "Generate product copy",
            description: "Open AI product tools.",
            href: "/admin/ai-tools"
          }
        ],
        system_status: [{ label: "API Gateway", value: "Operational", state: "healthy" }]
      }
    })
  );

  await page.route("**/api/v1/admin/analytics", (route) =>
    fulfillJson(route, {
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        total_revenue: 125400,
        today_orders: 14,
        monthly_orders: 812,
        active_customers: 96,
        active_sellers: 24,
        best_selling_category: "Electronics",
        low_stock_products: 3,
        generated_at: "2026-07-09T10:00:00.000Z",
        revenue_series: [
          { month: "Jan", revenue: 12000 },
          { month: "Feb", revenue: 18000 }
        ],
        orders_overview: [
          { label: "Pending", orders: 18 },
          { label: "Completed", orders: 144 }
        ],
        category_performance: [
          { name: "Electronics", value: 48 },
          { name: "Fashion", value: 32 }
        ]
      }
    })
  );

  await page.route("**/api/v1/notifications/templates", (route) =>
    fulfillJson(route, {
      success: true,
      message: "Notification templates retrieved successfully",
      data: [
        {
          template_id: "welcome",
          name: "Welcome Notification",
          supported_channels: ["EMAIL", "IN_APP"]
        }
      ]
    })
  );

  await page.route("**/api/v1/notifications/history", (route) =>
    fulfillJson(route, {
      success: true,
      message: "Notification history retrieved successfully",
      data: [
        {
          notification_id: "mock-history-001",
          title: "Welcome Notification",
          channel: "EMAIL",
          recipient: "customer@example.com",
          status: "DELIVERED",
          created_at: "2026-07-09T10:00:00.000Z"
        }
      ]
    })
  );

  await page.route("**/api/v1/notifications/send", (route) =>
    fulfillJson(route, {
      success: true,
      message: "Notification sent successfully",
      data: {
        notification_id: "mock-send-001",
        channel: "IN_APP",
        status: "QUEUED",
        provider: "mock",
        sent_at: "2026-07-09T10:00:00.000Z"
      }
    })
  );
}

export async function mockAIProductDescriptionSuccess(page: Page) {
  await page.route("**/api/v1/ai/product-description", async (route) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });
    return fulfillJson(route, {
      success: true,
      message: "Description generated successfully",
      data: {
        title: "CommerceHub Smart Speaker",
        description: "A polished marketplace description for a premium smart speaker.",
        seo_title: "CommerceHub Smart Speaker",
        seo_description: "Shop CommerceHub smart speakers with room-filling audio.",
        highlights: ["Room-filling sound", "Voice assistant ready"],
        keywords: ["smart speaker", "commercehub", "audio"]
      }
    });
  });
}

export async function mockAIProductDescriptionFailure(page: Page) {
  await page.route("**/api/v1/ai/product-description", (route) =>
    fulfillJson(
      route,
      {
        success: false,
        message: "AI provider unavailable",
        error_code: "AI_PROVIDER_UNAVAILABLE",
        details: {}
      },
      503
    )
  );
}

export async function mockDashboardNetworkFailure(page: Page) {
  await page.route("**/api/v1/admin/dashboard", (route) => route.abort("failed"));
}
