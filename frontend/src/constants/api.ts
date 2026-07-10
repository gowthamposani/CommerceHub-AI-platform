export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);
export const API_RETRY_ATTEMPTS = Number(import.meta.env.VITE_API_RETRY_ATTEMPTS ?? 2);
export const API_RETRY_DELAY_MS = Number(import.meta.env.VITE_API_RETRY_DELAY_MS ?? 350);

export const API_ENDPOINTS = {
  health: "/health",
  liveness: "/health/live",
  readiness: "/health/ready"
} as const;
