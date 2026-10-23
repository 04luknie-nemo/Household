import { ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
    <View style={{ gap: 16, padding: 16 }}>
      <Text>Gå med i hushåll</Text>

      <TextInput
        value={inviteCode}
        onChangeText={setInviteCode}
        placeholder="Skriv in anslutningskoden"
        autoCapitalize="characters"
        autoCorrect={false}
        style={ui.input}
      />

      <Pressable
        style={ui.button}
        disabled={!inviteCode.trim() || joinMutation.isPending}
        onPress={() => joinMutation.mutate()}
      >
        <Text style={ui.buttonText}>
          {joinMutation.isPending ? "Går med..." : "Gå med"}
        </Text>
      </Pressable>
      {joinMutation.isError && (
        <Text>{getErrorMessage(joinMutation.error)}</Text>
      )}
    </View>
  );
}
