import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
type HouseholdDetail = {
  id: string;
  name: string;
  inviteCode: string;
};

type HouseholdListItem = {
  id: string;
  name: string;
  status: string;
  isOwner: boolean;
};

export default function Household() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const {
    data: household,
    isPending: householdPending,
    error: householdError,
  } = useQuery({
    queryKey: ["households", activeHouseholdId],
    queryFn: () =>
      apiFetch<HouseholdDetail>(`/api/households/${activeHouseholdId}`),
    enabled: activeHouseholdId !== null,
  });

  const { data: households } = useQuery({
    queryKey: ["households", userId, sessionId],
    queryFn: ({ signal }) =>
      apiFetch<HouseholdListItem[]>("/api/households", { signal }),
  });

  const isOwner =
    households?.find((h) => h.id === activeHouseholdId)?.isOwner ?? false;

  function startEdit() {
    setName(household?.name ?? "");
    setIsEditing(true);
  }
  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });

  if (householdPending) return <Text>Laddar...</Text>;
  if (householdError) return <Text>{householdError.message}</Text>;
  return (
    <View style={{ gap: spacing.md, padding: spacing.md }}>
      <View style={ui.card}>
        <View style={[ui.iconCircle, styles.center]}>
          <Ionicons name="home-outline" size={32} color={colors.onPrimary} />
        </View>
        <View>
          {isEditing ? (
            <View style={styles.edit}>
              <TextInput value={name} onChangeText={setName} style={ui.input} />
              <View style={styles.actions}>
                <Pressable
                  style={[ui.button, styles.action]}
                  onPress={() => renameMutation.mutate()}
                  disabled={renameMutation.isPending}
                >
                  <Text style={ui.buttonText}>Spara</Text>
                </Pressable>
                <Pressable
                  style={[ui.button, ui.buttonSecondary, styles.action]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
                    Avbryt
                  </Text>
                </Pressable>
              </View>
              {renameMutation.error && (
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {renameMutation.error.message}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.row}>
              <Text style={typography.title}>{household?.name}</Text>
              {isOwner && (
                <Pressable
                  onPress={startEdit}
                  hitSlop={12}
                  accessibilityLabel="Ändra namn"
                >
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>
        {/* <Text>Antal medlemmar</Text> */}
      </View>
      <View style={ui.card}>
        <Text style={typography.label}>Anslutningskod</Text>
        <Text style={typography.title}>{household?.inviteCode}</Text>
        <Text style={typography.caption}>
          Dela koden för att bjuda in andra till hushållet
        </Text>
      </View>
      {/* VG Krav finns i issue #77 <View style={ui.card}>
        <Text style={typography.label}>Medlemmar</Text>
        <FlatList data={listan med aktiva hushållets medlemmar} />
      </View>
      <View style={ui.card}>
        <Text style={typography.body}>Ansökningar</Text>
      </View> */}
    </View>
  );
}
const styles = StyleSheet.create({
  center: {
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  edit: {
    gap: spacing.sm,
  },
});
