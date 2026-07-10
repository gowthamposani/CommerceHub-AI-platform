import { unwrapApiResponse } from "./client";
import { http } from "./http";
import type { ApiEnvelope } from "../types/api";
import type { AddWishlistItemPayload, WishlistItem } from "../types/domain";

export async function getWishlist(): Promise<WishlistItem[]> {
  return unwrapApiResponse(http.get<ApiEnvelope<WishlistItem[]>>("/wishlist"));
}

export async function addWishlistItem(payload: AddWishlistItemPayload): Promise<WishlistItem> {
  return unwrapApiResponse(http.post<ApiEnvelope<WishlistItem>>("/wishlist", payload));
}

export async function removeWishlistItem(productId: string): Promise<void> {
  await unwrapApiResponse(http.delete<ApiEnvelope<Record<string, never>>>(`/wishlist/${productId}`));
}

export async function moveWishlistItemToCart(productId: string): Promise<void> {
  await unwrapApiResponse(http.post<ApiEnvelope<Record<string, never>>>(`/wishlist/${productId}/move-to-cart`));
}
