import { db } from "@/db/client";
import type { ThemeMode } from "@/db/schema";
import {
  appSettings,
  habit,
  habitEntry,
  habitReminder,
  habitScheduleDay,
} from "@/db/schema";
import { addMinutes, format, startOfDay } from "date-fns";
import { eq } from "drizzle-orm";
import { createAudioPlayer } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { File } from "expo-file-system";

export type BundledSoundId = "chime" | "bell" | "soft-notification";

export type SoundSelection =
  | {
      type: "bundled";
      id: BundledSoundId;
    }
  | {
      type: "custom";
      uri: string;
    };

export type SettingsBackup = {
  version: 1;
  exportedAt: string;
  appSettings: {
    id: number;
    theme: ThemeMode;
    weekStartsOn: number;
    notificationsEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStartMinutes: number;
    quietHoursEndMinutes: number;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    customSoundUri: string | null;
  } | null;
  habits: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string | null;
    frequency: "DAILY" | "SPECIFIC_DAYS" | "TIMES_PER_WEEK";
    timesPerWeek: number | null;
    targetValue: number | null;
    targetUnit: string | null;
    position: number;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  scheduleDays: Array<{
    habitId: string;
    weekday: number;
  }>;
  entries: Array<{
    id: string;
    habitId: string;
    dateKey: string;
    value: number;
    completedAt: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  reminders: Array<{
    id: string;
    habitId: string;
    enabled: boolean;
    timeMinutes: number;
    notificationId: string | null;
  }>;
};

export type BundledSound = {
  id: BundledSoundId;
  label: string;
  source: number;
};

export const bundledSounds: BundledSound[] = [
  {
    id: "chime",
    label: "Chime",
    source: require("@/assets/sounds/chime.mp3"),
  },
  {
    id: "bell",
    label: "Bell",
    source: require("@/assets/sounds/bell.mp3"),
  },
  {
    id: "soft-notification",
    label: "Soft Notification",
    source: require("@/assets/sounds/soft-notification.mp3"),
  },
];

const DEFAULT_SETTINGS = {
  id: 1,
  theme: "SYSTEM" as ThemeMode,
  weekStartsOn: 1,
  notificationsEnabled: true,
  quietHoursEnabled: true,
  quietHoursStartMinutes: 1320,
  quietHoursEndMinutes: 420,
  soundEnabled: true,
  hapticsEnabled: true,
  customSoundUri: "bundled:chime",
};

export const getAppSettings = async () => {
  const existingSettings = await db.query.appSettings.findFirst({
    where: eq(appSettings.id, 1),
  });

  if (existingSettings) {
    return existingSettings;
  }

  const [createdSettings] = await db
    .insert(appSettings)
    .values(DEFAULT_SETTINGS)
    .returning();

  return createdSettings;
};

export const updateTheme = async (theme: ThemeMode) => {
  await db.update(appSettings).set({ theme }).where(eq(appSettings.id, 1));
};

export const updateNotificationsEnabled = async (
  notificationsEnabled: boolean,
) => {
  await db
    .update(appSettings)
    .set({ notificationsEnabled })
    .where(eq(appSettings.id, 1));
};

export const updateWeekStartsOn = async (weekStartsOn: number) => {
  await db
    .update(appSettings)
    .set({ weekStartsOn })
    .where(eq(appSettings.id, 1));
};

export const updateQuietHoursEnabled = async (quietHoursEnabled: boolean) => {
  await db
    .update(appSettings)
    .set({ quietHoursEnabled })
    .where(eq(appSettings.id, 1));
};

export const updateQuietHoursStart = async (quietHoursStartMinutes: number) => {
  await db
    .update(appSettings)
    .set({ quietHoursStartMinutes })
    .where(eq(appSettings.id, 1));
};

export const updateQuietHoursEnd = async (quietHoursEndMinutes: number) => {
  await db
    .update(appSettings)
    .set({ quietHoursEndMinutes })
    .where(eq(appSettings.id, 1));
};

export const updateSoundEnabled = async (soundEnabled: boolean) => {
  await db
    .update(appSettings)
    .set({ soundEnabled })
    .where(eq(appSettings.id, 1));
};

export const updateHapticsEnabled = async (hapticsEnabled: boolean) => {
  await db
    .update(appSettings)
    .set({ hapticsEnabled })
    .where(eq(appSettings.id, 1));
};

export const updateCustomSoundUri = async (customSoundUri: string | null) => {
  await db
    .update(appSettings)
    .set({ customSoundUri })
    .where(eq(appSettings.id, 1));
};

export const formatMinutes = (minutes: number) => {
  return format(
    addMinutes(startOfDay(new Date()), minutes),
    "h:mm a",
  );
};

export const getSoundSelection = (
  customSoundUri: string | null,
): SoundSelection => {
  if (customSoundUri?.startsWith("bundled:")) {
    const id = customSoundUri.replace("bundled:", "") as BundledSoundId;

    const bundledSound = bundledSounds.find((sound) => sound.id === id);

    if (bundledSound) {
      return {
        type: "bundled",
        id,
      };
    }
  }

  if (customSoundUri) {
    return {
      type: "custom",
      uri: customSoundUri,
    };
  }

  return {
    type: "bundled",
    id: "chime",
  };
};

export const getSoundLabel = (customSoundUri: string | null) => {
  const selection = getSoundSelection(customSoundUri);

  if (selection.type === "custom") {
    return "From device";
  }

  return (
    bundledSounds.find((sound) => sound.id === selection.id)?.label ?? "Chime"
  );
};

export const pickCustomSound = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "audio/*",
    multiple: false,
    copyToCacheDirectory: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  const fileName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const destinationUri = `${FileSystem.documentDirectory}sounds/${fileName}`;

  const soundsDirectory = `${FileSystem.documentDirectory}sounds`;

  await FileSystem.makeDirectoryAsync(soundsDirectory, {
    intermediates: true,
  });

  await FileSystem.copyAsync({
    from: asset.uri,
    to: destinationUri,
  });

  await updateCustomSoundUri(destinationUri);

  return destinationUri;
};

