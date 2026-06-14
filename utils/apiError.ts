import axios from 'axios';

type ApiErrorBody = {
  message?: string;
  details?: Record<string, string>;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Server is waking up. Please wait a moment and try again.';
  }

  if (!error.response) {
    return 'Cannot reach server. Check your internet connection and try again.';
  }

  const data = error.response.data as ApiErrorBody | undefined;
  if (data?.details && typeof data.details === 'object') {
    const first = Object.values(data.details).find((v) => typeof v === 'string');
    if (first) return first;
  }

  if (data?.message) return data.message;
  return fallback;
}
