import { spacing, ui } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { Pressable, StyleSheet, Text } from "react-native";

// compact används i headern, där knappen ska vara lika låg som ikonknapparna
export default function LogOutButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <Pressable
      onPress={handleLogout}
      accessibilityRole="button"
      style={[ui.button, ui.buttonSecondary, compact && styles.compact]}
    >
      <Text
        style={[
          ui.buttonText,
          ui.buttonSecondaryText,
          compact && styles.compactText,
        ]}
      >
        Logga ut
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compact: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
  },
  compactText: {
    fontSize: 14,
  },
});
