import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Register() {
  return (
    <View>
      <Text>Registrering</Text>
      <Link href="/login">
        <Text>Har du konto? Logga In</Text>
      </Link>
    </View>
  );
}
