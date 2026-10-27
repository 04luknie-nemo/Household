import DayView from "@/components/day-view";
import StatisticsView from "@/components/statistics";
import { periods } from "@/constants/periods";
import { colors, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [period, setPeriod] = useState<number>(0);

  const canGoBack = period < periods.length - 1;
  const canGoForward = period > 0;

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
          {periods[period]}
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
