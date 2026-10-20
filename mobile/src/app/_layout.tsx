import AuthProvider from "@/components/auth-provider";
import HouseholdProvider from "@/components/household-provider";
import RootStack from "@/components/root-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <HouseholdProvider>
          <RootStack />
        </HouseholdProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
