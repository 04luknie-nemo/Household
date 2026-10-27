import { AuthContext } from "@/components/auth-provider";
import DayView from "@/components/day-view";
import { HouseholdContext } from "@/components/household-provider";
import StatisticsView from "@/components/statistics";
import { apiPeriods, periods } from "@/constants/periods";
import { statsQueryOptions } from "@/lib/stats";
import { useQueries } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [period, setPeriod] = useState<number>(0);

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  useQueries({
    queries: apiPeriods
      .filter((apiPeriod) => apiPeriod !== null)
      .map((apiPeriod) =>
        statsQueryOptions(userId, sessionId, activeHouseholdId, apiPeriod),
      ),
  });

  function handleBack() {
    if (period === periods.length - 1) return;
    setPeriod((prev) => prev + 1);
  }
  function handleForward() {
    if (period === 0) return;
    setPeriod((prev) => prev - 1);
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={{ flexDirection: "row", gap: 32, alignItems: "center" }}>
        <Pressable onPress={handleBack} style={styles.arrowbtn}>
          <Text>{"<"}</Text>
        </Pressable>
        <Text>{periods[period]}</Text>
        <Pressable onPress={handleForward} style={styles.arrowbtn}>
          <Text>{">"}</Text>
        </Pressable>
      </View>
      <View style={styles.stretch}>
        {period === 0 ? <DayView /> : <StatisticsView period={period} />}
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
