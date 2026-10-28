import { avatars } from "@/constants/avatars";
import { ui } from "@/constants/theme";
import { Text, View } from "react-native";

type Props = {
  avatarId: number;
  size?: "sm" | "md";
};

export default function Avatar({ avatarId, size = "md" }: Props) {
  const avatar = avatars.find((a) => a.id === avatarId);
  if (!avatar) return null;

  const isSmall = size === "sm";

  return (
    <View
      style={[
        isSmall ? ui.avatarSm : ui.avatar,
        { backgroundColor: avatar.color },
      ]}
    >
      <Text style={isSmall ? ui.avatarEmojiSm : ui.avatarEmoji}>
        {avatar.name}
      </Text>
    </View>
  );
}
