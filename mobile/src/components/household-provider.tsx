import { apiFetch } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-provider";

type Household = {
    id: string;
    name: string;
    status: "pending" | "active" | "left";
    isOwner: boolean;
};

export const HouseholdContext = createContext({
    activeHouseholdId: null as string | null,
    setActiveHouseholdId: (value: string | null) => {},
    isLoading: true,
    error: null as string | null,
    retry: () => {},
});

export default function HouseholdProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, isPending } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const [activeHousehold, setActiveHousehold] = useState<{
        userId: string;
        householdId: string;
    } | null>(null);

    const activeHouseholdId =
        activeHousehold && activeHousehold.userId === userId
            ? activeHousehold.householdId
            : null;

    const storageKey = userId ? `activeHouseholdId:${userId}` : null;

    useEffect(() => {
        if (!storageKey || !userId || isPending) return;
        let cancelled = false;
        const controller = new AbortController();

        const loadHousehold = async () => {
            try {
                const savedId = await AsyncStorage.getItem(storageKey);
                if (cancelled) return;

                const households = await apiFetch<Household[]>(
                    "/api/households",
                    {
                        signal: controller.signal,
                    },
                );
                if (cancelled) return;

                const activeHouseholds = households.filter(
                    (household) => household.status === "active",
                );

                if (activeHouseholds.length === 1) {
                    const householdId = activeHouseholds[0].id;

                    await AsyncStorage.setItem(storageKey, householdId);
                    if (cancelled) return;
                    setActiveHousehold({ userId, householdId });
                    return;
                }

                const isActiveMember = households.some(
                    (household) =>
                        household.id === savedId &&
                        household.status === "active",
                );

                if (isActiveMember) {
                    setActiveHousehold({
                        userId,
                        householdId: savedId!,
                    });
                } else {
                    await AsyncStorage.removeItem(storageKey);
                    if (cancelled) return;
                    setActiveHousehold(null);
                }
            } catch (error) {
                if (cancelled) return;
                console.error("Kunde inte återställa hushåll:", error);
                setError("Kunde inte återställa hushåll. Försök igen.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadHousehold();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [storageKey, isPending, userId, retryCount]);

    async function saveActiveHouseholdId(id: string | null) {
        if (!storageKey || !userId) return;

        setActiveHousehold(id !== null ? { userId, householdId: id } : null);

        try {
            if (id === null) {
                await AsyncStorage.removeItem(storageKey);
            } else {
                await AsyncStorage.setItem(storageKey, id);
            }
        } catch (error) {
            console.error("Kunde inte spara hushållsval:", error);
        }
    }

    return (
        <HouseholdContext.Provider
            value={{
                activeHouseholdId,
                setActiveHouseholdId: saveActiveHouseholdId,
                isLoading: !!userId && (isPending || isLoading),
                error,
                retry: () => {
                    setError(null);
                    setIsLoading(true);
                    setRetryCount((count) => count + 1);
                },
            }}
        >
            {children}
        </HouseholdContext.Provider>
    );
}
