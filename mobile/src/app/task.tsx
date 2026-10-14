import { Pressable, Text, View } from "react-native";

export default function Task() {
  return (
    <View>
      <Text>Innehåll för denna tasken</Text>
      <Pressable>
        <Text>Här klickar man för att bocka av tasken</Text>
      </Pressable>
    </View>
  );
}
