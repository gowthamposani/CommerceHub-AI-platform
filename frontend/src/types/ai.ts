export type ProductSpecification = {
  id: string;
  name: string;
  value: string;
};

export type AIProductDescriptionRequest = {
  productName: string;
  brand: string;
  category: string;
  features: string[];
  specifications?: Record<string, string>;
};

export type ProductDescriptionRequestPayload = {
  product_name: string;
  brand: string;
  category: string;
  features: string[];
  specifications: Record<string, string>;
};

export type AIProductDescription = {
  generatedDescription: string;
  generatedKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  highlights: string[];
};

export type ProductDescriptionResponse = {
  generated_description: string;
  generated_keywords: string[];
  seo_title: string;
  meta_description: string;
  highlights: string[];
};
