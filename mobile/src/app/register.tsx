import { colors, spacing, typography, ui } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Register() {
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
    } catch {
      setError("Kunde inte skapa konto. Försök igen.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.title, { textAlign: "center" }]}>
        Skapa konto
      </Text>

      <Text
        style={[
          typography.caption,
          { textAlign: "center", marginBottom: spacing.lg },
        ]}
      >
        Bli en del av hushållet
      </Text>

      <View style={styles.form}>
        <View style={[ui.card, styles.inputContainer]}>
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

        <View style={[ui.card, styles.inputContainer]}>
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
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

        <View style={[ui.card, styles.inputContainer]}>
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

        <View style={[ui.card, styles.inputContainer]}>
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

        {error && (
          <Text style={[typography.caption, { color: colors.primary }]}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleRegister}
          style={[ui.button, styles.button]}
          accessibilityRole="button"
        >
          <Text style={ui.buttonText}>Skapa konto</Text>
        </Pressable>

        <View style={styles.loginLink}>
          <Text style={typography.caption}>Har du redan ett konto? </Text>
          <Link
            href="/login"
            style={[
              typography.caption,
              { color: colors.text, fontWeight: "600" },
            ]}
          >
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
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  form: {
    gap: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: ui.input.fontSize,
    color: colors.text,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
});
