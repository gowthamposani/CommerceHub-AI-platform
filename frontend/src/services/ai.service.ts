import { apiClient } from "../lib/api";
import type {
  AIProductDescription,
  AIProductDescriptionRequest,
  ProductDescriptionRequestPayload,
  ProductDescriptionResponse,
} from "../types/ai";

export type {
  AIProductDescription,
  AIProductDescriptionRequest,
  ProductSpecification,
} from "../types/ai";

function mapProductDescriptionRequest(
  request: AIProductDescriptionRequest,
): ProductDescriptionRequestPayload {
  return {
    product_name: request.productName,
    brand: request.brand,
    category: request.category,
    features: request.features,
    specifications: request.specifications ?? {},
  };
}

function mapProductDescriptionResponse(
  response: ProductDescriptionResponse,
): AIProductDescription {
  return {
    generatedDescription: response.generated_description,
    generatedKeywords: response.generated_keywords,
    seoTitle: response.seo_title,
    metaDescription: response.meta_description,
    highlights: response.highlights,
  };
}

export async function generateProductDescription(
  request: AIProductDescriptionRequest,
): Promise<AIProductDescription> {
  const { data } = await apiClient.post<ProductDescriptionResponse>(
    "/ai/product-description",
    mapProductDescriptionRequest(request),
  );
  return mapProductDescriptionResponse(data);
}

export const generateMockProductDescription = generateProductDescription;
