import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { avatars } from "@/constants/avatars";
import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TaskDetails = {
  id: string;
  title: string;
  description: string;
  reoccurInDays: number;
  worth: number;
};

type TaskSummary = {
  id: string;
  title: string;
  doneTodayBy: number[];
  daysSinceLast: number;
  isOverdue: boolean;
};

type Household = {
  id: string;
  name: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
};

function getErrorMessage(error: Error) {
  try {
    const body = JSON.parse(error.message) as {
      error?: string;
      message?: string;
    };

    return body.error ?? body.message ?? error.message;
  } catch {
    return error.message || "Något gick fel. Försök igen.";
  }
}

export default function Task() {
  const { id: paramId } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(paramId) ? paramId[0] : paramId;

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const taskQuery = useQuery<TaskDetails>({
    queryKey: ["task", userId, sessionId, activeHouseholdId, taskId],
    enabled: !!userId && !!activeHouseholdId && !!taskId,
    queryFn: ({ signal }) =>
      apiFetch<TaskDetails>(
        `/api/households/${activeHouseholdId}/tasks/${taskId}`,
        { signal },
      ),
  });

  const tasksQuery = useQuery<TaskSummary[]>({
    queryKey: ["tasks", userId, sessionId, activeHouseholdId],
    enabled: !!userId && !!activeHouseholdId,
    queryFn: ({ signal }) =>
      apiFetch<TaskSummary[]>(`/api/households/${activeHouseholdId}/tasks`, {
        signal,
      }),
  });

  const householdsQuery = useQuery<Household[]>({
    queryKey: ["households", userId, sessionId],
    enabled: !!userId && !!activeHouseholdId,
    queryFn: ({ signal }) =>
      apiFetch<Household[]>("/api/households", { signal }),
  });

  const task = taskQuery.data;
  const taskSummary = tasksQuery.data?.find((item) => item.id === taskId);
  const doneTodayBy = taskSummary?.doneTodayBy ?? [];

  const activeHousehold = householdsQuery.data?.find(
    (household) => household.id === activeHouseholdId,
  );

  const isOwner =
    activeHousehold?.status === "active" && activeHousehold.isOwner;

  const completeMutation = useMutation({
    mutationFn: () =>
      apiFetch(
        `/api/households/${activeHouseholdId}/tasks/${taskId}/complete`,
        { method: "POST" },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["tasks", userId, sessionId, activeHouseholdId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["task", userId, sessionId, activeHouseholdId, taskId],
        }),
      ]);
    },
  });

  if (!activeHouseholdId) {
    return (
      <View style={styles.messageContainer}>
        <Text style={typography.body}>Välj ett hushåll först.</Text>
      </View>
    );
  }

  if (taskQuery.isPending) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={typography.body}>Hämtar sysslan...</Text>
      </View>
    );
  }

  if (taskQuery.isError || !task) {
    return (
      <View style={styles.messageContainer}>
        <Text style={typography.body}>
          {taskQuery.error
            ? getErrorMessage(taskQuery.error)
            : "Sysslan kunde inte hittas."}
        </Text>
        <Pressable style={ui.button} onPress={() => taskQuery.refetch()}>
          <Text style={ui.buttonText}>Försök igen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={[typography.title, styles.title]}>{task.title}</Text>

          {isOwner && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ändra syssla"
              onPress={() =>
                router.push({
                  pathname: "/task-modal",
                  params: { id: task.id },
                })
              }
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={24} color={colors.text} />
            </Pressable>
          )}
        </View>

        <View style={ui.card}>
          <Text style={typography.label}>Beskrivning</Text>
          <Text style={typography.body}>
            {task.description?.trim() || "Ingen beskrivning finns."}
          </Text>
        </View>

        <View style={styles.contributors}>
          <Text style={typography.label}>Medverkande</Text>

          {tasksQuery.isPending ? (
            <ActivityIndicator color={colors.primary} />
          ) : tasksQuery.isError ? (
            <Text style={typography.body}>
              Kunde inte hämta dagens medverkande.
            </Text>
          ) : doneTodayBy.length === 0 ? (
            <Text style={typography.caption}>
              Ingen har gjort sysslan idag ännu.
            </Text>
          ) : (
            <View style={styles.avatarList}>
              {doneTodayBy.map((avatarId, index) => {
                const avatar = avatars.find((item) => item.id === avatarId);

                if (!avatar) return null;

                return (
                  <View
                    key={`${avatarId}-${index}`}
                    style={[styles.avatar, { backgroundColor: avatar.color }]}
                  >
                    <Text style={styles.avatarText}>{avatar.name}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {completeMutation.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {getErrorMessage(completeMutation.error)}
          </Text>
        )}

        {completeMutation.isSuccess && (
          <Text accessibilityRole="alert" style={styles.success}>
            Sysslan markerades som gjord!
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Markera sysslan som gjord"
          style={[
            ui.button,
            styles.completeButton,
            completeMutation.isPending && styles.disabledButton,
          ]}
          disabled={completeMutation.isPending}
          onPress={() => completeMutation.mutate()}
        >
          {completeMutation.isPending ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={ui.buttonText}>Gjord</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  messageContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
  },
  contributors: {
    gap: spacing.md,
  },
  avatarList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  avatar: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  avatarText: {
    fontSize: 20,
  },
  footer: {
    padding: spacing.md,
  },
  completeButton: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  error: {
    ...typography.body,
    color: colors.primary,
  },
  success: {
    ...typography.body,
    color: colors.text,
  },
});
