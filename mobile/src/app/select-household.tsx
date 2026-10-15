import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SelectHousehold() {
  return (
    <View style={{ gap: 32 }}>
      <View style={{ gap: 16, borderWidth: 1, padding: 16 }}>
        <Text>Här kommer listan på dina hushåll</Text>
        <Text>Klicka på hushåll för att välja det</Text>
        <Link
          href="/"
          dismissTo
          asChild
          style={{ gap: 16, borderWidth: 1, padding: 16 }}
        >
          <Pressable>
            <Text>Hushåll 1</Text>
          </Pressable>
        </Link>
        <Link
          href="/"
          dismissTo
          asChild
          style={{ gap: 16, borderWidth: 1, padding: 16 }}
        >
          <Pressable>
            <Text>Hushåll 2</Text>
          </Pressable>
        </Link>
        <Link
          href="/"
          dismissTo
          asChild
          style={{ gap: 16, borderWidth: 1, padding: 16 }}
        >
          <Pressable>
            <Text>Hushåll 3</Text>
          </Pressable>
        </Link>
      </View>
      <Link href="/create-household" style={{ borderWidth: 1, padding: 16 }}>
        <Text>Skapa hushåll</Text>
      </Link>
      <Link href="/join-household" style={{ borderWidth: 1, padding: 16 }}>
        <Text>Gå med i hushåll</Text>
      </Link>
    </View>
  );
}
