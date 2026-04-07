import { create } from "zustand";
import { createClient } from "@/lib/supabase";

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
}

interface FarmSettings {
  farmName: string;
  location: string;
  farmSize: string;
}

interface PreferencesSettings {
  weightUnit: "kg" | "lb";
  dateFormat: string;
  language: string;
  notificationsEnabled: boolean;
}

interface SettingsState {
  profile: ProfileSettings;
  farm: FarmSettings;
  preferences: PreferencesSettings;
  loading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileSettings>) => Promise<void>;
  updateFarm: (updates: Partial<FarmSettings>) => Promise<void>;
  updatePreferences: (updates: Partial<PreferencesSettings>) => Promise<void>;
}

const defaultProfile: ProfileSettings = {
  firstName: "Brad",
  lastName: "Anderson",
  email: "",
};

const defaultFarm: FarmSettings = {
  farmName: "Nimbin Station",
  location: "Nimbin NSW 2480",
  farmSize: "215",
};

const defaultPreferences: PreferencesSettings = {
  weightUnit: "kg",
  dateFormat: "DD/MM/YYYY",
  language: "en",
  notificationsEnabled: true,
};

async function upsertSettings(patch: Record<string, unknown>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  return supabase
    .from("user_settings")
    .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
    .select()
    .single();
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile: defaultProfile,
  farm: defaultFarm,
  preferences: defaultPreferences,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, error: "Not authenticated" });
      return;
    }
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found — treat as first-time user, keep defaults
      set({ error: error.message, loading: false });
      return;
    }
    if (data) {
      set({
        profile: {
          firstName: data.first_name ?? defaultProfile.firstName,
          lastName: data.last_name ?? defaultProfile.lastName,
          email: data.email ?? user.email ?? defaultProfile.email,
        },
        farm: {
          farmName: data.farm_name ?? defaultFarm.farmName,
          location: data.location ?? defaultFarm.location,
          farmSize: data.farm_size ?? defaultFarm.farmSize,
        },
        preferences: {
          weightUnit: data.weight_unit ?? defaultPreferences.weightUnit,
          dateFormat: data.date_format ?? defaultPreferences.dateFormat,
          language: data.language ?? defaultPreferences.language,
          notificationsEnabled: data.notifications_enabled ?? defaultPreferences.notificationsEnabled,
        },
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
    }));
    const { profile } = get();
    const { error } = await upsertSettings({
      first_name: profile.firstName,
      last_name: profile.lastName,
      email: profile.email,
    });
    if (error) {
      set({ error: (error as Error).message });
    }
  },

  updateFarm: async (updates) => {
    set((state) => ({
      farm: { ...state.farm, ...updates },
    }));
    const { farm } = get();
    const { error } = await upsertSettings({
      farm_name: farm.farmName,
      location: farm.location,
      farm_size: farm.farmSize,
    });
    if (error) {
      set({ error: (error as Error).message });
    }
  },

  updatePreferences: async (updates) => {
    set((state) => ({
      preferences: { ...state.preferences, ...updates },
    }));
    const { preferences } = get();
    const { error } = await upsertSettings({
      weight_unit: preferences.weightUnit,
      date_format: preferences.dateFormat,
      language: preferences.language,
      notifications_enabled: preferences.notificationsEnabled,
    });
    if (error) {
      set({ error: (error as Error).message });
    }
  },
}));
