import { unwrapApiResponse } from "./client";
import { http } from "./http";
import type { ApiEnvelope } from "../types/api";
import type { CheckoutRequest, Order } from "../types/domain";

export async function checkoutOrder(payload: CheckoutRequest = {}): Promise<Order> {
  return unwrapApiResponse(http.post<ApiEnvelope<Order>>("/orders/checkout", payload));
}

export async function listOrders(): Promise<Order[]> {
  return unwrapApiResponse(http.get<ApiEnvelope<Order[]>>("/orders"));
}

export async function getOrder(orderId: string): Promise<Order> {
  return unwrapApiResponse(http.get<ApiEnvelope<Order>>(`/orders/${orderId}`));
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return unwrapApiResponse(http.patch<ApiEnvelope<Order>>(`/orders/${orderId}/cancel`));
}
