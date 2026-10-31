import AuthProvider from "@/components/auth-provider";
import HouseholdProvider from "@/components/household-provider";
import RootStack from "@/components/root-stack";
import { colors, spacing } from "@/constants/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const client = new QueryClient();

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.page}>
        <View style={styles.app}>
          <QueryClientProvider client={client}>
            <AuthProvider>
              <HouseholdProvider>
                <RootStack />
              </HouseholdProvider>
            </AuthProvider>
          </QueryClientProvider>
        </View>
      </View>

      <Toast
        position="bottom"
        bottomOffset={insets.bottom + spacing.lg}
        visibilityTime={2000}
        autoHide
      />
    </>
  );
}

// På webben på en bred skärm visas appen som en smal kolumn i mitten,
// så att den ser ut som på mobilen. På telefoner påverkas ingenting.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? colors.border : undefined,
  },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    alignSelf: "center",
  },
});
