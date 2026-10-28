// Text för hur ofta en syssla återkommer, t.ex. "varannan dag" eller "var 3:e dag".
export function reoccurLabel(days: number) {
  if (days === 1) return "varje dag";
  if (days === 2) return "varannan dag";

  const last = days % 10;
  const lastTwo = days % 100;
  const suffix =
    (last === 1 || last === 2) && lastTwo !== 11 && lastTwo !== 12 ? "a" : "e";

  return `var ${days}:${suffix} dag`;
}
