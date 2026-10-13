import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Datorns IP hämtas från Expo-servern (t.ex. "10.25.9.250:8081" -> "10.25.9.250"),
// så adressen följer med när du byter nätverk
const devHost = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";

// Sätt EXPO_PUBLIC_API_URL i mobile/.env.local för att använda en https-tunnel
// (krävs för GitHub-inloggning på iPhone)
const tunnelUrl = process.env.EXPO_PUBLIC_API_URL;

export const authClient = createAuthClient({
  // Webben når servern via localhost, telefon/emulator behöver datorns IP
  baseURL:
    Platform.OS === "web"
      ? "http://localhost:3000"
      : (tunnelUrl ?? `http://${devHost}:3000`),
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "mobile",
      storage: SecureStore,
    }),
  ],
});
