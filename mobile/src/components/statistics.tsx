import { periods } from "@/constants/periods";
import { Text, View } from "react-native";

export default function StatisticsView({ period }: { period: number }) {
  return (
    <View>
      <Text>Statistik Vy För {periods[period]}</Text>
    </View>
  );
}
