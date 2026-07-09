import { demoProducts } from '../../src/data/demo-products';

const normalize = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const preferredProduct = demoProducts[0];

export const customerJourneyConfig = {
  preferredProductTitle: normalize(process.env.E2E_CATALOG_PRODUCT_TITLE) ?? preferredProduct.title,
  preferredProductId: normalize(process.env.E2E_CATALOG_PRODUCT_ID) ?? preferredProduct.id,
  customerPassword: normalize(process.env.E2E_CUSTOMER_PASSWORD) ?? 'Pass12345',
};
