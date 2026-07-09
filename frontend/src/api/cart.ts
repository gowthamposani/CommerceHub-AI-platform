import { unwrapApiResponse } from './client';
import { http } from './http';
import type { ApiEnvelope } from '../types/api';
import type { AddCartItemPayload, Cart, UpdateCartQuantityPayload } from '../types/domain';

export async function getCart(): Promise<Cart> {
  return unwrapApiResponse(http.get<ApiEnvelope<Cart>>('/cart'));
}

export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  return unwrapApiResponse(http.post<ApiEnvelope<Cart>>('/cart', payload));
}

export async function updateCartQuantity(itemId: string, payload: UpdateCartQuantityPayload): Promise<Cart> {
  return unwrapApiResponse(http.put<ApiEnvelope<Cart>>(`/cart/items/${itemId}`, payload));
}

export async function deleteCartItem(itemId: string): Promise<Cart> {
  return unwrapApiResponse(http.delete<ApiEnvelope<Cart>>(`/cart/items/${itemId}`));
}

export async function clearCart(): Promise<Cart> {
  return unwrapApiResponse(http.delete<ApiEnvelope<Cart>>('/cart'));
}

