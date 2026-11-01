import AuthProvider from "@/components/auth-provider";
import HouseholdProvider from "@/components/household-provider";
import RootStack from "@/components/root-stack";
import { spacing } from "@/constants/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const client = new QueryClient();

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <HouseholdProvider>
            <RootStack />
          </HouseholdProvider>
        </AuthProvider>
      </QueryClientProvider>

      <Toast
        position="bottom"
        bottomOffset={insets.bottom + spacing.lg}
        visibilityTime={2000}
        autoHide
      />
    </>
  );
}
