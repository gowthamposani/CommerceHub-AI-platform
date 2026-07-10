export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RequestStatus = "idle" | "loading" | "success" | "error";
