import { AuthContext } from "@/components/auth-provider";
import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Register() {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Alla fält måste fyllas i");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    try {
      const response = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.error) {
        setError(response.error.message || "Kunde inte skapa konto");
        return;
      }

      setIsLoggedIn(true);
    } catch {
      setError("Kunde inte skapa konto. Försök igen.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skapa konto</Text>
      <Text style={styles.subtitle}>Bli en del av hushållet</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Namn"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="E-post"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Lösenord"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Bekräfta lösenord"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          onPress={handleRegister}
          style={ui.button}
          accessibilityRole="button"
        >
          <Text style={ui.buttonText}>Skapa konto</Text>
        </Pressable>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>Har du redan ett konto? </Text>
          <Link href="/login" style={styles.link}>
            Logga in
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  title: {
    ...typography.title,
    textAlign: "center",
    fontSize: 22,
  },
  subtitle: {
    ...typography.caption,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  error: {
    ...typography.caption,
    color: colors.primary,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  loginText: {
    ...typography.caption,
  },
  link: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
  },
});
