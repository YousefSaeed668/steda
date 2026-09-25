import { db } from "@/db/client";
import type { WeekStartsOn } from "@/components/ui/day-strip";
import { appSettings, habit, habitEntry } from "@/db/schema";
import { isHabitScheduledOn, toDateKey } from "@/lib/habit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  getDaysInMonth,
  isAfter,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { and, eq } from "drizzle-orm";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

export type HistoryDayStatus = "all-done" | "high" | "partial" | "missed" | "inactive";

export type HistoryCalendarDay = {
  date: Date;
  inVisibleMonth: boolean;
  completedCount: number;
  scheduledCount: number;
  completionRatio: number;
  status: HistoryDayStatus;
};

function getActiveHabitsForDate(
  habits: Awaited<ReturnType<typeof fetchHistoryData>>["habits"],
  date: Date,
) {
  const dateKey = toDateKey(date);
  return habits.filter(
    (item) =>
      toDateKey(item.createdAt) <= dateKey &&
      (item.archivedAt == null || toDateKey(item.archivedAt) >= dateKey),
  );
}

function summarizeDay(habits: Awaited<ReturnType<typeof fetchHistoryData>>["habits"], date: Date) {
  const dateKey = toDateKey(date);
  const scheduled = getActiveHabitsForDate(habits, date).filter((item) =>
    isHabitScheduledOn(item, date),
  );
  const completedCount = scheduled.filter((item) => {
    const entry = item.entries.find((candidate) => candidate.dateKey === dateKey);
    return (entry?.value ?? 0) > 0;
  }).length;
  const scheduledCount = scheduled.length;
  const completionRatio = scheduledCount ? completedCount / scheduledCount : 0;
  let status: HistoryDayStatus = "inactive";

  if (scheduledCount > 0) {
    if (completionRatio === 1) status = "all-done";
    else if (completionRatio >= 0.8) status = "high";
    else if (completionRatio > 0) status = "partial";
    else status = "missed";
  }

  return { completedCount, scheduledCount, completionRatio, status };
}

async function fetchHistoryData() {
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
}

export function useHistoryScreen() {
  const queryClient = useQueryClient();
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today));
  const [isEditing, setIsEditing] = useState(false);
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const selectedDateKey = toDateKey(selectedDate);

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistoryData,
  });

  const editDayMutation = useMutation({
    mutationFn: async ({
      habitId,
      completed,
    }: {
      habitId: string;
      completed: boolean;
    }) => {
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

      if (completed) {
        await db.insert(habitEntry).values({
          habitId,
          dateKey: selectedDateKey,
          value: 1,
          completedAt: new Date(),
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["today"] });
      await queryClient.invalidateQueries({ queryKey: ["habit"] });
      await queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () =>
      Alert.alert("Error", "Could not update this day log. Please try again."),
  });

  const habits = historyQuery.data?.habits ?? [];
  const weekStartsOn = (historyQuery.data?.settings?.weekStartsOn ??
    1) as WeekStartsOn;

  const calendarDays = useMemo<HistoryCalendarDay[]>(() => {
    const monthStart = startOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn });
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn });

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
      return {
        date,
        inVisibleMonth: isSameMonth(date, visibleMonth),
        ...summarizeDay(habits, date),
      };
    });
  }, [habits, visibleMonth, weekStartsOn]);

  const monthStats = useMemo(() => {
    const activeDays = calendarDays.filter(
      (day) =>
        day.inVisibleMonth &&
        day.completedCount > 0 &&
        !isAfter(day.date, today),
    );
    const averageCompletion = activeDays.length
      ? Math.round(
          (activeDays.reduce((total, day) => total + day.completionRatio, 0) /
            activeDays.length) *
            100,
        )
      : 0;

    return { averageCompletion, activeDayCount: activeDays.length };
  }, [calendarDays, today]);

  const selectedDay = useMemo(
    () => summarizeDay(habits, selectedDate),
    [habits, selectedDate],
  );
  const scheduledHabits = useMemo(
    () =>
      getActiveHabitsForDate(habits, selectedDate).filter((item) =>
        isHabitScheduledOn(item, selectedDate),
      ),
    [habits, selectedDate],
  );

  const earliestHabitYear = habits.length
    ? Math.min(...habits.map((item) => item.createdAt.getFullYear()))
    : today.getFullYear();
  const firstYear = Math.min(earliestHabitYear, today.getFullYear());
  const yearOptions = Array.from(
    { length: today.getFullYear() - firstYear + 1 },
    (_, index) => today.getFullYear() - index,
  );

  function selectDate(date: Date) {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    setVisibleMonth(startOfMonth(normalizedDate));
  }

  function changeMonth(offset: number) {
    const nextMonth = startOfMonth(addMonths(visibleMonth, offset));
    const selectedDayOfMonth = Math.min(
      selectedDate.getDate(),
      getDaysInMonth(nextMonth),
    );
    setVisibleMonth(nextMonth);
    setSelectedDate(
      startOfDay(
        new Date(
          nextMonth.getFullYear(),
          nextMonth.getMonth(),
          selectedDayOfMonth,
        ),
      ),
    );
  }

  function selectYear(year: number) {
    const nextMonth = new Date(year, visibleMonth.getMonth(), 1);
    const selectedDayOfMonth = Math.min(
      selectedDate.getDate(),
      getDaysInMonth(nextMonth),
    );
    setVisibleMonth(nextMonth);
    setSelectedDate(
      startOfDay(
        new Date(year, nextMonth.getMonth(), selectedDayOfMonth),
      ),
    );
    setIsYearPickerVisible(false);
  }

  function toggleHabit(habitId: string, completed: boolean) {
    editDayMutation.mutate({ habitId, completed });
  }

  return {
    today,
    selectedDate,
    visibleMonth,
    weekStartsOn,
    calendarDays,
    monthStats,
    selectedDay,
    scheduledHabits,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    isEditing,
    setIsEditing,
    isYearPickerVisible,
    setIsYearPickerVisible,
    yearOptions,
    selectDate,
    changeMonth,
    selectYear,
    toggleHabit,
    isUpdating: editDayMutation.isPending,
  };
}
