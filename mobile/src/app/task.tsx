import { AuthContext } from "@/components/auth-provider";
import Avatar from "@/components/avatar";
import { HouseholdContext } from "@/components/household-provider";
import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

type HouseholdMember = {
  id: string;
  nickname: string;
  avatarId: number;
  isOwner: boolean;
};

type HouseholdListItem = {
  id: string;
  name: string;
  status: string;
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

  const membersQuery = useQuery<HouseholdMember[]>({
    queryKey: ["members", userId, sessionId, activeHouseholdId],
    enabled: !!userId && !!activeHouseholdId,
    queryFn: ({ signal }) =>
      apiFetch<HouseholdMember[]>(
        `/api/households/${activeHouseholdId}/members`,
        { signal },
      ),
  });

  const task = taskQuery.data;
  const taskSummary = tasksQuery.data?.find((item) => item.id === taskId);
  const doneTodayBy = taskSummary?.doneTodayBy ?? [];

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
        queryClient.invalidateQueries({
          queryKey: ["stats"],
        }),
      ]);
    },
  });

  const { data: households } = useQuery({
    queryKey: ["households", userId, sessionId],
    queryFn: ({ signal }) =>
      apiFetch<HouseholdListItem[]>("/api/households", { signal }),
  });

  const isOwner =
    households?.find((h) => h.id === activeHouseholdId)?.isOwner ?? false;
  const [warningOpen, setWarningOpen] = useState(false);

  async function onTaskRemoved() {
    setWarningOpen(false);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["stats"] }),
    ]);
    router.back();
  }

  const archiveTaskMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}/tasks/${taskId}/archive`, {
        method: "POST",
      }),
    onSuccess: onTaskRemoved,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}/tasks/${taskId}`, {
        method: "DELETE",
      }),
    onSuccess: onTaskRemoved,
  });

  const isRemoving =
    archiveTaskMutation.isPending || deleteTaskMutation.isPending;
  const removeError = archiveTaskMutation.error ?? deleteTaskMutation.error;

  function closeWarning() {
    archiveTaskMutation.reset();
    deleteTaskMutation.reset();
    setWarningOpen(false);
  }

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
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={[typography.title, styles.title]}>{task.title}</Text>
        </View>

        <View style={ui.card}>
          <Text style={typography.label}>Beskrivning</Text>
          <Text style={typography.body}>
            {task.description?.trim() || "Ingen beskrivning finns."}
          </Text>
        </View>

        {isOwner && (
          <Pressable
            style={styles.removeLink}
            onPress={() => setWarningOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Ta bort ${task.title}`}
          >
            <Text style={styles.removeLinkText}>Ta bort syssla</Text>
          </Pressable>
        )}

        <Modal
          visible={isOwner && warningOpen}
          transparent
          animationType="fade"
          onRequestClose={closeWarning}
        >
          <View style={styles.overlay}>
            <View style={[ui.card, styles.dialog]}>
              <Text style={typography.label}>Ta bort {task.title}?</Text>
              <Text style={typography.body}>
                Om du tar bort sysslan försvinner också statistiken för den. Du
                kan arkivera den i stället, så att statistiken finns kvar.
              </Text>

              <Pressable
                style={ui.button}
                onPress={() => archiveTaskMutation.mutate()}
                disabled={isRemoving}
              >
                <Text style={ui.buttonText}>
                  {archiveTaskMutation.isPending ? "Arkiverar..." : "Arkivera"}
                </Text>
              </Pressable>

              <Pressable
                style={[ui.button, ui.buttonSecondary]}
                onPress={() => deleteTaskMutation.mutate()}
                disabled={isRemoving}
              >
                <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
                  {deleteTaskMutation.isPending ? "Tar bort..." : "Ta bort"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.cancel}
                onPress={closeWarning}
                disabled={isRemoving}
              >
                <Text style={typography.body}>Avbryt</Text>
              </Pressable>

              {removeError && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {getErrorMessage(removeError)}
                </Text>
              )}
            </View>
          </View>
        </Modal>
        <View style={styles.contributors}>
          <Text style={typography.label}>Medverkande</Text>

          {tasksQuery.isPending || membersQuery.isPending ? (
            <ActivityIndicator color={colors.primary} />
          ) : tasksQuery.isError || membersQuery.isError ? (
            <Text style={typography.body}>
              Kunde inte hämta dagens medverkande.
            </Text>
          ) : doneTodayBy.length === 0 ? (
            <Text style={typography.caption}>
              Ingen har gjort sysslan idag ännu.
            </Text>
          ) : (
            <View style={styles.avatarList}>
              {doneTodayBy.map((avatarId) => {
                const member = membersQuery.data?.find(
                  (item) => item.avatarId === avatarId,
                );

                return (
                  <View key={avatarId} style={styles.contributor}>
                    <Avatar avatarId={avatarId} />

                    <Text style={typography.caption}>
                      {member?.nickname || "Okänd"}
                    </Text>
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
    </SafeAreaView>
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
  contributor: {
    alignItems: "center",
    gap: spacing.xs,
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
  removeLink: {
    alignSelf: "center",
    padding: spacing.sm,
  },
  removeLinkText: {
    ...typography.label,
    color: colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    gap: spacing.md,
  },
  cancel: {
    alignSelf: "center",
    padding: spacing.sm,
  },
});
