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
    return <Text style={typography.body}>Hämtar hushåll...</Text>;
  }

  if (error) {
    console.error("Kunde inte hämta hushållen:", error.message);
    return (
      <Text style={typography.body}>
        Kunde inte hämta hushållen. Försök igen senare.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={typography.title}>Välj hushåll</Text>
        <Text style={typography.body}>
          Välj vilket hushåll du vill fortsätta till.
        </Text>

        <View style={styles.householdList}>
          {households?.map((household) => (
            <Pressable
              key={household.id}
              disabled={household.status !== "active"}
              accessibilityRole="button"
              accessibilityState={{
                selected: selectedHouseholdId === household.id,
                disabled: household.status !== "active",
              }}
              onPress={() => setSelectedHouseholdId(household.id)}
              style={[
                ui.card,
                household.status === "pending" && ui.cardPending,
                selectedHouseholdId === household.id && ui.cardSelected,
              ]}
            >
              <Text style={typography.label}>{household.name}</Text>

              <View style={styles.badges}>
                {household.isOwner && (
                  <Text style={[ui.badge, ui.badgeOwner]}>Ägare</Text>
                )}

                {household.status === "pending" && (
                  <Text style={[ui.badge, ui.badgePending]}>Väntar</Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={selectedHouseholdId === null}
        onPress={() => {
          if (selectedHouseholdId !== null) {
            setActiveHouseholdId(selectedHouseholdId);
            router.replace("/");
          }
        }}
        style={[
          ui.button,
          selectedHouseholdId === null && styles.disabledButton,
        ]}
      >
        <Text style={ui.buttonText}>Fortsätt</Text>
      </Pressable>

      <View style={styles.actions}>
        <Link href="/create-household" style={[ui.button, ui.buttonSecondary]}>
          <Text style={ui.buttonSecondaryText}>Skapa hushåll</Text>
        </Link>

        <Link href="/join-household" style={[ui.button, ui.buttonSecondary]}>
          <Text style={ui.buttonSecondaryText}>Gå med i hushåll</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  householdList: {
    gap: spacing.sm,
  },
  badges: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
};
