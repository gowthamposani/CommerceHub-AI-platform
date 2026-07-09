import { appConfig } from '../config';
import { demoProducts } from '../data/demo-products';
import { unwrapApiResponse } from './client';
import { http } from './http';
import { normalizeProduct, normalizeProductList } from './normalize';
import type { ApiEnvelope } from '../types/api';
import type { Product } from '../types/domain';

export interface ProductListResult {
  items: Product[];
  source: 'api' | 'demo';
}

export interface ProductDetailResult {
  item: Product | null;
  source: 'api' | 'demo';
}

export async function listProducts(): Promise<ProductListResult> {
  try {
    const payload = await unwrapApiResponse(http.get<ApiEnvelope<unknown>>('/products'));
    const items = normalizeProductList(payload);
    return {
      items,
      source: 'api',
    };
  } catch {
    return {
      items: appConfig.demoCatalogEnabled ? demoProducts : [],
      source: 'demo',
    };
  }
}

export async function getProduct(productId: string): Promise<ProductDetailResult> {
  try {
    const payload = await unwrapApiResponse(http.get<ApiEnvelope<unknown>>(`/products/${productId}`));
    const item = normalizeProduct(payload);
    if (item) {
      return {
        item,
        source: 'api',
      };
    }
  } catch {
    // Fall back to the local demo catalog for an uninterrupted UI in branches
    // where the product module has not been connected yet.
  }

  const demoItem = demoProducts.find((product) => product.id === productId) ?? null;
  return {
    item: demoItem,
    source: 'demo',
  };
}

