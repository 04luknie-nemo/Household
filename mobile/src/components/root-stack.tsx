import { Link, router, Stack } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { AuthContext } from "./auth-provider";

export default function RootStack() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
        headerRight: () =>
          isLoggedIn ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Link href="/select-household" asChild>
                <Pressable style={{ padding: 12 }}>
                  <Text>H</Text>
                </Pressable>
              </Link>
            </View>
          ) : null,
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Link href="/household">
                <Text style={{ padding: 16 }}>Hushållet</Text>
              </Link>
            ),
            headerLeft: () => (
              <View>
                <Link href="/profile" asChild>
                  <Pressable style={{ padding: 12 }}>
                    <Text>P</Text>
                  </Pressable>
                </Link>
              </View>
            ),
          }}
        />
        <Stack.Screen name="household" options={{ title: "Hushåll" }} />
        <Stack.Screen name="profile" options={{ title: "Profil" }} />
        <Stack.Screen
          name="task-modal"
          options={{
            presentation: "modal",
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ padding: 12 }}>
                <Text>X</Text>
              </Pressable>
            ),
            headerRight: () => null,
          }}
        />
        <Stack.Screen name="task" options={{ headerRight: () => null }} />
        <Stack.Screen
          name="join-household"
          options={{ headerRight: () => null }}
        />
        <Stack.Screen
          name="select-household"
          options={{ headerRight: () => null }}
        />
        <Stack.Screen
          name="create-household"
          options={{ headerRight: () => null }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
