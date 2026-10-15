import { AuthContext } from "@/components/auth-provider";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  const { setIsLoggedIn } = useContext(AuthContext);
  return (
    <View>
      <Text>Profile</Text>
      <Pressable onPress={() => setIsLoggedIn(false)}>
        <Text>Logga Ut</Text>
      </Pressable>
    </View>
  );
}
