import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { avatars } from "@/constants/avatars";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type TaskDetails = {
  id: string;
  title: string;
  description: string;
  reoccurInDays: number;
  worth: number;
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
  const { id } = useLocalSearchParams<{ id: string }>();

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const taskQuery = useQuery<TaskDetails>({
    queryKey: ["task", userId, sessionId, activeHouseholdId, id],
    enabled: !!userId && !!activeHouseholdId && !!id,
    queryFn: ({ signal }) =>
      apiFetch<TaskDetails>(
        `/api/households/${activeHouseholdId}/tasks/${id}`,
        { signal },
      ),
  });
  const tasksQuery = useQuery<
    {
      id: string;
      title: string;
      doneTodayBy: number[];
      daysSinceLast: number;
      isOverdue: boolean;
    }[]
  >({
    queryKey: ["tasks", userId, sessionId, activeHouseholdId],
    enabled: !!userId && !!activeHouseholdId,
    queryFn: ({ signal }) =>
      apiFetch(`/api/households/${activeHouseholdId}/tasks`, {
        signal,
      }),
  });
  const taskSummary = tasksQuery.data?.find((item) => item.id === id);

  const doneTodayBy = taskSummary?.doneTodayBy ?? [];
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}/tasks/${id}/complete`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["tasks", userId, sessionId, activeHouseholdId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["task", userId, sessionId, activeHouseholdId, id],
        }),
      ]);
    },
  });

  if (!activeHouseholdId) {
    return (
      <View>
        <Text>Välj ett hushåll först.</Text>
      </View>
    );
  }

  if (taskQuery.isPending) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Hämtar sysslan...</Text>
      </View>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <View>
        <Text>{taskQuery.error?.message ?? "Sysslan kunde inte hittas."}</Text>

        <Pressable onPress={() => taskQuery.refetch()}>
          <Text>Försök igen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <Text>{taskQuery.data.title}</Text>

      <Text>{taskQuery.data.description || "Ingen beskrivning finns."}</Text>

      <Text>Medverkande</Text>

      {tasksQuery.isPending ? (
        <ActivityIndicator />
      ) : tasksQuery.isError ? (
        <Text>Kunde inte hämta dagens medverkande.</Text>
      ) : doneTodayBy.length === 0 ? (
        <Text>Ingen har gjort sysslan idag ännu.</Text>
      ) : (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {doneTodayBy.map((avatarId, index) => {
            const avatar = avatars.find((item) => item.id === avatarId);

            if (!avatar) return null;

            return (
              <View
                key={`${avatarId}-${index}`}
                style={{
                  backgroundColor: avatar.color,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>{avatar.name}</Text>
              </View>
            );
          })}
        </View>
      )}
      {completeMutation.isError && (
        <Text accessibilityRole="alert">
          {getErrorMessage(completeMutation.error)}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Markera sysslan som gjord"
        disabled={completeMutation.isPending}
        onPress={() => completeMutation.mutate()}
      >
        {completeMutation.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text>Gjord</Text>
        )}
      </Pressable>
    </View>
  );
}
