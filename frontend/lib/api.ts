import type { ApiErrorBody, LoginResponse, User } from "./types";

let accessToken: string | null = null;
let refreshPromise: Promise<User | null> | null = null;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string> | null;

  constructor(status: number, code: string, message: string, details?: Record<string, string> | null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return (text ? text : undefined) as T | undefined;
  }
  return (await response.json()) as T;
}

async function refreshAccessToken(): Promise<User | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        if (!response.ok) {
          accessToken = null;
          return null;
        }
        const data = (await response.json()) as LoginResponse;
        accessToken = data.accessToken;
        return data.user;
      } catch {
        accessToken = null;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { retry?: boolean; skipRefresh?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  const isAuthCall = path.includes("/auth/login") || path.includes("/auth/refresh");
  if (response.status === 401 && !isAuthCall && options.skipRefresh !== true && options.retry !== false) {
    const user = await refreshAccessToken();
    if (user) {
      return apiFetch<T>(path, init, { retry: false });
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:expired"));
    }
  }

  const body = await parseBody<T | ApiErrorBody>(response);
  if (!response.ok) {
    const errorBody = body as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      errorBody?.code ?? "ERROR",
      errorBody?.message ?? "Não foi possível concluir a solicitação.",
      errorBody?.details,
    );
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

export async function restoreSession(): Promise<User | null> {
  return refreshAccessToken();
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ email, password }),
  });
  const body = (await parseBody<LoginResponse | ApiErrorBody>(response)) as
    | LoginResponse
    | ApiErrorBody
    | undefined;
  if (!response.ok) {
    const errorBody = body as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      errorBody?.code ?? "ERROR",
      errorBody?.message ?? "Não foi possível entrar.",
      errorBody?.details,
    );
  }
  const data = body as LoginResponse;
  if (!data.mfaRequired && data.accessToken) {
    accessToken = data.accessToken;
  }
  return data;
}

export async function mfaVerifyRequest(challengeToken: string, code: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>(
    "/api/v1/auth/mfa/verify",
    {
      method: "POST",
      body: JSON.stringify({ challengeToken, code }),
    },
    { skipRefresh: true },
  );
  if (data.accessToken) accessToken = data.accessToken;
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiFetch<void>("/api/v1/auth/logout", { method: "POST" }, { skipRefresh: true });
  } finally {
    accessToken = null;
  }
}
