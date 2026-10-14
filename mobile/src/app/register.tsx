import { AuthContext } from "@/components/auth-provider";
import { Link } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Register() {
  const { setIsLoggedIn, isLoggedIn } = useContext(AuthContext);
  return (
    <View>
      <Text>Registrering</Text>
      {/* Detta byts senare ut  */}
      <Pressable onPress={() => setIsLoggedIn(!isLoggedIn)}>
        <Text>Tryck här för att skapa konto!</Text>
      </Pressable>
      <Link href="/login">
        <Text>Har du konto? Logga In</Text>
      </Link>
    </View>
  );
}
