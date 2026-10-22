import { avatars } from "@/constants/avatars";
import { typography, ui } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  doneTodayBy: number[];
  daysSinceLast: number;
  isOverdue: boolean;
  onPress: () => void;
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
      <View style={s.titleContainer}>
        <Text style={[typography.body, s.title]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {doneTodayBy.length > 0 ? (
        <View style={s.row}>
          {doneTodayBy.map((avatarId) => {
            const avatar = avatars.find((avatar) => avatar.id === avatarId);

            if(!avatar) return null;

            return ( 
                <Text key={avatarId} style={{backgroundColor: avatar.color}}>{avatar.name}</Text>
            )
          })}
          
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
  titleContainer: {
    flex:1,
    minWidth:0,
    marginRight: 40
  },
  title: {
    fontWeight: "600",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});
