import type { ThemeMode } from "@/db/schema";
import { themeModeValues } from "@/db/schema";
import {
  exportBackup,
  getAppSettings,
  importBackup,
  pickCustomSound,
  playSelectedSound,
  resetAllData,
  updateCustomSoundUri,
  updateHapticsEnabled,
  updateNotificationsEnabled,
  updateQuietHoursEnabled,
  updateQuietHoursEnd,
  updateQuietHoursStart,
  updateSoundEnabled,
  updateTheme,
  updateWeekStartsOn,
  type BundledSound,
} from "@/lib/settings";
import { useAppThemeColor } from "@/theme/app-theme";
import { syncScheduledHabitNotifications } from "@/lib/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert } from "react-native";

export const WEEK_OPTIONS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Saturday", value: 6 },
] as const;

type SettingsAction =
  | { type: "theme"; value: ThemeMode }
  | { type: "notifications"; value: boolean }
  | { type: "quiet-enabled"; value: boolean }
  | { type: "quiet-start"; value: number }
  | { type: "quiet-end"; value: number }
  | { type: "sound-enabled"; value: boolean }
  | { type: "haptics-enabled"; value: boolean }
  | { type: "week"; value: number };

export const useSettingsScreen = () => {
  const queryClient = useQueryClient();
  const { setColorScheme } = useColorScheme();
  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const success = useAppThemeColor("success");
  const destructive = useAppThemeColor("destructive");
  const [quietHoursVisible, setQuietHoursVisible] = useState(false);
  const [soundModalVisible, setSoundModalVisible] = useState(false);
  const [quietEnabledDraft, setQuietEnabledDraft] = useState(true);
  const [quietStartDraft, setQuietStartDraft] = useState(1320);
  const [quietEndDraft, setQuietEndDraft] = useState(420);

  const settingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: getAppSettings,
  });

  const settings = settingsQuery.data;
  const theme = settings?.theme ?? "SYSTEM";
  const notificationsEnabled = settings?.notificationsEnabled ?? true;
  const quietHoursEnabled = settings?.quietHoursEnabled ?? true;
  const quietHoursStart = settings?.quietHoursStartMinutes ?? 1320;
  const quietHoursEnd = settings?.quietHoursEndMinutes ?? 420;
  const soundEnabled = settings?.soundEnabled ?? true;
  const hapticsEnabled = settings?.hapticsEnabled ?? true;
  const customSoundUri = settings?.customSoundUri ?? "bundled:chime";
  const weekStartsOn = settings?.weekStartsOn ?? 1;

  const settingsMutation = useMutation({
    mutationFn: async (action: SettingsAction) => {
      switch (action.type) {
        case "theme":
          await updateTheme(action.value);
          break;
        case "notifications":
          await updateNotificationsEnabled(action.value);
          break;
        case "quiet-enabled":
          await updateQuietHoursEnabled(action.value);
          break;
        case "quiet-start":
          await updateQuietHoursStart(action.value);
          break;
        case "quiet-end":
          await updateQuietHoursEnd(action.value);
          break;
        case "sound-enabled":
          await updateSoundEnabled(action.value);
          break;
        case "haptics-enabled":
          await updateHapticsEnabled(action.value);
          break;
        case "week":
          await updateWeekStartsOn(action.value);
          break;
      }
    },
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: ["app-settings"] });

      if (action.type === "week") {
        await Promise.all(
          ["today", "habits", "progress", "history", "habit"].map(
            (queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] }),
          ),
        );
      }
    },
  });

  const soundMutation = useMutation({
    mutationFn: updateCustomSoundUri,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });

  const exportMutation = useMutation({ mutationFn: exportBackup });
  const importMutation = useMutation({
    mutationFn: importBackup,
    onSuccess: (imported) => {
      if (imported) {
        void syncScheduledHabitNotifications().catch((error) => {
          console.error("Failed to refresh habit reminders:", error);
        });
        void queryClient.invalidateQueries();
      }
    },
  });
  const resetMutation = useMutation({
    mutationFn: resetAllData,
    onSuccess: async () => {
      await syncScheduledHabitNotifications();
      await queryClient.invalidateQueries();
      setColorScheme("system");
    },
  });

  const busy =
    settingsMutation.isPending ||
    soundMutation.isPending ||
    exportMutation.isPending ||
    importMutation.isPending ||
    resetMutation.isPending;

  const selectedWeekLabel =
    WEEK_OPTIONS.find((option) => option.value === weekStartsOn)?.label ??
    "Monday";

  const handleThemeChange = (value: ThemeMode) => {
    setColorScheme(
      value === "SYSTEM" ? "system" : value === "LIGHT" ? "light" : "dark",
    );
    settingsMutation.mutate({ type: "theme", value });
  };

  const openQuietHours = () => {
    setQuietEnabledDraft(quietHoursEnabled);
    setQuietStartDraft(quietHoursStart);
    setQuietEndDraft(quietHoursEnd);
    setQuietHoursVisible(true);
  };

  const saveQuietHours = async () => {
    try {
      await settingsMutation.mutateAsync({
        type: "quiet-enabled",
        value: quietEnabledDraft,
      });
      await settingsMutation.mutateAsync({
        type: "quiet-start",
        value: quietStartDraft,
      });
      await settingsMutation.mutateAsync({
        type: "quiet-end",
        value: quietEndDraft,
      });
      await syncScheduledHabitNotifications();
      setQuietHoursVisible(false);
    } catch {
      Alert.alert("Error", "Could not save quiet hours.");
    }
  };

  const chooseBundledSound = async (sound: BundledSound) => {
    try {
      const uri = `bundled:${sound.id}`;
      await soundMutation.mutateAsync(uri);
      await syncScheduledHabitNotifications();
      if (soundEnabled) await playSelectedSound(uri);
      if (hapticsEnabled) await Haptics.selectionAsync();
      setSoundModalVisible(false);
    } catch (error) {
      console.error("chooseBundledSound error:", error);
      Alert.alert("Error", "Could not select this sound.");
    }
  };

  const chooseDeviceSound = async () => {
    try {
      const uri = await pickCustomSound();
      if (!uri) return;
      await syncScheduledHabitNotifications();
      if (soundEnabled) await playSelectedSound(uri);
      if (hapticsEnabled) await Haptics.selectionAsync();
      await queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      setSoundModalVisible(false);
    } catch (error) {
      console.error("chooseDeviceSound error:", error);
      Alert.alert("Error", "Could not select the audio file.");
    }
  };

  const previewSound = async () => {
    try {
      if (soundEnabled) await playSelectedSound(customSoundUri);
      if (hapticsEnabled) await Haptics.selectionAsync();
    } catch {
      Alert.alert("Error", "Could not play this sound.");
    }
  };

  const handleImport = () => {
    Alert.alert(
      "Import Backup",
      "This will replace your current habits and history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            try {
              await importMutation.mutateAsync();
            } catch(error) {
              console.error("IMPORT BACKUP ERROR:", error);

              const message =
                error instanceof Error ? error.message : String(error);

              
              Alert.alert("Error", "Could not import the backup.");
            }
          },
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset All Data?",
      "This permanently deletes your habits, history, reminders, and settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await resetMutation.mutateAsync();
            } catch {
              Alert.alert("Error", "Could not reset your data.");
            }
          },
        },
      ],
    );
  };

  const handleNotificationsChange = async (value: boolean) => {
    try {
      await settingsMutation.mutateAsync({ type: "notifications", value });
      const result = await syncScheduledHabitNotifications({
        requestPermission: value,
      });

      if (value && result.status === "permission-denied") {
        Alert.alert(
          "Notifications are off",
          "Allow notifications in your device settings to receive habit reminders.",
        );
      }
    } catch {
      Alert.alert("Error", "Could not update reminder settings.");
    }
  };

  const handleSoundEnabledChange = async (value: boolean) => {
    try {
      await settingsMutation.mutateAsync({ type: "sound-enabled", value });
      await syncScheduledHabitNotifications();
    } catch {
      Alert.alert("Error", "Could not update sound settings.");
    }
  };

  return {
    colors: { primary, mutedForeground, success, destructive },
    settingsQuery,
    settingsMutation,
    soundMutation,
    exportMutation,
    importMutation,
    resetMutation,
    busy,
    theme,
    notificationsEnabled,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    soundEnabled,
    hapticsEnabled,
    customSoundUri,
    weekStartsOn,
    selectedWeekLabel,
    quietHoursVisible,
    soundModalVisible,
    quietEnabledDraft,
    quietStartDraft,
    quietEndDraft,
    setQuietHoursVisible,
    setSoundModalVisible,
    setQuietEnabledDraft,
    setQuietStartDraft,
    setQuietEndDraft,
    handleThemeChange,
    handleNotificationsChange,
    handleSoundEnabledChange,
    openQuietHours,
    saveQuietHours,
    chooseBundledSound,
    chooseDeviceSound,
    previewSound,
    handleImport,
    handleReset,
    themeModeValues,
  };
};
