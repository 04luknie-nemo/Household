import StatisticsView from "@/components/statistics";
import { periods } from "@/constants/periods";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

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
    <View style={styles.container}>
      <View style={{ flexDirection: "row", gap: 32, alignItems: "center" }}>
        <Pressable onPress={handleBack} style={styles.arrowbtn}>
          <Text>{"<"}</Text>
        </Pressable>
        <Text>{periods[period]}</Text>
        <Pressable onPress={handleForward} style={styles.arrowbtn}>
          <Text>{">"}</Text>
        </Pressable>
      </View>
      <View>
        {period === 0 ? (
          // Blir en daily komponent
          <View>
            <Text>Dags View</Text>
          </View>
        ) : (
          // Statistik komponent
          <View>
            <StatisticsView period={period} />
          </View>
        )}
      </View>
      <Link href="/task-modal">
        <Text>Lägg Till</Text>
      </Link>
      {/* Tillfälligt: tas bort i #7 */}
      <Link href="/select-household">
        <Text>Välj hushåll</Text>
      </Link>
      <Link href="/login">
        <Text>Logga in</Text>
      </Link>
    </View>
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
});
