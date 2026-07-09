import type { AxiosResponse } from 'axios';

import type { ApiEnvelope } from '../types/api';

export async function unwrapApiResponse<T>(
  responsePromise: Promise<AxiosResponse<ApiEnvelope<T>>>,
): Promise<T> {
  const response = await responsePromise;
  return response.data.data;
}

