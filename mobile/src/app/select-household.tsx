import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useContext, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Household = {
  id: string;
  name: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
};

export default function SelectHousehold() {
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(
    null,
  );

  const { setActiveHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const {
    data: households,
    isPending,
    error,
  } = useQuery<Household[]>({
    queryKey: ["households", userId, sessionId],
    queryFn: ({ signal }) =>
      apiFetch<Household[]>("/api/households", { signal }),
  });

  if (isPending) {
    return <Text>Hämtar hushåll...</Text>;
  }

  if (error) {
    console.error("Kunde inte hämta hushållen:", error.message);
    return <Text>Kunde inte hämta hushållen. Försök igen senare.</Text>;
  }

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={typography.title}>Välj hushåll</Text>
      <Text style={typography.body}>
        Välj vilket hushåll du vill fortsätta till.
      </Text>

      <View style={{ gap: spacing.sm }}>
        {households?.map((household) => (
          <Pressable
            key={household.id}
            disabled={household.status !== "active"}
            onPress={() => setSelectedHouseholdId(household.id)}
            style={[
              ui.card,
              household.status === "pending" && ui.cardPending,
              selectedHouseholdId === household.id && ui.cardSelected,
            ]}
          >
            <Text style={typography.label}>{household.name}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        disabled={selectedHouseholdId === null}
        onPress={() => {
          if (selectedHouseholdId !== null) {
            setActiveHouseholdId(selectedHouseholdId);
            router.replace("/");
          }
        }}
        style={ui.button}
      >
        <Text style={ui.buttonText}>Fortsätt</Text>
      </Pressable>

      <Link href="/create-household" style={{ borderWidth: 1, padding: 16 }}>
        <Text>Skapa hushåll</Text>
      </Link>
      <Link href="/join-household" style={{ borderWidth: 1, padding: 16 }}>
        <Text>Gå med i hushåll</Text>
      </Link>
    </View>
  );
}
