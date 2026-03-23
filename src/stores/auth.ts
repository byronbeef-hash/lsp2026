import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<() => void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    });
  },

  initialize: async () => {
    const supabase = createClient();

    // Check for an existing session on startup
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    });

    // Subscribe to auth state changes and keep store in sync
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });

    // Return unsubscribe function for cleanup
    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    const supabase = createClient();
    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    // Session update is handled by onAuthStateChange listener
    return { error: null };
  },

  logout: async () => {
    const supabase = createClient();
    set({ isLoading: true });
    await supabase.auth.signOut();
    // State reset handled by onAuthStateChange listener
  },

  register: async (email, password, firstName, lastName) => {
    const supabase = createClient();
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      return { error: error.message, needsConfirmation: false };
    }

    // If email confirmation is required, user.identities will be populated but
    // session will be null until they confirm.
    const needsConfirmation =
      !!data.user && !data.session;

    if (!needsConfirmation && data.user) {
      // Auto-confirmed — create supporting records
      await Promise.allSettled([
        supabase.from("user_settings").insert({
          user_id: data.user.id,
          weight_unit: "kg",
          date_format: "DD/MM/YYYY",
          language: "en",
          notifications_enabled: true,
        }),
        supabase.from("farms").insert({
          owner_id: data.user.id,
          name: `${firstName}'s Farm`,
          location: "",
          size_hectares: 0,
        }),
      ]);
    }

    set({ isLoading: false });
    return { error: null, needsConfirmation };
  },
}));
