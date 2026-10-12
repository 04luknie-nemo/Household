import { authClient } from "@/lib/auth-client";
// import Linking from "expo-linking";
import { router } from "expo-router";
import { Button } from "react-native";

export default function SocialSignOnButton() {
  const handleSignIn = async () => {
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });

    if (error) {
      console.error(error);
      return;
    }
    // Felsökning
    // console.log(Linking.createURL("/"));
    router.replace("/");
  };

  return <Button title="Continue with Github" onPress={handleSignIn} />;
}
