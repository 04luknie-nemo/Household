import { AuthContext } from "@/components/auth-provider";
import { Link } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Login() {
  const { setIsLoggedIn } = useContext(AuthContext);
  return (
    <View>
      <Text>Login</Text>
      {/* Byts ut när man gör den riktiga sidan, just nu bara enkel navigering med hur det tekniskt kommer fungera */}
      <Pressable onPress={() => setIsLoggedIn(true)}>
        <Text>Tryck Här För Att Logga In</Text>
      </Pressable>
      <Link href="/register">Har du inget konto? Skapa konto!</Link>
    </View>
  );
}
