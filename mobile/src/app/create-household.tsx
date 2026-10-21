import { HouseholdContext } from "@/components/household-provider";
import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Household = {
  id: string;
  name: string;
  inviteCode: string;
};

export default function CreateHousehold() {
  const [name, setName] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [code, setCode] = useState("");
  const { setActiveHouseholdId } = useContext(HouseholdContext);

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Household>("/api/households", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: (data) => {
      setCode(data.inviteCode);
      setIsCreated(true);
      setActiveHouseholdId(data.id);
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
