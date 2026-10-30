import { colors, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, router, Stack } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";
import LogOutButton from "./log-out-button";

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

  if (isPending || isLoading) {
    return (
      <View style={styles.message}>
        <Text style={typography.body}>Laddar...</Text>
      </View>
    );
  }

  if (isLoggedIn && error) {
    return (
      <View style={styles.message}>
        <Text style={typography.body}>{error}</Text>

        <Pressable onPress={retry} style={ui.button}>
          <Text style={ui.buttonText}>Försök igen</Text>
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
            <View style={styles.headerActions}>
              <Link href="/select-household" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Byt hushåll"
                  style={styles.headerButton}
                >
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={24}
                    color={colors.primary}
                  />
                </Pressable>
              </Link>
            </View>
          ) : null,
      }}
    >
      <Stack.Protected
        guard={isLoggedIn && hasActiveHousehold}
        redirectTo={isLoggedIn ? "/select-household" : "/login"}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <Link href="/household">
                <Text style={styles.householdTitle}>
                  {activeHouseholdName ?? "Hushållet"}
                </Text>
              </Link>
            ),
            headerLeft: () => (
              <View>
                <Link href="/profile" asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Profil"
                    style={styles.headerButton}
                  >
                    <MaterialCommunityIcons
                      name="account-circle-outline"
                      size={24}
                      color={colors.primary}
                    />
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
            title: "Lägg till",
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Stäng"
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            ),
            headerRight: () => null,
          }}
        />

        <Stack.Screen
          name="task"
          options={{
            title: "Syssla",
            headerRight: () => null,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn} redirectTo="/login">
        <Stack.Screen
          name="select-household"
          options={{
            title: "Välj hushåll",
            headerRight: () => <LogOutButton compact />,
          }}
        />

        <Stack.Screen
          name="create-household"
          options={{
            title: "Skapa hushåll",
            headerRight: () => null,
          }}
        />

        <Stack.Screen
          name="join-household"
          options={{
            title: "Gå med i hushåll",
            headerRight: () => null,
          }}
        />
      </Stack.Protected>

      <Stack.Protected
        guard={!isLoggedIn}
        redirectTo={hasActiveHousehold ? "/" : "/select-household"}
      >
        <Stack.Screen
          name="login"
          options={{ title: "Logga in", headerShown: false }}
        />

        <Stack.Screen
          name="register"
          options={{ title: "Registrera", headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
}

const styles = {
  message: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  headerActions: {
    flexDirection: "row" as const,
    gap: spacing.sm,
  },

  headerButton: {
    padding: spacing.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  householdTitle: {
    ...typography.title,
    fontSize: 20,
    padding: spacing.md,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginLeft: spacing.sm,
  },
};
