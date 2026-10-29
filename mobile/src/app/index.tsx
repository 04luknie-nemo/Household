import { AuthContext } from "@/components/auth-provider";
import DayView from "@/components/day-view";
import { HouseholdContext } from "@/components/household-provider";
import StatisticsView from "@/components/statistics";
import { apiPeriods, periods } from "@/constants/periods";
import { statsQueryOptions } from "@/lib/stats";
import { useQueries } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { colors, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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
  const canGoBack = selectedIndex < visiblePeriods.length - 1;
  const canGoForward = selectedIndex > 0;

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
      <View style={styles.periodBar}>
        <Pressable
          onPress={handleBack}
          disabled={!canGoBack}
          style={[styles.arrowBtn, !canGoBack && styles.disabledArrow]}
          hitSlop={8}
          accessibilityLabel="Föregående period"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoBack ? colors.primary : colors.textMuted}
          />
        </Pressable>

        <Text style={[typography.title, styles.periodTitle]}>
          {periods[selectedPeriod]}
        </Text>

        <Pressable
          onPress={handleForward}
          disabled={!canGoForward}
          style={[styles.arrowBtn, !canGoForward && styles.disabledArrow]}
          hitSlop={8}
          accessibilityLabel="Nästa period"
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoForward ? colors.primary : colors.textMuted}
          />
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
    padding: spacing.md,
  },
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  periodTitle: {
    textAlign: "center",
    flex: 1,
  },
  arrowBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
  },
  disabledArrow: {
    opacity: 0.4,
  },
  stretch: {
    flex: 1,
    alignSelf: "stretch",
  },
});
