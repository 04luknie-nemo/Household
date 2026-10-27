import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
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
    return (
      <View style={styles.message}>
        <Text style={typography.body}>Hämtar hushåll...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.message}>
        <Text style={typography.body}>
          Kunde inte hämta hushållen. Försök igen senare.
        </Text>
      </View>
    );
  }

  const visibleHouseholds = households
    ?.filter((household) => household.status !== "left")
    .slice()
    .sort((a, b) => {
      if (a.status === "active" && b.status === "pending") return -1;
      if (a.status === "pending" && b.status === "active") return 1;
      return 0;
    });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.description}>
          Välj vilket hushåll du vill använda.
        </Text>

        <View style={styles.householdList}>
          {visibleHouseholds?.map((household) => {
            const selected = selectedHouseholdId === household.id;
            const pending = household.status === "pending";

            return (
              <Pressable
                key={household.id}
                disabled={pending}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                  disabled: pending,
                }}
                onPress={() => setSelectedHouseholdId(household.id)}
                style={[
                  ui.card,
                  styles.householdCard,
                  pending && styles.pendingCard,
                  selected && styles.selectedCard,
                ]}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.householdIcon,
                      pending && styles.pendingIcon,
                    ]}
                  >
                    <Ionicons
                      name={pending ? "time-outline" : "home-outline"}
                      size={18}
                      color={pending ? colors.textMuted : colors.primary}
                    />
                  </View>

                  <View style={styles.householdInfo}>
                    <Text style={styles.householdName}>{household.name}</Text>

                    <Text style={styles.householdSubtitle}>
                      {pending
                        ? "Väntar på att gå med"
                        : household.isOwner
                          ? "Du är ägare"
                          : "Hushållsmedlem"}
                    </Text>
                  </View>

                  {pending ? (
                    <Text style={[ui.badge, ui.badgePending]}>Väntar</Text>
                  ) : selected ? (
                    <View style={styles.selectedCheck}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.onPrimary}
                      />
                    </View>
                  ) : (
                    <View style={styles.unselectedCircle} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Link href="/create-household" style={styles.actionLink}>
            <Ionicons
              name="add-circle-outline"
              size={17}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Skapa nytt hushåll</Text>
          </Link>

          <Link href="/join-household" style={styles.actionLink}>
            <Ionicons name="people-outline" size={17} color={colors.primary} />
            <Text style={styles.actionText}>Gå med i hushåll</Text>
          </Link>
        </View>
      </View>

      <View style={styles.bottom}>
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
            styles.continueButton,
            selectedHouseholdId === null && styles.disabledButton,
          ]}
        >
          <Text style={ui.buttonText}>Fortsätt</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  section: {
    gap: spacing.lg,
  },

  description: {
    Color: "#000000",
    ...typography.caption,
    fontSize: 13,
    marginBottom: spacing.sm,
  },

  householdList: {
    gap: spacing.md,
  },

  householdCard: {
    minHeight: 60,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    justifyContent: "center" as const,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "transparent",
  },

  selectedCard: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  pendingCard: {
    backgroundColor: "#E7E7E7",
    borderWidth: 0,
    boxShadow: "none",
  },

  cardContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },

  householdIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.pendingBackground,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  pendingIcon: {
    backgroundColor: colors.card,
  },

  householdInfo: {
    flex: 1,
    gap: 2,
  },

  householdName: {
    ...typography.label,
    fontSize: 13,
  },

  householdSubtitle: {
    ...typography.caption,
    fontSize: 11,
  },

  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  unselectedCircle: {
    width: 19,
    height: 19,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  actions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    marginTop: 0,
  },

  actionLink: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  actionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600" as const,
  },

  bottom: {
    marginTop: "auto" as const,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: "center" as const,
  },

  continueButton: {
    width: "100%" as const,
    minHeight: 45,
    paddingVertical: spacing.sm,
    alignSelf: "center" as const,
    justifyContent: "center" as const,
  },

  disabledButton: {
    opacity: 0.5,
  },

  message: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: spacing.md,
  },
};
