import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
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
    </View>
  );
}
