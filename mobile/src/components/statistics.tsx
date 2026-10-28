import { apiPeriods, periods } from "@/constants/periods";
import {
  emptyText,
  position,
  statisticsStyles as styles,
  typography,
} from "@/constants/theme";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";
import StatisticsPie from "./statistics-pie";
import { statsQueryOptions } from "@/lib/stats";

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
  } = useQuery(
    statsQueryOptions(userId, sessionId, activeHouseholdId, apiPeriod),
  );

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
        <Text style={[typography.body, position.horizontalCenter]}>
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
        <Text style={emptyText.title}>
          Inga sysslor har gjorts denna period.
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
