import { colors, spacing, typography } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { FlatList, Text } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";
import TaskRow from "./task-row";

type Task = {
  id: string;
  title: string;
  doneTodayBy: number[];
  daysSinceLast: number;
  isOverdue: boolean;
};

export default function TaskList() {
  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const {
    data: tasks,
    isPending,
    error,
  } = useQuery<Task[]>({
    queryKey: ["tasks", userId, sessionId, activeHouseholdId],
    enabled: !!activeHouseholdId && !!userId,
    queryFn: ({ signal }) =>
      apiFetch<Task[]>(`/api/households/${activeHouseholdId}/tasks`, {
        signal,
      }),
  });

  if (isPending) {
    return <Text style={[typography.body, {color: colors.pending}]}>Hämtar sysslor</Text>;
  }

  if (error) {
    return <Text style={[typography.body]}>Kunde inte hämta sysslorna. Försök igen senare...</Text>
  }

  return (
    <FlatList
      contentContainerStyle={{ gap: spacing.sm, padding: spacing.xs }}
      data={tasks}
      keyExtractor={(task) => task.id}
      ListEmptyComponent={
        <Text style={typography.title}>Det finns inga sysslor ännu</Text>
      }
      renderItem={({ item }) => (
        <TaskRow
          title={item.title}
          doneTodayBy={item.doneTodayBy}
          daysSinceLast={item.daysSinceLast}
          isOverdue={item.isOverdue}
        />
      )}
    ></FlatList>
  );
}
