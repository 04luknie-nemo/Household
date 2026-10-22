import DayView from "@/components/day-view";
import StatisticsView from "@/components/statistics";
import { periods } from "@/constants/periods";
import { colors, spacing } from "@/constants/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [period, setPeriod] = useState<number>(0);

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
        {period === 0 ? (
          <DayView />
        ) : (
          // Statistik komponent
          <View>
            <StatisticsView period={period} />
          </View>
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
  footerButton: {
    bottom: spacing.lg,
    paddingVertical: spacing.md
  },
  addButton: {
    backgroundColor: colors.card, 
    padding: spacing.lg,
    flexDirection:"row", 
    gap: spacing.md,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
});
