import { apiUrl, authClient } from "@/lib/auth-client";
import { Platform } from "react-native";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(apiUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(Platform.OS === "web"
        ? {}
        : { Cookie: await authClient.getCookie() }),
      ...options.headers,
    },
    credentials: Platform.OS === "web" ? "include" : "omit",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
