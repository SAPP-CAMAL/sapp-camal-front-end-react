import { HTTPError } from "ky";

interface BackendErrorBody {
  message?: string;
  data?: string;
}

export async function getFairErrorMessage(
  error: unknown,
  fallback: string
): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.json()) as BackendErrorBody;
      return body?.message || body?.data || fallback;
    } catch {
      return fallback;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return error instanceof HTTPError ? error.response.status : undefined;
}
