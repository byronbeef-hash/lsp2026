"use client";

import { useRef, useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSelect,
} from "@/components/glass";
import {
  User,
  MapPin,
  Settings,
  Lock,
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settings";
import { useRecordsStore } from "@/stores/modules";
import { useMedicalStore } from "@/stores/modules";
import { usePaddockStore } from "@/stores/modules";
import { useSalesStore } from "@/stores/modules";

export default function SettingsPage() {
  const settingsStore = useSettingsStore();
  const { profile, farm, preferences, updateProfile, updateFarm, updatePreferences } = settingsStore;

  // Local form state — mirrors store, committed on "Save Changes"
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);

  const [farmName, setFarmName] = useState(farm.farmName);
  const [location, setLocation] = useState(farm.location);
  const [farmSize, setFarmSize] = useState(farm.farmSize);

  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">(preferences.weightUnit);
  const [dateFormat, setDateFormat] = useState(preferences.dateFormat);
  const [language, setLanguage] = useState(preferences.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.notificationsEnabled);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const records = useRecordsStore((s) => s.records);
  const batches = useMedicalStore((s) => s.batches);
  const paddocks = usePaddockStore((s) => s.paddocks);
  const sales = useSalesStore((s) => s.sales);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveChanges = () => {
    updateProfile({ firstName, lastName, email });
    updateFarm({ farmName, location, farmSize });
    updatePreferences({ weightUnit, dateFormat, language, notificationsEnabled });
    showToast("Settings saved successfully");
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: {
        profile: { firstName, lastName, email },
        farm: { farmName, location, farmSize },
        preferences: { weightUnit, dateFormat, language, notificationsEnabled },
      },
      records,
      medicalBatches: batches,
      paddocks,
      sales,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livestock-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Import selected: ${file.name} — full import requires a backend`);
    // Reset file input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/50 mt-1">Account and farm configuration</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in-up">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm ${
              toast.type === "success" ? "bg-emerald-500/90" : "bg-red-500/90"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-300">Delete Account</h3>
              </div>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/70 mb-2">
              Account deletion is a permanent action.
            </p>
            <p className="text-sm text-amber-300/90 mb-6">
              This feature requires a backend service to process account deletion securely. Please contact support to delete your account.
            </p>
            <div className="flex gap-3">
              <GlassButton
                variant="default"
                className="flex-1"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Profile */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput
              label="First Name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
            <GlassInput
              label="Last Name"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
          <div className="mt-4">
            <GlassInput
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>
        </GlassCard>
      </div>

      {/* Farm Details */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Farm Details</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput
              label="Farm Name"
              name="farmName"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Farm name"
            />
            <GlassInput
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>
          <div className="mt-4 sm:w-1/2">
            <GlassInput
              label="Farm Size (hectares)"
              name="farmSize"
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              placeholder="Farm size in hectares"
            />
          </div>
        </GlassCard>
      </div>

      {/* Preferences */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "150ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Weight Unit Toggle */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">Weight Unit</label>
              <div className="flex rounded-xl overflow-hidden border border-white/15">
                <button
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    weightUnit === "kg"
                      ? "bg-white/20 text-white"
                      : "bg-transparent text-white/50 hover:text-white/70"
                  }`}
                  onClick={() => setWeightUnit("kg")}
                >
                  Kilograms (kg)
                </button>
                <button
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 border-l border-white/15 ${
                    weightUnit === "lb"
                      ? "bg-white/20 text-white"
                      : "bg-transparent text-white/50 hover:text-white/70"
                  }`}
                  onClick={() => setWeightUnit("lb")}
                >
                  Pounds (lb)
                </button>
              </div>
              {weightUnit === "lb" && (
                <p className="text-xs text-amber-300/80">
                  Weight values will display in pounds (lb) across the app after saving.
                </p>
              )}
            </div>

            <GlassSelect
              label="Date Format"
              name="dateFormat"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              ]}
            />

            <GlassSelect
              label="Language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
              ]}
            />

            {/* Notifications Toggle */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">Notifications</label>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="w-full flex items-center justify-between glass-input"
              >
                <span className="flex items-center gap-2 text-white/80">
                  <Bell className="w-4 h-4" />
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    notificationsEnabled ? "bg-emerald-500/60" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Security */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "200ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">Change your password</p>
          <div className="space-y-4 max-w-md">
            <GlassInput
              label="Current Password"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <GlassInput
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <GlassInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <GlassButton
              variant="default"
              size="sm"
              icon={<Shield className="w-4 h-4" />}
              onClick={() => showToast("Password update requires a backend", "error")}
            >
              Update Password
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Product Tour */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "225ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Product Tour</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Re-launch the guided walkthrough to learn about all features.
          </p>
          <GlassButton
            variant="default"
            icon={<HelpCircle className="w-4 h-4" />}
            onClick={() => {
              localStorage.removeItem("livestock-tour-completed");
              window.dispatchEvent(new Event("restart-product-tour"));
              showToast("Product tour restarted — navigate to the Dashboard to begin");
            }}
          >
            Restart Product Tour
          </GlassButton>
        </GlassCard>
      </div>

      {/* Data Management */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "250ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Data Management</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Export or import your farm data for backup or migration purposes.
          </p>
          <div className="flex flex-wrap gap-3">
            <GlassButton
              variant="default"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportData}
            >
              Export Data
            </GlassButton>
            <GlassButton
              variant="default"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleImportClick}
            >
              Import Data
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Danger Zone */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "300ms" } as React.CSSProperties}
      >
        <GlassCard className="border-red-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <GlassButton
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </GlassButton>
        </GlassCard>
      </div>

      {/* Save Changes */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "350ms" } as React.CSSProperties}
      >
        <GlassButton
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSaveChanges}
        >
          Save Changes
        </GlassButton>
      </div>
    </div>
  );
}
