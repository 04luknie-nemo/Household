import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import TaskList from "@/components/task-list";
import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Household = {
  id: string;
  name: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
};

export default function DayView() {
  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const { data: households, error } = useQuery<Household[]>({
    queryKey: ["households", userId, sessionId],
    enabled: !!userId && !!activeHouseholdId,
    queryFn: ({ signal }) =>
      apiFetch<Household[]>("/api/households", { signal }),
  });

  const activeHousehold = households?.find(
    (household) => household.id === activeHouseholdId,
  );

  const isOwner =
    activeHousehold?.status === "active" && activeHousehold?.isOwner === true;

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <TaskList />
      </View>

      {error && (
        <Text style={typography.body}>
          Kunde inte hämta hushållets behörigheter.
        </Text>
      )}

      {isOwner && (
        <View style={styles.footer}>
          <Pressable
            style={[ui.button, styles.addButton]}
            onPress={() => router.push("/task-modal")}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={typography.body}>Lägg till</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  addButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
});
