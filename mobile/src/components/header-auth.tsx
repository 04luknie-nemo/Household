import { authClient } from "@/lib/auth-client";
import { Text } from "react-native";
import SocialSignOnButton from "./sso-button";

export default function HeaderAuth() {
  const session = authClient.useSession();
  if (session.data) return <Text>Inloggad</Text>;
  return <SocialSignOnButton />;
}
