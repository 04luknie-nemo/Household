import { authClient } from "@/lib/auth-client";
import { createContext } from "react";

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
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id ?? null;
  const sessionId = session?.session.id ?? null;

  return (
    <AuthContext.Provider
      key={sessionId ?? "signed-out"}
      value={{ isLoggedIn: !!session, isPending, userId, sessionId }}
    >
      {children}
    </AuthContext.Provider>
  );
}
