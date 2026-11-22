import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  api,
  apiFetch,
  getAccessToken,
  setAccessToken,
} from "@/lib/api";

type Call = { url: string; init: RequestInit };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("lib/api", () => {
  let calls: Call[];

  beforeEach(() => {
    calls = [];
    setAccessToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it("refreshes once on 401 and retries the original request", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input);
      calls.push({ url, init });
      if (url === "/api/v1/auth/refresh") {
        return jsonResponse(200, {
          accessToken: "new-access",
          user: { id: "u1", name: "Ana", email: "ana@example.com" },
        });
      }
      const headers = new Headers(init.headers);
      if (headers.get("Authorization") === "Bearer new-access") {
        return jsonResponse(200, { ok: true });
      }
      return jsonResponse(401, { code: "UNAUTHORIZED", message: "expirado" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await api.get<{ ok: boolean }>("/api/v1/progress/summary");

    expect(result).toEqual({ ok: true });
    expect(getAccessToken()).toBe("new-access");
    const retried = calls.filter((call) => call.url === "/api/v1/progress/summary");
    expect(retried).toHaveLength(2);
    expect(new Headers(retried[1].init.headers).get("Authorization")).toBe("Bearer new-access");
  });

  it("shares a single refresh across concurrent 401 responses", async () => {
    let refreshResolve: ((response: Response) => void) | undefined;
    const refreshGate = new Promise<Response>((resolve) => {
      refreshResolve = resolve;
    });
    let refreshCalls = 0;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input);
      if (url === "/api/v1/auth/refresh") {
        refreshCalls += 1;
        return refreshGate;
      }
      const headers = new Headers(init.headers);
      if (headers.get("Authorization") === "Bearer shared") {
        return jsonResponse(200, { url });
      }
      return jsonResponse(401, { code: "UNAUTHORIZED", message: "expirado" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = api.get<{ url: string }>("/api/v1/a");
    const second = api.get<{ url: string }>("/api/v1/b");
    await Promise.resolve();
    refreshResolve?.(
      jsonResponse(200, {
        accessToken: "shared",
        user: { id: "u1", name: "Ana", email: "ana@example.com" },
      }),
    );

    await expect(Promise.all([first, second])).resolves.toEqual([
      { url: "/api/v1/a" },
      { url: "/api/v1/b" },
    ]);
    expect(refreshCalls).toBe(1);
  });

  it("dispatches auth:expired when refresh fails", async () => {
    const expired = vi.fn();
    window.addEventListener("auth:expired", expired);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/v1/auth/refresh") {
        return jsonResponse(401, { code: "UNAUTHORIZED", message: "sem sessão" });
      }
      return jsonResponse(401, { code: "UNAUTHORIZED", message: "expirado" });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.get("/api/v1/users/me")).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    window.removeEventListener("auth:expired", expired);
  });

  it("maps 403, 404 and 500 envelopes to ApiError without losing the code", async () => {
    const cases = [
      [403, "FORBIDDEN", "sem permissão"],
      [404, "NOT_FOUND", "não encontrado"],
      [500, "INTERNAL_ERROR", "falha interna"],
    ] as const;

    for (const [status, code, message] of cases) {
      vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(status, { code, message })));
      await expect(apiFetch("/api/v1/anything", {}, { skipRefresh: true })).rejects.toEqual(
        new ApiError(status, code, message),
      );
    }
  });

  it("uses a safe fallback when an error body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("gateway down", { status: 502 })),
    );

    await expect(apiFetch("/api/v1/anything", {}, { skipRefresh: true })).rejects.toMatchObject({
      status: 502,
      code: "ERROR",
    });
  });

  it("does not attempt refresh for login failures", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(401, { code: "INVALID_CREDENTIALS", message: "E-mail ou senha inválidos." }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      api.post("/api/v1/auth/login", { email: "a@b.com", password: "x" }),
    ).rejects.toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
