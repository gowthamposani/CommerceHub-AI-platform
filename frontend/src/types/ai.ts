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
  specifications: string[];
};

export type AIProductDescription = {
  title: string;
  generatedDescription: string;
  generatedKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  highlights: string[];
};

export type ProductDescriptionResponse = {
  success: boolean;
  message: string;
  data: {
    title: string;
    description: string;
    seo_title: string;
    seo_description: string;
    highlights: string[];
    keywords: string[];
  };
};

export type ProductDescriptionDataResponse = {
  title?: string;
  description?: string;
  seo_title: string;
  seo_description?: string;
  generated_description?: string;
  generated_keywords?: string[];
  meta_description?: string;
  highlights: string[];
  keywords?: string[];
};
