import { Text, View } from "react-native";

export default function TaskModal() {
  return (
    <View>
      <Text>
        Här har vi form för att antingen redigera eller skapa ny task, beroende
        på om länken som tog dig hit skickade med task id eller inte
      </Text>
    </View>
  );
}
