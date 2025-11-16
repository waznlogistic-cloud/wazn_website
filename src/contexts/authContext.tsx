import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type RoleKey = "admin" | "employer" | "provider" | "driver" | "client" | "guest";

type AuthContextType = {
  user: User | null;
  role: RoleKey;
  loading: boolean;
  setRole: (r: RoleKey) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleKey>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        // Get role from user metadata or database
        const userRole = (session.user.user_metadata?.role as RoleKey) || "guest";
        setRole(userRole);
      } else {
        setUser(null);
        setRole("guest");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Try to get role from user_metadata first, then from database
        let userRole = (session.user.user_metadata?.role as RoleKey) || "guest";
        
        // If role not in metadata, try to get from profiles table
        if (userRole === "guest" && session.user.id) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();
            
            if (profile?.role) {
              userRole = profile.role as RoleKey;
            }
          } catch (err) {
            console.error("Error fetching profile role:", err);
          }
        }
        
        setRole(userRole);
      } else {
        setUser(null);
        setRole("guest");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSetRole = (r: RoleKey) => {
    setRole(r);
    // Optionally update user metadata in Supabase
    if (user) {
      supabase.auth.updateUser({
        data: { role: r },
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    setUser(null);
    setRole("guest");
  };

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      setRole: handleSetRole,
      logout,
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
