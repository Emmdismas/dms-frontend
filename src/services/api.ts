/**
 * Thin fetch wrapper around the Laravel REST API (/api/v1).
 * - Sends the Sanctum bearer token.
 * - Sends X-Dealer-Id when a super admin is working inside a dealer.
 * - Normalizes errors into ApiError with field-level validation messages.
 */
const TOKEN_KEY = 'dms_token';
const DEALER_CTX_KEY = 'dms_dealer_context';
const DEFAULT_PROD_BACKEND = 'https://dms-dealer-vajw.onrender.com/api/v1';

function resolveApiBaseUrl(): string {
  const env = (import.meta as any).env || {};
  const rawEnvUrl = (
    env.VITE_API_BASE_URL ||
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    ''
  ).trim();

  if (rawEnvUrl) {
    const cleaned = rawEnvUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return DEFAULT_PROD_BACKEND;
  }

  return '/api/v1';
}

const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  /** First validation message of a field, if any. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Dealer context used by a super admin when "entering" a dealer (sent as X-Dealer-Id). */
export const dealerContext = {
  get: (): string | null => sessionStorage.getItem(DEALER_CTX_KEY),
  set: (dealerId: string | number) => sessionStorage.setItem(DEALER_CTX_KEY, String(dealerId)),
  clear: () => sessionStorage.removeItem(DEALER_CTX_KEY),
};

type Listener = () => void;
let unauthorizedListener: Listener | null = null;
export const onUnauthorized = (fn: Listener) => {
  unauthorizedListener = fn;
};

export async function api<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const ctx = dealerContext.get();
  if (ctx) headers['X-Dealer-Id'] = ctx;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0);
  }

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token && unauthorizedListener) unauthorizedListener();
    throw new ApiError(
      data?.message || 'Something went wrong. Please try again.',
      res.status,
      data?.errors || {},
    );
  }

  return data as T;
}

export const http = {
  get: <T = any>(path: string) => api<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => api<T>('POST', path, body ?? {}),
  put: <T = any>(path: string, body?: unknown) => api<T>('PUT', path, body ?? {}),
  delete: <T = any>(path: string) => api<T>('DELETE', path),
};
