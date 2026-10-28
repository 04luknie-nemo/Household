export const periods: string[] = [
  "Idag",
  "Denna vecka",
  "Förra veckan",
  "Förra månaden",
];

export type ApiPeriod = "week" | "lastWeek" | "lastMonth";

export const apiPeriods: (ApiPeriod | null)[] = [
  null,
  "week",
  "lastWeek",
  "lastMonth",
];
