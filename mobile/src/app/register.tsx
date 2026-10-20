import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View, TextInput } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    if (!name || !email || !password) {
      setError("Alla fält måste fyllas i");
      return;
    }

    const response = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (response.error) {
      setError(response.error.message || "Kunde inte skapa konto");
      return;
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text>Skapa konto</Text>

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <TextInput
        placeholder="Namn"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 8 }}
      />

      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8 }}
      />

      <TextInput
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8 }}
      />

      <Pressable
        onPress={handleRegister}
        style={{ borderWidth: 1, padding: 10 }}
      >
        <Text>Skapa konto</Text>
      </Pressable>

      <Link href="/login">
        <Text>Har du redan ett konto? Logga in</Text>
      </Link>
    </View>
  );
}
