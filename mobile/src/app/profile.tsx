import { AuthContext } from "@/components/auth-provider";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  const { setIsLoggedIn, isLoggedIn } = useContext(AuthContext);
  return (
    <View>
      <Text>Profile</Text>
      <Pressable onPress={() => setIsLoggedIn(!isLoggedIn)}>
        <Text>Logga Ut</Text>
      </Pressable>
    </View>
  );
}
