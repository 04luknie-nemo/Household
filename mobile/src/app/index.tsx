import { AuthContext } from "@/components/auth-provider";
import DayView from "@/components/day-view";
import { HouseholdContext } from "@/components/household-provider";
import StatisticsView from "@/components/statistics";
import { apiPeriods, periods } from "@/constants/periods";
import { typography } from "@/constants/theme";
import { statsQueryOptions } from "@/lib/stats";
import { useQueries } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [period, setPeriod] = useState<number>(0);

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const statsQueries = useQueries({
    queries: apiPeriods
      .filter((apiPeriod) => apiPeriod !== null)
      .map((apiPeriod) =>
        statsQueryOptions(userId, sessionId, activeHouseholdId, apiPeriod),
      ),
  });

  const hasStatsError = statsQueries.some((query) => query.isError);

  const visiblePeriods = [
    0,
    ...statsQueries.flatMap((query, index) =>
      (query.data?.total.length ?? 0) > 0 ? [index + 1] : [],
    ),
  ];

  const selectedPeriod = visiblePeriods.includes(period) ? period : 0;
  const selectedIndex = visiblePeriods.indexOf(selectedPeriod);

  function handleBack() {
    if (selectedIndex >= visiblePeriods.length - 1) return;
    setPeriod(visiblePeriods[selectedIndex + 1]);
  }
  function handleForward() {
    if (selectedIndex <= 0) return;
    setPeriod(visiblePeriods[selectedIndex - 1]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={{ flexDirection: "row", gap: 32, alignItems: "center" }}>
        <Pressable onPress={handleBack} style={styles.arrowbtn}>
          <Text>{"<"}</Text>
        </Pressable>
        <Text>{periods[selectedPeriod]}</Text>
        <Pressable onPress={handleForward} style={styles.arrowbtn}>
          <Text>{">"}</Text>
        </Pressable>
      </View>
      {hasStatsError && (
        <Text style={typography.body}>
          Kunde inte hämta statistik för alla perioder. Försök igen senare...
        </Text>
      )}
      <View style={styles.stretch}>
        {selectedPeriod === 0 ? (
          <DayView />
        ) : (
          <StatisticsView period={selectedPeriod} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  arrowbtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    width: 44,
    height: 44,
  },
  stretch: {
    flex: 1,
    alignSelf: "stretch",
  },
});
