import { periods } from "@/constants/periods";
import { colors, typography } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { Text, View } from "react-native";
import { AuthContext } from "./auth-provider";
import { HouseholdContext } from "./household-provider";

type MemberPoints = {
  avatarId: number;
  points: number;
}

type MemberTotal = MemberPoints & {
  nickname: string;
}

type TaskStats = {
  taskId: string;
  title: string;
  members: MemberPoints[];
}

type Stats = {
  total: MemberTotal[];
  perTask: TaskStats[];
};

export default function StatisticsView({ period }: { period: number }) {
  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const {
    data: stats,
    isPending,
    error,
  } = useQuery<Stats>({
    queryKey: ["stats-this-week", userId, sessionId, activeHouseholdId],
    enabled: !!activeHouseholdId && !!userId && period ===1,
    queryFn: ({ signal }) =>
      apiFetch<Stats>(`/api/households/${activeHouseholdId}/stats?period=week`, {
        signal,
      }),
  });

  if (period !== 1){
    return <Text style={typography.body}>Kommer snart</Text> // ta bort denna ifall vi lägger in stats för andra perioder än "denna veckan"
  }

  if(stats?.total.length === 0){
    return <Text style={typography.body}>Inga sysslor har gjorts denna veckan</Text>
  }

  if (isPending) {
    return (
      <Text style={[typography.body, { color: colors.pending }]}>
        Hämtar statistik för {periods[period]}...
      </Text>
    );
  }

  if (error) {
    return (
      <Text style={[typography.body]}>
        Kunde inte hämta statistik för {periods[period]}. Försök igen senare...
      </Text>
    );
  }

  return (
    <View>
      <Text>Statistik Vy För {periods[period]}</Text>
    </View>
  );
}
