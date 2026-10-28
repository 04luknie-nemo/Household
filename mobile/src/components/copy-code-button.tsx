import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  code: string;
};

export default function CopyCodeButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [copied]);

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
      onPress={copyInviteCode}
      disabled={!code}
      accessibilityRole="button"
      accessibilityLabel="Kopiera anslutningskoden"
    >
      <Feather name="copy" size={24} color={colors.text} />
    </Pressable>
  );
}
