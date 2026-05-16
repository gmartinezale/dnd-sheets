import { AppError } from '@/core/errors/AppError';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Minimal fetch wrapper.
 * - Enforces timeout.
 * - Returns typed JSON or throws AppError.
 * - Never logs response bodies.
 */
export async function httpGet<T>(url: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw AppError.network(
        `HTTP ${response.status} from ${url}`,
      );
    }

    const data: unknown = await response.json();
    return data as T;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.network(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw AppError.network(`Request to ${url} failed`, err);
  } finally {
    clearTimeout(timer);
  }
}
