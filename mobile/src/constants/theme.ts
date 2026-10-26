import { StyleSheet, type TextStyle } from "react-native";

// Färger och stilar från Figma (#14). Använd dessa i stället för egna värden.
// Avatarernas färger finns i avatars.ts. Diagrammen använder också dem.
export const colors = {
  primary: "#CC5C6E",
  onPrimary: "#FFFFFF",
  background: "#F1F1F1",
  card: "#FFFFFF",
  input: "#F1F1F1",
  border: "#E0E0E0",
  text: "#323232",
  textMuted: "#969696",
  owner: "#F29741",
  ownerBackground: "#FCEDDE",
  member: "#64B5F4",
  memberBackground: "#E7F3FD",
  pending: "#F4AFBF",
  pendingBackground: "#FCF1F4",
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
  title: { fontSize: 24, fontWeight: "600", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  label: { fontSize: 14, fontWeight: "600", color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
} satisfies Record<string, TextStyle>;

export const position = StyleSheet.create({
  horizantalCenter: {
    display: "flex",
    justifyContent: "center",
  },
});

export const statisticsStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingVertical: spacing.lg, gap: spacing.lg },
  diagram: { alignItems: "center", gap: spacing.xs, width: "100%" },
  totalChart: { width: 190, aspectRatio: 1 },
  taskChart: { width: "100%", maxWidth: 108, aspectRatio: 1 },
  title: { ...typography.label, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.md },
  task: { width: "33.333%", paddingHorizontal: spacing.xs },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
  },
  legendText: { ...typography.caption, color: colors.text },
});

// Gemensamma stilar för komponenter som finns på flera skärmar i Figma.
// Kombinera med en array, t.ex. style={[ui.card, ui.cardSelected]}.
export const ui = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardPending: {
    backgroundColor: colors.background,
    boxShadow: "none",
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + spacing.xs,
    alignItems: "center",
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    color: colors.primary,
  },
  // Modalens bottenrad: Spara och Stäng sida vid sida utan rundade hörn.
  modalBar: {
    flexDirection: "row",
  },
  modalBarButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: 12,
    overflow: "hidden",
  },
  badgeOwner: {
    color: colors.owner,
    backgroundColor: colors.ownerBackground,
  },
  badgeMember: {
    color: colors.member,
    backgroundColor: colors.memberBackground,
  },
  badgePending: {
    color: colors.pending,
    backgroundColor: colors.pendingBackground,
  },
  // Siffran i dagsvyn: grå för dagar sedan, röd för försenad.
  dayCount: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 24,
    overflow: "hidden",
  },
  dayCountOverdue: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  // Primärfärgad cirkel med vit ikon, som på splash och Skapa hushåll.
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
