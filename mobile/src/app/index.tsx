import StatisticsView from "@/components/statistics";
import TaskRow from "@/components/task-row";
import { periods } from "@/constants/periods";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
          <View style={{ alignItems: "center" }}>
            <Text>Dags View</Text>
            <TaskRow title="Hello" doneTodayBy={[1, 2]} daysSinceLast={5} isOverdue={false} onPress={() => router.push("/task-modal")}/>
            <View
              style={{
                borderWidth: 1,
                gap: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              
              <Text>Task 1</Text>
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Link href="/task-modal">Ändra</Link>
                <Link href="/task">Detalj för denna task</Link>
                <Link href="/task-modal">Skapa</Link>
              </View>
            </View>
          </View>
        ) : (
          // Statistik komponent
          <View>
            <StatisticsView period={period} />
          </View>
        )}
      </View>
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
