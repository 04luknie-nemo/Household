import { colors, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Pressable, Text } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  code: string;
};

export default function CopyCodeButton({ code }: Props) {
  async function copyInviteCode() {
    if (!code) return;

    try {
      await Clipboard.setStringAsync(code);
      Toast.show({
        type: "success",
        text1: "Kopierat till urklipp",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Något gick fel vid kopiering av koden",
      });
    }
  }

  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
      }}
      onPress={copyInviteCode}
    >
      <Ionicons name="copy-outline" size={24} color={colors.primary} />
      <Text style={{ color: colors.primary }}>Kopiera</Text>
    </Pressable>
  );
}
