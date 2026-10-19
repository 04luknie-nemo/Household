import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiUrl, authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

export default function CreateHousehold() {
  const [name, setName] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [code, setCode] = useState("");

  const makeAuthenticationReq = async () => {
    const cookies = await authClient.getCookie();
    const headers = {
      Cookie: cookies,
    };
    const res = await fetch(apiUrl + "/api/households", {
      method: "Post",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      credentials: Platform.OS === "web" ? "include" : "omit",
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const data = await res.json();
    return data;
  };

  const createMutation = useMutation({
    mutationFn: makeAuthenticationReq,
    onSuccess: (data) => {
      setCode(data.inviteCode);
      setIsCreated(true);
    },
  });

  function handleCopy() {
    console.log("Copied!");
  }
  return (
    <View
      style={{
        gap: spacing.md,
        padding: spacing.md,
      }}
    >
      <View style={{ alignItems: "center", gap: spacing.lg }}>
        <View style={ui.iconCircle}>
          <Ionicons name="home-outline" size={32} color={colors.onPrimary} />
        </View>
        <Text style={[typography.body, { textAlign: "center" }]}>
          Skapa ett hushåll och bjud in familj eller vänner.
        </Text>
      </View>
      <View style={ui.card}>
        <Text style={typography.label}>Hushållets namn här</Text>
        <TextInput
          style={ui.input}
          placeholder="T.ex. Familjen Andersson"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          editable={!isCreated}
        />
      </View>
      {!isCreated ? (
        <View style={{ gap: spacing.md }}>
          <Pressable
            style={ui.button}
            onPress={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <Text style={ui.buttonText}>Skapa hushåll</Text>
          </Pressable>
          {createMutation.error && (
            <Text style={{ color: colors.primary }}>
              {createMutation.error.message}
            </Text>
          )}
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.caption, { textAlign: "center" }]}>
              En unik hushållskod genereras när hushållet skapas.
            </Text>
            <Text style={[typography.caption, { textAlign: "center" }]}>
              Dela koden för att bjuda in andra.
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <View style={ui.card}>
            <Text style={typography.label}>Hushållskod</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={typography.title}>{code}</Text>
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
                onPress={handleCopy}
              >
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={{ color: colors.primary }}>Kopiera</Text>
              </Pressable>
            </View>
          </View>
          <Link href="/select-household" asChild dismissTo>
            <Pressable style={ui.button}>
              <Text style={ui.buttonText}>Fortsätt</Text>
            </Pressable>
          </Link>
          <Text style={[typography.caption, { textAlign: "center" }]}>
            Dela koden med familj eller vänner så att de kan gå med i ditt
            hushåll.
          </Text>
        </View>
      )}
    </View>
  );
}
