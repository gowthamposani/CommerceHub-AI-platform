import type { AxiosRequestConfig, AxiosResponse } from "axios";

import type { ApiEnvelope } from "../types/api";
import { apiClient } from "../lib/api";

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

export async function unwrapApiResponse<T>(responsePromise: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const response = await responsePromise;
  return response.data.data;
}
