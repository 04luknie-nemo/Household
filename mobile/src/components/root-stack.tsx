import { colors } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link, router, Stack } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";

type Household = {
  id: string;
  name: string;
};

export default function RootStack() {
  const { isLoggedIn, isPending, userId, sessionId } = useContext(AuthContext);
  const { activeHouseholdId, isLoading, error, retry } =
    useContext(HouseholdContext);
  const hasActiveHousehold = activeHouseholdId !== null;

  const { data: households } = useQuery<Household[]>({
    queryKey: ["households", userId, sessionId],
    queryFn: ({ signal }) =>
      apiFetch<Household[]>("/api/households", { signal }),
    enabled:
      isLoggedIn && !isPending && !isLoading && !error && hasActiveHousehold,
  });

  const activeHouseholdName = households?.find(
    (household) => household.id === activeHouseholdId,
  )?.name;

  if (isPending || isLoading) return <Text>Laddar...</Text>;

  if (isLoggedIn && error) {
    return (
      <View>
        <Text>{error}</Text>
        <Pressable onPress={retry}>
          <Text>Försök igen</Text>
        </Pressable>
      </View>
    );
  }

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
      <Stack.Protected guard={isLoggedIn && hasActiveHousehold}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Link href="/household">
                <Text style={{ padding: 16 }}>
                  {activeHouseholdName ?? "Hushållet"}
                </Text>
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
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen
          name="select-household"
          options={{ headerRight: () => null }}
        />
        <Stack.Screen
          name="create-household"
          options={{ headerRight: () => null }}
        />
        <Stack.Screen
          name="join-household"
          options={{
            title: "Gå med i hushåll",
            headerRight: () => null,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
