import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CreateHousehold() {
  return (
    <View style={{ gap: 16 }}>
      <Text>
        Här skapar du hushåll och blir dirigerad till hemskärmen om det lyckas
      </Text>
      <Link href="/select-household" dismissTo asChild>
        <Pressable>
          <Text>Klicka här för att skapa ett hushåll</Text>
        </Pressable>
      </Link>
    </View>
  );
}
