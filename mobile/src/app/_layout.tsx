import HeaderAuth from "@/components/header-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const client = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <Stack
        screenOptions={{
          headerRight: () => <HeaderAuth />,
        }}
      />
    </QueryClientProvider>
  );
}
