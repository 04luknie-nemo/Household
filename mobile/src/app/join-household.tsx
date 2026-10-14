import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function JoinHousehold() {
  return (
    <View style={{ gap: 16 }}>
      <Text>
        Här skriver du in kod och väntar, du blir omdirigerad när hushållet kan
        ta emot dig
      </Text>
      {/* Jag tycker att om man går med ett hushåll så är det den som ska visas, 
      därför redirect till index */}
      <Link href="/" dismissTo asChild>
        <Pressable>
          <Text>
            Ponera att du har skrivit in koden, klicka här för att skicka iväg,
            egentligen väntar du tills du har blivit godkänd, nu blir du det
            direkt :D
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
