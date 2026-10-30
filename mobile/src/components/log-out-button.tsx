import { spacing, ui } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { Pressable, Text } from "react-native";

export default function LogOutButton() {
  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <Pressable onPress={handleLogout} style={[ui.button, ui.buttonSecondary]}>
      <Text
        style={[
          ui.buttonText,
          ui.buttonSecondaryText,
          { paddingHorizontal: spacing.sm },
        ]}
      >
        Logga ut
      </Text>
    </Pressable>
  );
}
