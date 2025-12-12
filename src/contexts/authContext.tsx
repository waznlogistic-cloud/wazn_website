import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import type { PropsWithChildren } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export type RoleKey = "admin" | "employer" | "provider" | "driver" | "client" | "guest";

type AuthContextType = {
  user: User | null;
  role: RoleKey;
  loading: boolean;
  setRole: (r: RoleKey) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch user role from metadata or database
 * This ensures consistent role-fetching logic across initial session and auth state changes
 */
async function fetchUserRole(user: User): Promise<RoleKey> {
  // Try to get role from user_metadata first
  let userRole = (user.user_metadata?.role as RoleKey) || "guest";
  
  // If role not in metadata, try to get from profiles table
  if (userRole === "guest" && user.id) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role) {
        userRole = profile.role as RoleKey;
      }
    } catch (err) {
      console.error("Error fetching profile role:", err);
    }
  }
  
  return userRole;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleKey>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes - this fires immediately for the current session
    // and for all subsequent auth state changes. Using this as the single source
    // of truth prevents race conditions between initial fetch and listener.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        // Use consistent role-fetching logic for all auth state changes
        const userRole = await fetchUserRole(session.user);
        setRole(userRole);
      } else {
        setUser(null);
        setRole("guest");
      }
      setLoading(false);
    });

    // Get initial session as a fallback for error handling
    // onAuthStateChange fires immediately, so this mainly handles error cases
    supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: any }, error: any }) => {
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      // If no session, set state immediately (onAuthStateChange will also fire with null)
      // If session exists, onAuthStateChange already handled it above
      if (!session?.user) {
        setUser(null);
        setRole("guest");
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSetRole = useCallback(async (r: RoleKey) => {
    setRole(r);
    // Update user metadata in Supabase with proper error handling
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { role: r },
        });
        if (error) {
          console.error("Error updating user role in metadata:", error);
        }
      } catch (err) {
        console.error("Error updating user role:", err);
      }
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      // Try to sign out, but don't fail if network is unavailable
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Only log network errors, don't block logout
        if (!error.message.includes('Failed to fetch') && !error.message.includes('ERR_CONNECTION')) {
          console.error("Error signing out:", error);
        }
      }
    } catch (err: any) {
      // Network errors shouldn't prevent logout
      if (!err?.message?.includes('Failed to fetch') && !err?.message?.includes('ERR_CONNECTION')) {
        console.error("Error signing out:", err);
      }
    } finally {
      // Always clear local state, even if network request fails
      setUser(null);
      setRole("guest");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      setRole: handleSetRole,
      logout,
    }),
    [user, role, loading, handleSetRole, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
