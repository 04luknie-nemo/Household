import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

function getErrorMessage(error: Error) {
  try {
    const body = JSON.parse(error.message) as {
      error?: string;
      message?: string;
    };

    return body.error ?? body.message ?? "Något gick fel.";
  } catch {
    return error.message || "Något gick fel.";
  }
}

export default function JoinHousehold() {
  const [inviteCode, setInviteCode] = useState("");
  const queryClient = useQueryClient();
  const joinMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/households/join", {
        method: "POST",
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["households"],
      });

      router.replace("/select-household");
    },
  });

  return (
    <View style={styles.container}>
      <View style={ui.iconCircle}>
        <Ionicons name="people-outline" size={28} color={colors.onPrimary} />
      </View>

      <Text style={[typography.body, styles.description]}>
        Ange hushållets kod för att gå med i ett befintligt hushåll.
      </Text>

      <View style={styles.formCard}>
        <Text style={typography.label}>Hushållskod</Text>

        <TextInput
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Ange hushållskod"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={ui.input}
          editable={!joinMutation.isPending}
          accessibilityLabel="Hushållskod"
        />
        {joinMutation.isError && (
          <Text style={styles.error}>
            {getErrorMessage(joinMutation.error)}
          </Text>
        )}
      </View>

      <Pressable
        style={[
          styles.submitButton,
          (!inviteCode.trim() || joinMutation.isPending) &&
            styles.disabledButton,
        ]}
        disabled={!inviteCode.trim() || joinMutation.isPending}
        onPress={() => joinMutation.mutate()}
      >
        <Text style={ui.buttonText}>
          {joinMutation.isPending ? "Skickar förfrågan..." : "Skicka förfrågan"}
        </Text>
      </Pressable>
      <Text style={[typography.caption, styles.helperText]}>
        En ägare av hushållet behöver godkänna din förfrågan innan du kan gå
        med.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    alignItems: "center",
  },
  description: {
    ...typography.body,
    textAlign: "center",
    width: "100%",
    marginBottom: spacing.sm,
  },
  formCard: {
    ...ui.card,
    width: "100%",
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  input: {
    ...ui.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    ...ui.button,
    width: "100%",
    marginTop: spacing.sm,
  },
  error: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
  },
  disabledButton: {
    opacity: 0.5,
  },
  helperText: {
    ...typography.caption,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});
