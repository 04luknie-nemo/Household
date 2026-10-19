import { apiUrl, authClient } from "@/lib/auth-client";
import { Platform } from "react-native";

// T, användaren hjälper typescript genom att säga vad som kommer tillbaka, då fångas typfel i ts kontroll

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Tomt svar krashar vid delete, i framtiden
  const res = await fetch(apiUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: await authClient.getCookie(),
      ...options.headers,
    },
    credentials: Platform.OS === "web" ? "include" : "omit",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = await res.json();
  return data;
}
