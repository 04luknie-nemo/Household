import Avatar from "@/components/avatar";
import { spacing, typography, ui } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  doneTodayBy: number[];
  daysSinceLast: number | null;
  isOverdue: boolean;
  onPress: () => void;
};

function daysLabel(days: number | null) {
  if (days === null) return "Aldrig gjord";
  if (days === 0) return "Idag";
  if (days === 1) return "1 dag sedan";
  return `${days} dagar sedan`;
}

export default function TaskRow({
  title,
  doneTodayBy,
  daysSinceLast,
  isOverdue,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={[ui.card, s.taskCard]}>
      <View style={s.titleContainer}>
        <Text style={typography.label} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={s.status}>
        {doneTodayBy.length > 0 && (
          <View style={s.row}>
            {doneTodayBy.map((avatarId) => (
              <Avatar key={avatarId} avatarId={avatarId} size="sm" />
            ))}
          </View>
        )}
        <View style={s.row}>
          <Text style={ui.dayCount}>{daysLabel(daysSinceLast)}</Text>
          {isOverdue && (
            <Text style={[ui.dayCount, ui.dayCountOverdue]}>Försenad</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  status: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: spacing.lg * 1.5,
  },
});
