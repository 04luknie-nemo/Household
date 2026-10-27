import { apiPeriods, periods } from "@/constants/periods";
import {
  position,
  statisticsStyles as styles,
  typography,
} from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";
import StatisticsPie, { type MemberPoints } from "./statistics-pie";

type MemberTotal = MemberPoints & {
  nickname: string;
};

type TaskStats = {
  taskId: string;
  title: string;
  members: MemberPoints[];
};

type Stats = {
  total: MemberTotal[];
  perTask: TaskStats[];
};

export default function StatisticsView({ period }: { period: number }) {
  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const apiPeriod = apiPeriods[period];

  const {
    data: stats,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery<Stats>({
    queryKey: ["stats", userId, sessionId, activeHouseholdId, apiPeriod],
    enabled: !!activeHouseholdId && !!userId && !!apiPeriod,
    queryFn: ({ signal }) =>
      apiFetch<Stats>(
        `/api/households/${activeHouseholdId}/stats?period=${apiPeriod}`,
        { signal },
      ),
  });

  if (!apiPeriod) {
    return null;
  }

  if (isPending) {
    return (
      <Text style={typography.body}>
        Hämtar statistik för {periods[period]}…
      </Text>
    );
  }
  if (error) {
    return (
      <View style={styles.content}>
        <Text style={[typography.body, position.horizantalCenter]}>
          Kunde inte hämta statistiken. Kontrollera nätverksanslutningen och
          försök igen senare...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      }
    >
      {stats.total.length === 0 ? (
        <Text style={[typography.title, position.horizantalCenter]}>
          Inga sysslor har gjorts denna perioden.
        </Text>
      ) : (
        <>
          <StatisticsPie title="Totalt" members={stats.total} large />
          <View style={styles.grid}>
            {stats.perTask.map((task) => (
              <View key={task.taskId} style={styles.task}>
                <StatisticsPie title={task.title} members={task.members} />
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
