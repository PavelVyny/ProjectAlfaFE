import type { AxiosError } from "axios";

export interface ApiErrorResponse {
  details?: string;
  error?: {
    details?: string;
    message?: string;
  };
  message?: string;
}

export type ApiErr = AxiosError<ApiErrorResponse>;
