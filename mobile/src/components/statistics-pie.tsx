import { avatars } from "@/constants/avatars";
import { colors, statisticsStyles as styles } from "@/constants/theme";
import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { MemberPoints } from "@/lib/stats";

type Props = {
  members: MemberPoints[];
  title: string;
  large?: boolean;
};

export default function StatisticsPie({
  members,
  title,
  large = false,
}: Props) {
  const positive = members.filter((member) => member.points > 0);
  const total = positive.reduce((sum, member) => sum + member.points, 0);

  return (
    <View style={styles.diagram}>
      <View style={large ? styles.totalChart : styles.taskChart}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          accessibilityLabel={title}
        >
          {positive.map((member, index) => {
            const color =
              avatars.find((avatar) => avatar.id === member.avatarId)?.color ??
              colors.textMuted;
            // En ensam medlem fyller hela cirkeln; en SVG-båge kan inte göra ett helt varv.
            if (positive.length === 1) {
              return (
                <Circle
                  key={member.avatarId}
                  cx={50}
                  cy={50}
                  r={50}
                  fill={color}
                />
              );
            }
            const before = positive
              .slice(0, index)
              .reduce((sum, item) => sum + item.points, 0);
            const start = (before / total) * 2 * Math.PI - Math.PI / 2;
            const sweep = (member.points / total) * 2 * Math.PI;
            const end = start + sweep;
            // Linje från mitten, båge längs cirkeln, sedan tillbaka till mitten.
            const path = `M 50 50 L ${50 + 50 * Math.cos(start)} ${50 + 50 * Math.sin(start)} A 50 50 0 ${sweep > Math.PI ? 1 : 0} 1 ${50 + 50 * Math.cos(end)} ${50 + 50 * Math.sin(end)} Z`;
            return <Path key={member.avatarId} d={path} fill={color} />;
          })}
        </Svg>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.legend}>
        {positive.map((member) => {
          const avatar = avatars.find(
            (avatar) => avatar.id === member.avatarId,
          );
          return (
            <Text key={member.avatarId} style={styles.legendText}>
              {avatar?.name ?? "?"} {member.points} p
            </Text>
          );
        })}
      </View>
    </View>
  );
}
