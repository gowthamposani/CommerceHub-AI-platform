export const queryKeys = {
  health: ["health"] as const,
  readiness: ["health", "readiness"] as const,
  sellers: {
    all: ["sellers"] as const,
    list: (params: object) => ["sellers", "list", params] as const,
    detail: (sellerId: string) => ["sellers", "detail", sellerId] as const
  },
  categories: {
    all: ["categories"] as const,
    list: (params: object) => ["categories", "list", params] as const,
    detail: (categoryId: string) => ["categories", "detail", categoryId] as const,
    tree: ["categories", "tree"] as const
  },
  brands: {
    all: ["brands"] as const,
    list: (params: object) => ["brands", "list", params] as const,
    detail: (brandId: string) => ["brands", "detail", brandId] as const,
    stats: (scope: string) => ["brands", "stats", scope] as const
  },
  products: {
    all: ["products"] as const,
    list: (params: object) => ["products", "list", params] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
    preview: (productId: string) => ["products", "preview", productId] as const,
    images: (productId: string) => ["products", "images", productId] as const,
    variants: (productId: string, params: object) => ["products", "variants", productId, params] as const,
    attributes: (productId: string) => ["products", "attributes", productId] as const,
    tags: (productId: string) => ["products", "tags", productId] as const,
    specifications: (productId: string) => ["products", "specifications", productId] as const,
    seo: (productId: string) => ["products", "seo", productId] as const,
    extensionPreview: (productId: string) => ["products", "extension-preview", productId] as const,
    stats: (scope: string) => ["products", "stats", scope] as const
  },
  inventory: {
    all: ["inventory"] as const,
    list: (params: object) => ["inventory", "list", params] as const,
    detail: (inventoryId: string) => ["inventory", "detail", inventoryId] as const,
    history: (inventoryId: string, params: object) => ["inventory", "history", inventoryId, params] as const,
    metrics: (scope: string) => ["inventory", "metrics", scope] as const
  },
  warehouses: {
    all: ["warehouses"] as const,
    list: (params: object) => ["warehouses", "list", params] as const,
    detail: (warehouseId: string) => ["warehouses", "detail", warehouseId] as const,
    statistics: (sellerId?: string) => ["warehouses", "statistics", sellerId ?? "all"] as const,
    capacity: (warehouseId: string) => ["warehouses", "capacity", warehouseId] as const,
    inventorySummary: (warehouseId: string) => ["warehouses", "inventory-summary", warehouseId] as const,
    inventory: (warehouseId: string, params: object) => ["warehouses", "inventory", warehouseId, params] as const,
    activity: (warehouseId: string) => ["warehouses", "activity", warehouseId] as const
  },
  sellerDashboard: {
    all: ["seller-dashboard"] as const,
    overview: (params: object) => ["seller-dashboard", "overview", params] as const,
    charts: (params: object) => ["seller-dashboard", "charts", params] as const,
    alerts: (sellerId: string) => ["seller-dashboard", "alerts", sellerId] as const,
    activities: (sellerId: string) => ["seller-dashboard", "activities", sellerId] as const,
    search: (params: object) => ["seller-dashboard", "search", params] as const
  }
};
