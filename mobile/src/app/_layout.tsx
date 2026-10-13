import HeaderAuth from "@/components/header-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, router, Stack } from "expo-router";
import { Pressable, Text } from "react-native";

const client = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <Stack
        screenOptions={{
          headerRight: () => <HeaderAuth />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Hushållet",
            headerLeft: () => (
              <Link href="/profile" asChild>
                <Pressable style={{ padding: 12 }}>
                  <Text>P</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="register" />
        <Stack.Screen name="login" />
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
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
