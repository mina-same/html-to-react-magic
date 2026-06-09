import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "association" | "employee" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  assocName: string;
  assocId: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, assocName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateAssocName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    assocName: "",
    assocId: null,
    loading: true,
  });

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role, assoc_name, assoc_id")
      .eq("id", userId)
      .single();
    return data;
  }

  useEffect(() => {
    let mounted = true;

    // Helper to finish loading
    const finish = (newState: Partial<AuthState>) => {
      if (mounted) {
        setState((s) => ({ ...s, ...newState, loading: false }));
        clearTimeout(timeout);
      }
    };

    // Safety timeout: force loading to false after 5s if still stuck
    const timeout = setTimeout(() => {
      if (mounted) {
        setState((s) => {
          if (s.loading) {
            console.warn("Auth initialization timed out, forcing loading state to false");
            return { ...s, loading: false };
          }
          return s;
        });
      }
    }, 5000);

    // Initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          try {
            const profile = await loadProfile(session.user.id);
            finish({
              user: session.user,
              session,
              role: (profile?.role as UserRole) ?? "association",
              assocName: profile?.assoc_name ?? "",
              assocId: profile?.assoc_id ?? null,
            });
          } catch (err) {
            console.error("Auth init error:", err);
            finish({ user: session.user, session, role: "association", assocId: null }); // Fallback
          }
        } else {
          finish({ loading: false });
        }
      })
      .catch((err) => {
        console.error("Session fetch error:", err);
        finish({ loading: false });
      });

    // Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await loadProfile(session.user.id);
          finish({
            user: session.user,
            session,
            role: (profile?.role as UserRole) ?? "association",
            assocName: profile?.assoc_name ?? "",
            assocId: profile?.assoc_id ?? null,
          });
        } catch (err) {
          console.error("Auth change error:", err);
          finish({ user: session.user, session, role: "association", assocId: null });
        }
      } else {
        finish({ user: null, session: null, role: null, assocName: "" });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, assocName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { assoc_name: assocName, role: "association" } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }

  async function updateAssocName(name: string) {
    if (!state.user) return;
    await supabase.from("profiles").update({ assoc_name: name }).eq("id", state.user.id);
    setState((s) => ({ ...s, assocName: name }));
  }

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, resetPassword, updateAssocName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
