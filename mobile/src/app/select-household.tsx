import { HouseholdContext } from "@/components/household-provider";
import { ui } from "@/constants/theme";
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
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<
        string | null
    >(null);

    const { setActiveHouseholdId } = useContext(HouseholdContext);

    const {
        data: households,
        isPending,
        error,
    } = useQuery<Household[]>({
        queryKey: ["households"],
        queryFn: () => apiFetch<Household[]>("/api/households"),
    });

    if (isPending) {
        return <Text>Hämtar hushåll...</Text>;
    }

    if (error) {
        console.error("Kunde inte hämta hushållen:", error.message);
        return <Text>Kunde inte hämta hushållen. Försök igen senare.</Text>;
    }

    return (
        <View style={{ gap: 32 }}>
            <View style={{ gap: 16, borderWidth: 1, padding: 16 }}>
                <Text>Här kommer listan på dina hushåll</Text>
                <Text>Klicka på hushåll för att välja det</Text>
                {households?.map((household) => (
                    <Pressable
                        key={household.id}
                        disabled={household.status !== "active"}
                        onPress={() => setSelectedHouseholdId(household.id)}
                        style={[
                            ui.card,
                            household.status === "pending" && ui.cardPending,
                            selectedHouseholdId === household.id &&
                                ui.cardSelected,
                        ]}
                    >
                        <Text>
                            {household.name}{" "}
                            {household.status === "pending" &&
                                " - Väntar på godkännande"}
                        </Text>
                    </Pressable>
                ))}
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
            </View>

            <Link
                href="/create-household"
                style={{ borderWidth: 1, padding: 16 }}
            >
                <Text>Skapa hushåll</Text>
            </Link>
            <Link
                href="/join-household"
                style={{ borderWidth: 1, padding: 16 }}
            >
                <Text>Gå med i hushåll</Text>
            </Link>
        </View>
    );
}
