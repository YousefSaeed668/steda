import { db } from "@/db/client";
import { appSettings, habit, habitEntry } from "@/db/schema";
import {
  getCurrentStreak,
  isHabitActiveOnDate,
  isHabitScheduledOn,
  toDateKey,
} from "@/lib/habit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type ToggleHabitInput = {
  habitId: string;
  completed: boolean;
};

export function useTodayScreen() {
  const queryClient = useQueryClient();
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedDateKey = toDateKey(selectedDate);

  const todayQuery = useQuery({

    queryKey: ["today"],
    queryFn: async () => {
      const [habits, settings] = await Promise.all([
        db.query.habit.findMany({
          with: { scheduleDays: true, entries: true, reminders: true },
          orderBy: (fields, { asc }) => [
            asc(fields.position),
            asc(fields.createdAt),
          ],
        }),
        db.query.appSettings.findFirst({ where: eq(appSettings.id, 1) }),
      ]);

      return { habits, settings };
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ habitId, completed }: ToggleHabitInput) => {
      const existingEntry = await db.query.habitEntry.findFirst({
        where: and(
          eq(habitEntry.habitId, habitId),
          eq(habitEntry.dateKey, selectedDateKey),
        ),
      });

      if (existingEntry) {
        await db
          .update(habitEntry)
          .set({
            value: completed ? 1 : 0,
            completedAt: completed ? new Date() : null,
          })
          .where(eq(habitEntry.id, existingEntry.id));
        return;
      }

      await db.insert(habitEntry).values({
        habitId,
        dateKey: selectedDateKey,
        value: 1,
        completedAt: new Date(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["today"] });
      await queryClient.invalidateQueries({ queryKey: ["habit"] });
      await queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () =>
      Alert.alert("Error", "Could not update this habit. Please try again."),
  });

  const habits = todayQuery.data?.habits ?? [];
  const weekStartsOn = (todayQuery.data?.settings?.weekStartsOn ??
    1) as WeekStartsOn;
  const scheduledHabits = useMemo(
    () =>
      habits.filter(
        (item) =>
          isHabitActiveOnDate(item, selectedDate) &&
          (selectedDateKey !== toDateKey(today) || item.archivedAt == null) &&
          isHabitScheduledOn(item, selectedDate),
      ),
    [habits, selectedDate, selectedDateKey, today],
  );

  const completedCount = scheduledHabits.filter((item) => {
    const entry = item.entries.find(
      (candidate) => candidate.dateKey === selectedDateKey,
    );
    return (entry?.value ?? 0) > 0;
  }).length;

  const completionPercent = scheduledHabits.length
    ? Math.round((completedCount / scheduledHabits.length) * 100)
    : 0;

  const totalStreak = scheduledHabits.reduce(
    (maximum, item) =>
      Math.max(maximum, getCurrentStreak(item, selectedDate, weekStartsOn)),
    0,
  );

  function onToggleHabit(habitId: string, completed: boolean) {
    completeMutation.mutate({ habitId, completed });
  }

  return {
    today,
    selectedDate,
    setSelectedDate,
    weekStartsOn,
    habits,
    scheduledHabits,
    completedCount,
    completionPercent,
    totalStreak,
    isLoading: todayQuery.isLoading,
    isError: todayQuery.isError,
    isUpdating: completeMutation.isPending,
    onToggleHabit,
  };
}
