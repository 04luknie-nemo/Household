import { createContext, useState } from "react";

export const HouseholdContext = createContext({
    activeHouseholdId: null as string | null,
    setActiveHouseholdId: (value: string | null) => {},
});

export default function HouseholdProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(
        null,
    );

    return (
        <HouseholdContext.Provider
            value={{ activeHouseholdId, setActiveHouseholdId }}
        >
            {children}
        </HouseholdContext.Provider>
    );
}
