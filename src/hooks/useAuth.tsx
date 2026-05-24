import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "association" | null;

interface AuthState {
  user:    User | null;
  session: Session | null;
  role:    UserRole;
  assocName: string;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn:   (email: string, password: string) => Promise<{ error: string | null }>;
  signUp:   (email: string, password: string, assocName: string) => Promise<{ error: string | null }>;
  signOut:  () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateAssocName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, role: null, assocName: "", loading: true,
  });

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role, assoc_name")
      .eq("id", userId)
      .single();
    return data;
  }

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setState({ user: session.user, session, role: (profile?.role as UserRole) ?? "association", assocName: profile?.assoc_name ?? "", loading: false });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setState({ user: session.user, session, role: (profile?.role as UserRole) ?? "association", assocName: profile?.assoc_name ?? "", loading: false });
      } else {
        setState({ user: null, session: null, role: null, assocName: "", loading: false });
      }
    });

    return () => subscription.unsubscribe();
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
    setState(s => ({ ...s, assocName: name }));
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, resetPassword, updateAssocName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
