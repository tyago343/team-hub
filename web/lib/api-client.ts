import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "./auth-cookies";

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  );
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(
      typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `API error ${status}`,
    );
    this.name = "ApiError";
  }
}

export type ApiClientOptions = RequestInit & {
  /** Attach `Authorization: Bearer` from httpOnly access cookie (server-side). */
  auth?: boolean;
  /** If true (default), on 401 with auth, try refresh once and retry. */
  retryOn401?: boolean;
};

async function refreshSession(): Promise<boolean> {
  const refresh = await getRefreshToken();
  if (!refresh) {
    return false;
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    await clearAuthCookies();
    return false;
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  await setAuthCookies(data.accessToken, data.refreshToken);
  return true;
}

async function buildHeaders(
  init: RequestInit | undefined,
  auth: boolean,
): Promise<Headers> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

export async function apiClient<T>(
  path: string,
  options?: ApiClientOptions,
): Promise<T> {
  const { auth = false, retryOn401 = true, ...init } = options ?? {};
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const doFetch = async (): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: await buildHeaders(init, auth),
    });

  let res = await doFetch();

  if (res.status === 401 && auth && retryOn401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(url, {
        ...init,
        headers: await buildHeaders(init, auth),
      });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
