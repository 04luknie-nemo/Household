import { authClient } from "@/lib/auth-client";
import { createContext, useState } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  isPending: true,
  userId: null as string | null,
  sessionId: null as string | null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  if (!isPending && !hasLoaded) {
    setHasLoaded(true);
  }

  const userId = session?.user.id ?? null;
  const sessionId = session?.session.id ?? null;

  return (
    <AuthContext.Provider
      key={sessionId ?? "signed-out"}
      value={{
        isLoggedIn: !!session,
        isPending: !hasLoaded,
        userId,
        sessionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
