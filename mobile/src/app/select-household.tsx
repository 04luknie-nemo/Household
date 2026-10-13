import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SelectHousehold() {
  return (
    <View style={{ gap: 32 }}>
      <Link href="/create-household">
        <Text>Skapa hushåll</Text>
      </Link>
      <Link href="/join-household">
        <Text>Gå med i hushåll</Text>
      </Link>
    </View>
  );
}
