import { typography, ui } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  doneTodayBy: number[];
  daysSinceLast: number;
  isOverdue: boolean;
  onPress?: () => void;
};

export default function TaskRow({
  title,
  doneTodayBy,
  daysSinceLast,
  isOverdue,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={[ui.card, s.taskCard]}>
      <View>
        <Text style={[typography.body, s.title]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {doneTodayBy.length > 0 ? (
        <View style={s.row}>
          {doneTodayBy.map((avatarId) => (
            <Text key={avatarId}>{avatarId}</Text>
          ))}
        </View>
      ) : (
        <View>
          <Text style={[ui.dayCount, isOverdue && ui.dayCountOverdue]}>{daysSinceLast}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  title: {
    fontWeight: "600",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
