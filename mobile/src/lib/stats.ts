import type { ApiPeriod } from "@/constants/periods";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "./api";

export type MemberPoints = {
  avatarId: number;
  points: number;
};

type MemberTotal = MemberPoints & {
  nickname: string;
};

type TaskStats = {
  taskId: string;
  title: string;
  members: MemberPoints[];
};

type Stats = {
  total: MemberTotal[];
  perTask: TaskStats[];
};

export function statsQueryOptions(
  userId: string | null,
  sessionId: string | null,
  activeHouseholdId: string | null,
  apiPeriod: ApiPeriod | null,
) {
  return queryOptions({
    queryKey: ["stats", userId, sessionId, activeHouseholdId, apiPeriod],
    enabled: !!activeHouseholdId && !!userId && !!apiPeriod,
    staleTime: 30_000,
    queryFn: ({ signal }) =>
      apiFetch<Stats>(
        `/api/households/${activeHouseholdId}/stats?period=${apiPeriod}`,
        { signal },
      ),
  });
}
