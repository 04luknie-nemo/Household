import type { TextStyle } from "react-native";

// Färger och stilar från Figma (#14). Använd dessa i stället för egna värden.
// Avatarernas färger finns i avatars.ts.
export const colors = {
  primary: "#CC5C6E",
  onPrimary: "#FFFFFF",
  background: "#F1F1F1",
  card: "#FFFFFF",
  border: "#E0E0E0",
  text: "#323232",
  textMuted: "#969696",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
};

export const typography = {
  title: { fontSize: 20, fontWeight: "600", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  label: { fontSize: 14, fontWeight: "600", color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
} satisfies Record<string, TextStyle>;