export const playSelectedSound = async (customSoundUri: string | null) => {
  const selection = getSoundSelection(customSoundUri);

  const source =
    selection.type === "bundled"
      ? bundledSounds.find((sound) => sound.id === selection.id)?.source
      : selection.uri;

  if (!source) {
    throw new Error("Sound source was not found.");
  }

  const player = createAudioPlayer(source);
  
  player.addListener('playbackStatusUpdate', (status) => {
    if (status.isLoaded && status.didJustFinish) {
      setTimeout(() => {
        player.remove();
      }, 500);
    }
  });

  player.play();
};

export const createBackup = async (): Promise<SettingsBackup> => {
  const [settings, habits, scheduleDays, entries, reminders] =
    await Promise.all([
      db.query.appSettings.findFirst({
        where: eq(appSettings.id, 1),
      }),
      db.select().from(habit),
      db.select().from(habitScheduleDay),
      db.select().from(habitEntry),
      db.select().from(habitReminder),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appSettings: settings
      ? {
          id: settings.id,
          theme: settings.theme,
          weekStartsOn: settings.weekStartsOn,
          notificationsEnabled: settings.notificationsEnabled,
          quietHoursEnabled: settings.quietHoursEnabled,
          quietHoursStartMinutes: settings.quietHoursStartMinutes,
          quietHoursEndMinutes: settings.quietHoursEndMinutes,
          soundEnabled: settings.soundEnabled,
          hapticsEnabled: settings.hapticsEnabled,
          customSoundUri: settings.customSoundUri,
        }
      : null,
    habits: habits.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      color: item.color,
      category: item.category,
      frequency: item.frequency,
      timesPerWeek: item.timesPerWeek,
      targetValue: item.targetValue,
      targetUnit: item.targetUnit,
      position: item.position,
      archivedAt: item.archivedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    scheduleDays: scheduleDays.map((item) => ({
      habitId: item.habitId,
      weekday: item.weekday,
    })),
    entries: entries.map((item) => ({
      id: item.id,
      habitId: item.habitId,
      dateKey: item.dateKey,
      value: item.value,
      completedAt: item.completedAt?.toISOString() ?? null,
      note: item.note,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    reminders: reminders.map((item) => ({
      id: item.id,
      habitId: item.habitId,
      enabled: item.enabled,
      timeMinutes: item.timeMinutes,
      notificationId: item.notificationId,
    })),
  };
};

export const exportBackup = async () => {
  const backup = await createBackup();

  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  const fileUri = `${FileSystem.cacheDirectory}habit-backup-${Date.now()}.json`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is unavailable.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Export Habit Backup",
    UTI: "public.json",
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isValidBackup = (value: unknown): value is SettingsBackup => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    Array.isArray(value.habits) &&
    Array.isArray(value.scheduleDays) &&
    Array.isArray(value.entries) &&
    Array.isArray(value.reminders)
  );
};

export const importBackup = async () => {
  const result = await File.pickFileAsync({
    mimeTypes: "application/json",
    multipleFiles: false,
  });

  if (result.canceled || !result.result) {
    return false;
  }

  const selectedFile = result.result;
  const fileContent = await selectedFile.text();

  const parsedContent: unknown = JSON.parse(fileContent);

  if (!isValidBackup(parsedContent)) {
    throw new Error("Invalid backup file.");
  }

  await db.delete(habitEntry);
  await db.delete(habitReminder);
  await db.delete(habitScheduleDay);
  await db.delete(habit);

  if (parsedContent.habits.length > 0) {
    await db.insert(habit).values(
      parsedContent.habits.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        color: item.color,
        category: item.category,
        frequency: item.frequency,
        timesPerWeek: item.timesPerWeek,
        targetValue: item.targetValue,
        targetUnit: item.targetUnit,
        position: item.position,
        archivedAt: item.archivedAt ? new Date(item.archivedAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    );
  }

  if (parsedContent.scheduleDays.length > 0) {
    await db.insert(habitScheduleDay).values(
      parsedContent.scheduleDays.map((item) => ({
        habitId: item.habitId,
        weekday: item.weekday,
      })),
    );
  }

  if (parsedContent.entries.length > 0) {
    await db.insert(habitEntry).values(
      parsedContent.entries.map((item) => ({
        id: item.id,
        habitId: item.habitId,
        dateKey: item.dateKey,
        value: item.value,
        completedAt: item.completedAt ? new Date(item.completedAt) : null,
        note: item.note,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    );
  }

  if (parsedContent.reminders.length > 0) {
    await db.insert(habitReminder).values(
      parsedContent.reminders.map((item) => ({
        id: item.id,
        habitId: item.habitId,
        enabled: item.enabled,
        timeMinutes: item.timeMinutes,
        notificationId: item.notificationId,
      })),
    );
  }

  const importedSettings = parsedContent.appSettings;

  await db
    .insert(appSettings)
    .values({
      id: 1,
      theme: importedSettings?.theme ?? "SYSTEM",
      weekStartsOn: importedSettings?.weekStartsOn ?? 1,
      notificationsEnabled: importedSettings?.notificationsEnabled ?? true,
      quietHoursEnabled: importedSettings?.quietHoursEnabled ?? true,
      quietHoursStartMinutes: importedSettings?.quietHoursStartMinutes ?? 1320,
      quietHoursEndMinutes: importedSettings?.quietHoursEndMinutes ?? 420,
      soundEnabled: importedSettings?.soundEnabled ?? true,
      hapticsEnabled: importedSettings?.hapticsEnabled ?? true,
      customSoundUri: importedSettings?.customSoundUri ?? "bundled:chime",
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        theme: importedSettings?.theme ?? "SYSTEM",
        weekStartsOn: importedSettings?.weekStartsOn ?? 1,
        notificationsEnabled: importedSettings?.notificationsEnabled ?? true,
        quietHoursEnabled: importedSettings?.quietHoursEnabled ?? true,
        quietHoursStartMinutes:
          importedSettings?.quietHoursStartMinutes ?? 1320,
        quietHoursEndMinutes: importedSettings?.quietHoursEndMinutes ?? 420,
        soundEnabled: importedSettings?.soundEnabled ?? true,
        hapticsEnabled: importedSettings?.hapticsEnabled ?? true,
        customSoundUri: importedSettings?.customSoundUri ?? "bundled:chime",
      },
    });

  return true;
};

export const resetAllData = async () => {
  await db.delete(habitEntry);
  await db.delete(habitReminder);
  await db.delete(habitScheduleDay);
  await db.delete(habit);
  await db.delete(appSettings);

  await db.insert(appSettings).values(DEFAULT_SETTINGS);
};
