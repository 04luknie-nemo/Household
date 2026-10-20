import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError("Fyll i både e-post och lösenord");
      return;
    }

    const response = await authClient.signIn.email({
      email,
      password,
    });
    if (response.error) {
      setError(response.error.message || "Fel e-post eller lösenord");
      return;
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);
    const { error: signInError } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });

    if (signInError) {
      setError(signInError.message || "Kunde inte logga in med GitHub");
      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            marginTop: spacing.md,
          }}
        >
          <View
            style={[
              ui.iconCircle,
              { width: 72, height: 72, borderRadius: radius.pill },
            ]}
          >
            <Ionicons name="home-outline" size={36} color={colors.onPrimary} />
          </View>
          <Text style={[typography.title, { fontSize: 24, fontWeight: "700" }]}>
            Hushållet
          </Text>
        </View>

        <Text
          style={[
            typography.body,
            { color: colors.textMuted, textAlign: "center" },
          ]}
        >
          Logga in för att komma åt dina hushållslistor
        </Text>

        <View style={{ gap: spacing.xs }}>
          <Text style={typography.label}>E-postadress</Text>
          <TextInput
            style={[
              ui.input,
              {
                backgroundColor: colors.card,
                borderRadius: radius.md,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            placeholder="name@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={typography.label}>Lösenord</Text>
          <TextInput
            style={[
              ui.input,
              {
                backgroundColor: colors.card,
                borderRadius: radius.md,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            placeholder="........."
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error && (
          <Text
            style={[
              typography.caption,
              { color: colors.primary, textAlign: "center" },
            ]}
          >
            {error}
          </Text>
        )}

        <Pressable
          style={[
            ui.button,
            {
              paddingVertical: 14,
              borderRadius: radius.pill,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            },
          ]}
          onPress={handleLogin}
        >
          <Text style={[ui.buttonText, { fontSize: 18, fontWeight: "700" }]}>
            Logga in
          </Text>
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: spacing.xs,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
          <Text
            style={[
              typography.caption,
              { marginHorizontal: spacing.md, color: colors.textMuted },
            ]}
          >
            eller
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text
            style={[
              typography.caption,
              { textAlign: "center", color: colors.textMuted, fontSize: 14 },
            ]}
          >
            Logga in med
          </Text>
          <Pressable
            style={[
              ui.button,
              ui.buttonSecondary,
              {
                paddingVertical: 14,
                borderRadius: radius.md,
                backgroundColor: colors.card,
              },
            ]}
            onPress={handleGitHubLogin}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Github
            </Text>
          </Pressable>
        </View>

        <Link
          href="/register"
          style={{ alignSelf: "center", marginTop: spacing.sm }}
        >
          <Text style={typography.body}>
            Har du inget konto?{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              Skapa ett konto
            </Text>
          </Text>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
