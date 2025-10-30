import { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

export type RoleKey = "admin" | "employer" | "provider" | "driver" | "client" | "guest";
type AuthState = { token: string | null; role: RoleKey };
type AuthContextType = AuthState & {
  setRole: (r: RoleKey) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [role, setRole] = useState<RoleKey>(
    () => (localStorage.getItem("role") as RoleKey) || "guest"
  );

  const value = useMemo(
    () => ({
      token,
      role,
      setRole: (r: RoleKey) => {
        localStorage.setItem("role", r);
        setRole(r);
      },
      setToken: (t: string | null) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        t ? localStorage.setItem("token", t) : localStorage.removeItem("token");
        setToken(t);
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole("guest");
      },
    }),
    [token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
