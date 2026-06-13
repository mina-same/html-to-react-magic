import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { associationsDb, type Association } from "@/lib/db";

export type UserRole = "admin" | "association" | "employee" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  assocName: string;
  assocId: string | null;
  associationStatus: string | null;
  associationProfile: Association | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateAssocName: (name: string) => Promise<void>;
  completeOnboarding: (data: {
    assocName: string;
    license: string;
    region: string;
    phone: string;
    email: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    assocName: "",
    assocId: null,
    associationStatus: null,
    associationProfile: null,
    loading: true,
  });

  async function loadProfile(userId: string) {
    // First get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, assoc_name, assoc_id")
      .eq("id", userId)
      .single();

    let associationStatus: string | null = null;
    let associationProfile: Association | null = null;

    if (profile) {
      if (profile.role === "association") {
        // If user is an association, get their full profile
        associationProfile = await associationsDb.get(userId);
        associationStatus = associationProfile?.status ?? null;
      } else if (profile.role === "employee" && profile.assoc_id) {
        // If user is an employee, get the associated association's status
        const { data: assoc } = await supabase
          .from("associations")
          .select("status")
          .eq("id", profile.assoc_id)
          .single();
        associationStatus = assoc?.status ?? null;
      }
    }

    return { ...profile, associationStatus, associationProfile };
  }

  useEffect(() => {
    let mounted = true;
    let timeout: NodeJS.Timeout;

    // Helper to finish loading
    const finish = (newState: Partial<AuthState>) => {
      if (mounted) {
        setState((s) => ({ ...s, ...newState, loading: false }));
        clearTimeout(timeout);
      }
    };

    // Safety timeout: force loading to false after 5s if still stuck
    timeout = setTimeout(() => {
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
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          // If association is suspended, sign out immediately
          if (profile?.associationStatus === "suspended") {
            await supabase.auth.signOut();
            finish({ loading: false });
            return;
          }
          finish({
            user: session.user,
            session,
            role: (profile?.role as UserRole) ?? "association",
            assocName: profile?.assoc_name ?? "",
            assocId: profile?.assoc_id ?? null,
            associationStatus: profile?.associationStatus ?? null,
            associationProfile: profile?.associationProfile ?? null,
          });
        } else {
          finish({ loading: false });
        }
      } catch (err) {
        console.error("Auth init error:", err);
        finish({ loading: false });
      }
    };

    init();

    // Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await loadProfile(session.user.id);
          // If association is suspended, sign out immediately
          if (profile?.associationStatus === "suspended") {
            await supabase.auth.signOut();
            finish({ loading: false });
            return;
          }
          finish({
            user: session.user,
            session,
            role: (profile?.role as UserRole) ?? "association",
            assocName: profile?.assoc_name ?? "",
            assocId: profile?.assoc_id ?? null,
            associationStatus: profile?.associationStatus ?? null,
            associationProfile: profile?.associationProfile ?? null,
          });
        } catch (err) {
          console.error("Auth change error:", err);
          finish({
            user: session.user,
            session,
            role: "association",
            assocId: null,
            associationStatus: null,
            associationProfile: null,
          });
        }
      } else {
        finish({ user: null, session: null, role: null, assocName: "", associationProfile: null });
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: "association" } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    // First update state to clear user, then sign out
    setState((s) => ({
      ...s,
      user: null,
      session: null,
      role: null,
      assocName: "",
      assocId: null,
      associationStatus: null,
    }));
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

  async function completeOnboarding(data: {
    assocName: string;
    license: string;
    region: string;
    phone: string;
    email: string;
  }) {
    if (!state.user) return;
    // Update profile
    await supabase.from("profiles").update({ assoc_name: data.assocName }).eq("id", state.user.id);
    // Update associations record
    await associationsDb.upsert(state.user.id, {
      license: data.license,
      region: data.region,
      phone: data.phone,
      email: data.email,
    });
    // Reload profile
    const profile = await loadProfile(state.user.id);
    setState((s) => ({
      ...s,
      assocName: profile?.assoc_name ?? data.assocName,
      associationProfile: profile?.associationProfile ?? null,
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateAssocName,
        completeOnboarding,
      }}
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
