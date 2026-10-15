import { AuthContext } from "@/components/auth-provider";
    import { authClient } from "@/lib/auth-client";
    import { Link } from "expo-router";
    import { useContext, useState } from "react";
    import { Pressable, Text, TextInput, View } from "react-native";

export default function Login() {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [error, setError] = useState<string | null>(null);

      const handleLogin = async () =>{
        setError(null);

        if(!email || !password){
          setError("Fyll i både e-post och lösenord")
          return;
        }

        const response = await authClient.signIn.email({
          email, 
          password,
        });
        if (response.error){
          setError(response.error.message || "Fel e-post eller lösenord")
          return;
        }
        setIsLoggedIn(true);
      }
  return (
    <View>
      <Text>Login</Text>
      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"/>

        <TextInput
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        />

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      
      {/* Byts ut när man gör den riktiga sidan, just nu bara enkel navigering med hur det tekniskt kommer fungera */}
      <Pressable onPress={handleLogin}
      style={{borderWidth: 1, padding: 10}}>
        <Text>Tryck Här För Att Logga In</Text>
      </Pressable>
      <Link href="/register">Har du inget konto? Skapa konto!</Link>
    </View>
  );
}
