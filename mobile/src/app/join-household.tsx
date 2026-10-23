import { ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function JoinHousehold() {
  const [inviteCode, setInviteCode] = useState("");
  const joinMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/households/join", {
        method: "POST",
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      }),
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
    </View>
  );
}
