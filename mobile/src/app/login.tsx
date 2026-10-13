import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Login() {
  return (
    <View>
      <Text>Login</Text>
      <Link href="/register">Har du inget konto? Skapa konto!</Link>
    </View>
  );
}
