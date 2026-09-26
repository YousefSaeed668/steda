import type { WeekStartsOn } from "@/components/ui/day-strip";
import { db } from "@/db/client";
import { appSettings, habit } from "@/db/schema";
import {
  getCurrentStreak,
  isHabitScheduledOn,
  toDateKey,
} from "@/lib/habit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { eq } from "drizzle-orm";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

export type ProgressPeriod = "week" | "month";

export type ProgressDay = {
  date: Date;
  completedCount: number;
  scheduledCount: number;
  completionRatio: number;
};

async function fetchProgressData() {
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

type ProgressHabit = Awaited<ReturnType<typeof fetchProgressData>>["habits"][number];

function isHabitActiveOnDate(habitItem: ProgressHabit, date: Date) {
  const dateKey = toDateKey(date);
  return (
    toDateKey(habitItem.createdAt) <= dateKey &&
    (habitItem.archivedAt == null || toDateKey(habitItem.archivedAt) >= dateKey)
  );
}

function summarizeDay(habits: ProgressHabit[], date: Date): ProgressDay {
  // Flexible weekly goals have no assigned weekday, so keep them out of daily bars.
  const dailyHabits = habits.filter(
    (item) =>
      item.frequency !== "TIMES_PER_WEEK" &&
      isHabitActiveOnDate(item, date) &&
      isHabitScheduledOn(item, date),
  );
  const dateKey = toDateKey(date);
  const completedCount = dailyHabits.filter((item) => {
    const entry = item.entries.find((candidate) => candidate.dateKey === dateKey);
    return (entry?.value ?? 0) > 0;
  }).length;
  const scheduledCount = dailyHabits.length;

  return {
    date,
    completedCount,
    scheduledCount,
    completionRatio: scheduledCount ? completedCount / scheduledCount : 0,
  };
}

function getPeriodDays(start: Date, end: Date, today: Date) {
  if (isAfter(start, today)) return [];
  const finalDay = isAfter(end, today) ? today : end;
  return eachDayOfInterval({ start, end: finalDay });
}

function summarizePeriod(
  habits: ProgressHabit[],
  start: Date,
  end: Date,
  today: Date,
  weekStartsOn: WeekStartsOn,
) {
  const dates = getPeriodDays(start, end, today);
  let completedCount = 0;
  let scheduledCount = 0;
  const weekDates = new Map<string, Date[]>();

  for (const date of dates) {
    const weekStart = startOfWeek(date, { weekStartsOn });
    const key = toDateKey(weekStart);
    weekDates.set(key, [...(weekDates.get(key) ?? []), date]);
  }

  for (const item of habits) {
    if (item.frequency === "TIMES_PER_WEEK") {
      const weeklyTarget = item.timesPerWeek ?? 0;
      if (weeklyTarget <= 0) continue;

      for (const datesInWeek of weekDates.values()) {
        const activeDates = datesInWeek.filter((date) =>
          isHabitActiveOnDate(item, date),
        );
        if (!activeDates.length) continue;

        const effectiveTarget = Math.min(weeklyTarget, activeDates.length);
        scheduledCount += effectiveTarget;
        const activeDateKeys = new Set(activeDates.map(toDateKey));
        const actualCompletions = item.entries.filter(
          (entry) =>
            activeDateKeys.has(entry.dateKey) && entry.value > 0,
        ).length;
        completedCount += Math.min(actualCompletions, effectiveTarget);
      }
      continue;
    }

    for (const date of dates) {
      if (!isHabitActiveOnDate(item, date) || !isHabitScheduledOn(item, date)) {
        continue;
      }

      scheduledCount += 1;
      const entry = item.entries.find(
        (candidate) => candidate.dateKey === toDateKey(date),
      );
      if ((entry?.value ?? 0) > 0) completedCount += 1;
    }
  }

  return {
    completedCount,
    scheduledCount,
    remainingCount: Math.max(scheduledCount - completedCount, 0),
    completionRatio: scheduledCount ? completedCount / scheduledCount : 0,
  };
}

function summarizeHabitForPeriod(
  item: ProgressHabit,
  start: Date,
  end: Date,
  today: Date,
  weekStartsOn: WeekStartsOn,
) {
  const result = summarizePeriod([item], start, end, today, weekStartsOn);
  return {
    habit: item,
    completedCount: result.completedCount,
    scheduledCount: result.scheduledCount,
    completionRatio: result.completionRatio,
  };
}

export type RankedProgressHabit = ReturnType<typeof summarizeHabitForPeriod>;

export function useProgressScreen() {
  const queryClient = useQueryClient();
  const hasFocusedOnce = useRef(false);
  const today = startOfDay(new Date());
  const [period, setPeriod] = useState<ProgressPeriod>("week");
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) {
        void queryClient.invalidateQueries({ queryKey: ["progress"] });
      } else {
        hasFocusedOnce.current = true;
      }
    }, [queryClient]),
  );
  const progressQuery = useQuery({
    queryKey: ["progress"],
    queryFn: fetchProgressData,
  });

  const habits = progressQuery.data?.habits ?? [];
  const weekStartsOn = (progressQuery.data?.settings?.weekStartsOn ??
    1) as WeekStartsOn;
  const periodStart =
    period === "week"
      ? startOfWeek(today, { weekStartsOn })
      : startOfMonth(today);
  const periodEnd =
    period === "week"
      ? endOfWeek(today, { weekStartsOn })
      : endOfMonth(today);

  const periodStats = useMemo(
    () => summarizePeriod(habits, periodStart, periodEnd, today, weekStartsOn),
    [habits, periodStart.getTime(), periodEnd.getTime(), today.getTime(), weekStartsOn],
  );

  const dailyBreakdown = useMemo(() => {
    if (period !== "week") return [];
    return eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn }),
      end: endOfWeek(today, { weekStartsOn }),
    }).map((date) => summarizeDay(habits, date));
  }, [habits, period, today.getTime(), weekStartsOn]);

  const monthlyActivity = useMemo(() => {
    if (period !== "month") return [];
    return eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(today),
    }).map((date) => summarizeDay(habits, date));
  }, [habits, period, today.getTime()]);

  const todayStats = useMemo(
    () => summarizeDay(habits, today),
    [habits, today.getTime()],
  );

  const previousPeriod = useMemo(() => {
    if (period === "week") {
      const start = subWeeks(periodStart, 1);
      return summarizePeriod(
        habits,
        start,
        endOfWeek(start, { weekStartsOn }),
        today,
        weekStartsOn,
      );
    }

    const start = startOfMonth(subMonths(periodStart, 1));
    return summarizePeriod(
      habits,
      start,
      endOfMonth(start),
      today,
      weekStartsOn,
    );
  }, [habits, period, periodStart.getTime(), today.getTime(), weekStartsOn]);

  const streak = useMemo(
    () =>
      Math.max(
        0,
        ...habits
          .filter((item) => isHabitActiveOnDate(item, today))
          .map((item) => getCurrentStreak(item, today, weekStartsOn)),
      ),
    [habits, today.getTime()],
  );

  const rankedHabits = useMemo(
    () =>
      habits
        .map((item) =>
          summarizeHabitForPeriod(
            item,
            periodStart,
            periodEnd,
            today,
            weekStartsOn,
          ),
        )
        .filter((item) => item.scheduledCount > 0)
        .sort((a, b) => b.completionRatio - a.completionRatio),
    [habits, periodStart.getTime(), periodEnd.getTime(), today.getTime(), weekStartsOn],
  );

  const trendPercentage = Math.round(
    (periodStats.completionRatio - previousPeriod.completionRatio) * 100,
  );

  return {
    period,
    setPeriod,
    today,
    periodStart,
    periodEnd,
    weekStartsOn,
    periodStats,
    completionPercent: Math.round(periodStats.completionRatio * 100),
    trendPercentage,
    streak,
    dailyBreakdown,
    monthlyActivity,
    todayStats,
    rankedHabits,
    isLoading: progressQuery.isLoading,
    isError: progressQuery.isError,
  };
}
