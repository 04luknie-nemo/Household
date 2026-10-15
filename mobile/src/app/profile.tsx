import { AuthContext } from "@/components/auth-provider";
import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = async () => {
    await authClient.signOut();

    setIsLoggedIn(false);

    router.replace("/login");
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 20 }}>Profil</Text>

      <Pressable onPress={handleLogout} style={{ borderWidth: 1, padding: 10 }}>
        <Text>Logga Ut</Text>
      </Pressable>
    </View>
  );
}
