import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { habit, habitEntry } from "@/db/schema";
import { toDateKey } from "@/lib/habit";
import { getAppSettings } from "@/lib/settings";

const REMINDER_NOTIFICATION_TYPE = "habit-reminder";
export const HABIT_REMINDER_CATEGORY = "habit_reminder";
export const MARK_HABIT_DONE_ACTION = "mark_habit_done";

type NotificationSyncStatus =
  | "disabled"
  | "permission-denied"
  | "scheduled"
  | "unsupported";

export type NotificationSyncResult = {
  scheduledCount: number;
  status: NotificationSyncStatus;
};

type ReminderSettings = {
  customSoundUri: string | null;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursEndMinutes: number;
  quietHoursStartMinutes: number;
  soundEnabled: boolean;
};

const bundledNotificationSounds = {
  bell: "bell.mp3",
  chime: "chime.mp3",
  "soft-notification": "soft_notification.mp3",
} as const;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function getBundledNotificationSound(customSoundUri: string | null) {
  const soundUri = customSoundUri ?? "bundled:chime";
  if (!soundUri.startsWith("bundled:")) return null;

  const soundId = soundUri.slice("bundled:".length);
  return bundledNotificationSounds[
    soundId as keyof typeof bundledNotificationSounds
  ] ?? null;
}

function getChannelId(settings: ReminderSettings) {
  if (!settings.soundEnabled) return "steda-reminders-silent";

  const sound = getBundledNotificationSound(settings.customSoundUri);
  return sound
    ? `steda-reminders-${sound.replace(".mp3", "")}`
    : "steda-reminders-default";
}

function isDuringQuietHours(timeMinutes: number, settings: ReminderSettings) {
  if (!settings.quietHoursEnabled) return false;

  const { quietHoursStartMinutes: start, quietHoursEndMinutes: end } = settings;
  if (start === end) return false;

  return start < end
    ? timeMinutes >= start && timeMinutes < end
    : timeMinutes >= start || timeMinutes < end;
}

async function configureNotificationInfrastructure(settings: ReminderSettings) {
  if (Platform.OS === "web") return;

  const selectedSound = settings.soundEnabled
    ? getBundledNotificationSound(settings.customSoundUri) ?? "default"
    : null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(getChannelId(settings), {
      importance: Notifications.AndroidImportance.HIGH,
      name: "Habit reminders",
      sound: selectedSound,
      ...(settings.hapticsEnabled
        ? { vibrationPattern: [0, 180, 120, 180] }
        : {}),
    });
  }

  await Notifications.setNotificationCategoryAsync(HABIT_REMINDER_CATEGORY, [
    {
      identifier: MARK_HABIT_DONE_ACTION,
      buttonTitle: "Mark done",
      options: { opensAppToForeground: true },
    },
  ]);
}

function hasNotificationPermission(
  status: Notifications.NotificationPermissionsStatus,
) {
  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function getNotificationPermission(requestPermission: boolean) {
  const current = await Notifications.getPermissionsAsync();
  if (hasNotificationPermission(current)) return true;
  if (!requestPermission || !current.canAskAgain) return false;

  return hasNotificationPermission(await Notifications.requestPermissionsAsync());
}

async function cancelManagedNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminderIds = scheduled
    .filter(
      (notification) =>
        notification.content.data?.type === REMINDER_NOTIFICATION_TYPE,
    )
    .map((notification) => notification.identifier);

  await Promise.all(
    reminderIds.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );
}

async function syncScheduledHabitNotificationsInternal(
  requestPermission: boolean,
): Promise<NotificationSyncResult> {
  if (Platform.OS === "web") {
    return { scheduledCount: 0, status: "unsupported" };
  }

  await cancelManagedNotifications();

  const settings = await getAppSettings();

  if (!settings.notificationsEnabled) {
    return { scheduledCount: 0, status: "disabled" };
  }

  await configureNotificationInfrastructure(settings);

  if (!(await getNotificationPermission(requestPermission))) {
    return { scheduledCount: 0, status: "permission-denied" };
  }

  const habits = await db.query.habit.findMany({
    where: isNull(habit.archivedAt),
    with: { reminders: true, scheduleDays: true },
  });

  let scheduledCount = 0;
  const channelId = getChannelId(settings);
  const sound = settings.soundEnabled
    ? getBundledNotificationSound(settings.customSoundUri) ?? "default"
    : false;

  for (const habitItem of habits) {
    for (const reminder of habitItem.reminders.filter((item) => item.enabled)) {
      if (isDuringQuietHours(reminder.timeMinutes, settings)) continue;

      const hour = Math.floor(reminder.timeMinutes / 60);
      const minute = reminder.timeMinutes % 60;
      const content: Notifications.NotificationContentInput = {
        body: `Take a moment to complete ${habitItem.name}.`,
        categoryIdentifier: HABIT_REMINDER_CATEGORY,
        color: habitItem.color ?? "#4F46E5",
        data: {
          habitId: habitItem.id,
          type: REMINDER_NOTIFICATION_TYPE,
          url: `/habit/${habitItem.id}`,
        },
        priority: "high",
        sound,
        subtitle: "Habit reminder",
        title: habitItem.name,
      };

      if (habitItem.frequency === "SPECIFIC_DAYS") {
        for (const scheduleDay of habitItem.scheduleDays) {
          await Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              channelId,
              hour,
              minute,
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: scheduleDay.weekday + 1,
            },
          });
          scheduledCount += 1;
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            channelId,
            hour,
            minute,
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
          },
        });
        scheduledCount += 1;
      }
    }
  }

  return { scheduledCount, status: "scheduled" };
}

let notificationSyncQueue = Promise.resolve<NotificationSyncResult>({
  scheduledCount: 0,
  status: "disabled",
});

export function syncScheduledHabitNotifications(options?: {
  requestPermission?: boolean;
}) {
  const run = notificationSyncQueue.then(() =>
    syncScheduledHabitNotificationsInternal(options?.requestPermission ?? false),
  );

  notificationSyncQueue = run.catch(() => ({
    scheduledCount: 0,
    status: "disabled" as const,
  }));

  return run;
}

export async function completeHabitFromNotification(habitId: string) {
  const dateKey = toDateKey(new Date());
  const existingEntry = await db.query.habitEntry.findFirst({
    where: and(eq(habitEntry.habitId, habitId), eq(habitEntry.dateKey, dateKey)),
  });

  if (existingEntry) {
    await db
      .update(habitEntry)
      .set({ completedAt: new Date(), value: 1 })
      .where(eq(habitEntry.id, existingEntry.id));
    return;
  }

  await db.insert(habitEntry).values({
    completedAt: new Date(),
    dateKey,
    habitId,
    value: 1,
  });
}

export async function handleHabitReminderResponse(
  response: Notifications.NotificationResponse,
) {
  if (response.actionIdentifier !== MARK_HABIT_DONE_ACTION) return false;

  const habitId = response.notification.request.content.data?.habitId;
  if (typeof habitId !== "string") return false;

  await completeHabitFromNotification(habitId);
  await Notifications.dismissNotificationAsync(
    response.notification.request.identifier,
  );
  return true;
}
