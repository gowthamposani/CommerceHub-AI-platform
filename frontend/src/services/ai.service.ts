import { post } from "../lib/api";
import type {
  AIProductDescription,
  AIProductDescriptionRequest,
  ProductDescriptionRequestPayload,
  ProductDescriptionDataResponse,
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
  const specificationList = [
    ...request.features,
    ...Object.entries(request.specifications ?? {}).map(([name, value]) => `${name}: ${value}`),
  ];

  return {
    product_name: request.productName,
    brand: request.brand,
    category: request.category,
    specifications: specificationList,
  };
}

function mapProductDescriptionResponse(
  response: ProductDescriptionDataResponse,
): AIProductDescription {
  return {
    generatedDescription: response.description ?? response.generated_description ?? "",
    generatedKeywords: response.keywords ?? response.generated_keywords ?? [],
    seoTitle: response.seo_title,
    metaDescription: response.seo_description ?? response.meta_description ?? "",
    highlights: response.highlights,
  };
}

export class AIProductDescriptionApiService {
  async generateProductDescription(
    request: AIProductDescriptionRequest,
  ): Promise<AIProductDescription> {
    const { data } = await post<ProductDescriptionResponse, ProductDescriptionRequestPayload>(
      "/ai/product-description",
      mapProductDescriptionRequest(request),
    );
    return mapProductDescriptionResponse(data.data);
  }
}

export const aiProductDescriptionApiService = new AIProductDescriptionApiService();

export const generateProductDescription = (request: AIProductDescriptionRequest) =>
  aiProductDescriptionApiService.generateProductDescription(request);
