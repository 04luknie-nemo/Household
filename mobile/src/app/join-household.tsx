import { ui } from "@/constants/theme";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function JoinHousehold() {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Text>Gå med i hushåll</Text>

      <TextInput
        value={inviteCode}
        onChangeText={setInviteCode}
        placeholder="Skriv in anslutningskoden"
        autoCapitalize="characters"
        autoCorrect={false}
        style={ui.input}
      />

      <Pressable
        style={ui.button}
        disabled={!inviteCode.trim()}
        onPress={() => {
          console.log("Anslutningskod:", inviteCode.trim());
        }}
      >
        <Text style={ui.buttonText}>Gå med</Text>
      </Pressable>
    </View>
  );
}
