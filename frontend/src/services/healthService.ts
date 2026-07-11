import { apiRequest } from "@/api/client";
import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResponse } from "@/types/common";

export interface HealthPayload {
  status: string;
  timestamp: string;
}

export function getHealth() {
  return apiRequest<ApiResponse<HealthPayload>>({ method: "GET", url: API_ENDPOINTS.health });
}
