import { Pressable, Text, View } from "react-native";

export default function Household() {
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Text>Hushållets namn ska stå här</Text>
      <Pressable>
        <Text>Ändra hushållets namn</Text>
      </Pressable>
      <Text>Koden för att gå med ska stå här</Text>
    </View>
  );
}
