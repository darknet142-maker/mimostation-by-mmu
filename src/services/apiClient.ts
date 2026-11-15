import type {
  AuditLogEntry,
  FuelTransaction,
  NetworkConfig,
  Product,
  Pump,
  Reservation,
  Station,
  TankLevel,
} from '@/types';

/**
 * État standardisé d'une opération asynchrone distante (union discriminée sans booléens ambigus).
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: string;

  constructor(statusCode: number, code: string, message: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface NetworkSnapshotDto {
  networkConfig: NetworkConfig;
  stations: Station[];
  products: Product[];
  pumps: Pump[];
  tanks: TankLevel[];
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
}

/**
 * Indique si une API backend distante est configurée dans l'environnement courant.
 * Lorsqu'elle retourne false, l'application fonctionne explicitement en mode bac à sable local.
 */
export function isRemoteApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(
      0,
      'SANDBOX_MODE',
      'Aucun backend distant configuré (VITE_API_BASE_URL absent). Opération maintenue en bac à sable local.'
    );
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutHandle = globalThis.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener('abort', forwardAbort, { once: true });

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.idempotencyKey) {
    headers['X-Idempotency-Key'] = options.idempotencyKey;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `Erreur serveur HTTP ${response.status}`;
      let errorCode = `HTTP_${response.status}`;
      try {
        const parsed = (await response.json()) as { message?: string; code?: string };
        if (parsed.message) errorMessage = parsed.message;
        if (parsed.code) errorCode = parsed.code;
      } catch {
        // Corps non-JSON ignoré
      }
      throw new ApiError(response.status, errorCode, errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(408, 'REQUEST_ABORTED', 'Requête annulée ou délai dépassé.');
    }
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      err instanceof Error ? err.message : 'Erreur réseau inattendue.'
    );
  } finally {
    globalThis.clearTimeout(timeoutHandle);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}

export const stationProApi = {
  isRemoteApiConfigured,

  getNetworkSnapshot(signal?: AbortSignal): Promise<NetworkSnapshotDto> {
    return request<NetworkSnapshotDto>('/api/v1/network/snapshot', { signal });
  },

  createReservation(
    payload: {
      productId: string;
      stationId: string;
      quantity: number;
      paymentMethod: 'place' | 'mobile_money';
    },
    idempotencyKey: string,
    signal?: AbortSignal
  ): Promise<Reservation> {
    return request<Reservation>('/api/v1/reservations', {
      method: 'POST',
      body: payload,
      idempotencyKey,
      signal,
    });
  },

  confirmReservationPayment(
    reservationId: string,
    idempotencyKey: string,
    signal?: AbortSignal
  ): Promise<Reservation> {
    return request<Reservation>(`/api/v1/reservations/${encodeURIComponent(reservationId)}/confirm-payment`, {
      method: 'POST',
      idempotencyKey,
      signal,
    });
  },

  recordFuelTransaction(
    payload: Omit<FuelTransaction, 'id' | 'time' | 'status'>,
    idempotencyKey: string,
    signal?: AbortSignal
  ): Promise<FuelTransaction> {
    return request<FuelTransaction>('/api/v1/fuel-transactions', {
      method: 'POST',
      body: payload,
      idempotencyKey,
      signal,
    });
  },

  appendAuditLog(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'dateFormatted' | 'timeFormatted'>,
    signal?: AbortSignal
  ): Promise<AuditLogEntry> {
    return request<AuditLogEntry>('/api/v1/audit-ledger', {
      method: 'POST',
      body: entry,
      signal,
    });
  },
};
