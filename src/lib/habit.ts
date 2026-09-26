import { HabitFrequency } from "@/db/schema";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import { sortWeekdaysByWeekStart, type WeekStartsOn } from "@/lib/week";

type ScheduleDay = { weekday: number };
type Entry = { dateKey: string; value: number; note?: string | null };

export type HabitLike = {
  archivedAt?: Date | null;
  createdAt?: Date;
  frequency: HabitFrequency;
  timesPerWeek: number | null;
  scheduleDays: ScheduleDay[];
  entries: Entry[];
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildEntryMap(entries: Entry[]) {
  const map = new Map<string, number>();
  for (const entry of entries) {
    map.set(entry.dateKey, entry.value);
  }
  return map;
}

export function isHabitScheduledOn(habit: HabitLike, date: Date) {
  if (habit.frequency === "SPECIFIC_DAYS") {
    return habit.scheduleDays.some((day) => day.weekday === date.getDay());
  }
  return true;
}

export function isHabitActiveOnDate(habit: HabitLike, date: Date) {
  const dateKey = toDateKey(date);

  return (
    (!habit.createdAt || toDateKey(habit.createdAt) <= dateKey) &&
    (!habit.archivedAt || toDateKey(habit.archivedAt) >= dateKey)
  );
}

function getEffectiveWeeklyTarget(
  habit: HabitLike,
  start: Date,
  end: Date,
) {
  const target = habit.timesPerWeek ?? 0;
  if (target <= 0) return 0;

  let activeDays = 0;
  let cursor = start;
  while (!isBefore(end, cursor)) {
    if (isHabitActiveOnDate(habit, cursor)) activeDays += 1;
    cursor = addDays(cursor, 1);
  }

  return Math.min(target, activeDays);
}

function getCompletedCountInRange(habit: HabitLike, start: Date, end: Date) {
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);

  return habit.entries.filter(
    (entry) =>
      entry.value > 0 &&
      entry.dateKey >= startKey &&
      entry.dateKey <= endKey,
  ).length;
}

export function getCompletionRatioForDate(habits: HabitLike[], date: Date) {
  const scheduledHabits = habits.filter((habit) =>
    isHabitActiveOnDate(habit, date) && isHabitScheduledOn(habit, date),
  );

  if (scheduledHabits.length === 0) return 0;

  const dateKey = toDateKey(date);
  const completedCount = scheduledHabits.filter((habit) => {
    const entry = habit.entries.find((item) => item.dateKey === dateKey);
    return (entry?.value ?? 0) > 0;
  }).length;

  return completedCount / scheduledHabits.length;
}

export function getFrequencyLabel(
  habit: HabitLike,
  weekStartsOn: WeekStartsOn = 1,
) {
  if (habit.frequency === "TIMES_PER_WEEK") {
    return `${habit.timesPerWeek ?? 0}x per week`;
  }
  if (habit.frequency === "SPECIFIC_DAYS") {
    if (habit.scheduleDays.length === 7) return "Every day";
    if (habit.scheduleDays.length === 0) return "No days set";
    return sortWeekdaysByWeekStart(
      habit.scheduleDays.map((day) => day.weekday),
      weekStartsOn,
    )
      .map((weekday) => WEEKDAY_LABELS[weekday])
      .join(", ");
  }
  return "Every day";
}

export function getDetailLabel(
  habit: { targetValue: number | null; targetUnit: string | null },
  reminder: { enabled: boolean; timeMinutes: number } | undefined,
) {
  const parts: string[] = [];
  if (habit.targetValue && habit.targetUnit) {
    parts.push(
      `Target: ${habit.targetValue.toLocaleString()} ${habit.targetUnit}`,
    );
  }
  if (reminder?.enabled) {
    parts.push(
      `Reminder: ${format(
        addMinutes(startOfDay(new Date()), reminder.timeMinutes),
        "h:mm a",
      )}`,
    );
  }
  return parts.join(" • ");
}

export function getWeeklyRequiredCount(
  habit: HabitLike,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  today: Date,
) {
  const weekStart = startOfWeek(today, { weekStartsOn });

  if (habit.frequency === "TIMES_PER_WEEK") {
    return getEffectiveWeeklyTarget(habit, weekStart, today);
  }
  let required = 0;
  let cursor = weekStart;
  while (!isBefore(today, cursor)) {
    if (isHabitActiveOnDate(habit, cursor) && isHabitScheduledOn(habit, cursor)) {
      required += 1;
    }
    cursor = addDays(cursor, 1);
  }
  return required;
}

export function getWeeklyCompletedCount(
  habit: HabitLike,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  today: Date,
) {
  const weekStart = startOfWeek(today, { weekStartsOn });
  if (habit.frequency === "TIMES_PER_WEEK") {
    const target = getEffectiveWeeklyTarget(habit, weekStart, today);
    return Math.min(getCompletedCountInRange(habit, weekStart, today), target);
  }

  const map = buildEntryMap(habit.entries);
  let completed = 0;
  let cursor = weekStart;
  while (!isBefore(today, cursor)) {
    if (
      isHabitActiveOnDate(habit, cursor) &&
      isHabitScheduledOn(habit, cursor) &&
      (map.get(toDateKey(cursor)) ?? 0) > 0
    ) {
      completed += 1;
    }
    cursor = addDays(cursor, 1);
  }
  return completed;
}

export function getMonthlyCompletionRate(
  habit: HabitLike,
  today: Date,
  weekStartsOn: WeekStartsOn = 1,
) {
  const monthStart = startOfMonth(today);

  if (habit.frequency === "TIMES_PER_WEEK") {
    let weekStart = startOfWeek(monthStart, { weekStartsOn });
    let required = 0;
    let completed = 0;

    while (!isBefore(today, weekStart)) {
      const rangeStart = isBefore(weekStart, monthStart)
        ? monthStart
        : weekStart;
      const rangeEnd = isBefore(today, addDays(weekStart, 6))
        ? today
        : addDays(weekStart, 6);
      const target = getEffectiveWeeklyTarget(habit, rangeStart, rangeEnd);

      required += target;
      completed += Math.min(
        getCompletedCountInRange(habit, rangeStart, rangeEnd),
        target,
      );
      weekStart = addDays(weekStart, 7);
    }

    if (required === 0) return 0;
    return Math.min(100, Math.round((completed / required) * 100));
  }

  const map = buildEntryMap(habit.entries);
  let required = 0;
  let completed = 0;
  let cursor = monthStart;
  while (!isBefore(today, cursor)) {
    if (isHabitActiveOnDate(habit, cursor) && isHabitScheduledOn(habit, cursor)) {
      required += 1;
      if ((map.get(toDateKey(cursor)) ?? 0) > 0) completed += 1;
    }
    cursor = addDays(cursor, 1);
  }
  if (required === 0) return 0;
  return Math.round((completed / required) * 100);
}

export function getCurrentStreak(
  habit: HabitLike,
  today: Date,
  weekStartsOn: WeekStartsOn = 1,
) {
  if (habit.frequency === "TIMES_PER_WEEK") {
    let streak = 0;
    let weekStart = startOfWeek(today, { weekStartsOn });
    let isCurrentWeek = true;

    while (streak <= 520) {
      const rangeEnd = isCurrentWeek ? today : addDays(weekStart, 6);
      const target = getEffectiveWeeklyTarget(habit, weekStart, rangeEnd);
      const completed = Math.min(
        getCompletedCountInRange(habit, weekStart, rangeEnd),
        target,
      );

      if (target === 0) {
        if (isCurrentWeek) {
          isCurrentWeek = false;
          weekStart = subWeeks(weekStart, 1);
          continue;
        }
        break;
      }

      if (completed < target) {
        if (isCurrentWeek) {
          isCurrentWeek = false;
          weekStart = subWeeks(weekStart, 1);
          continue;
        }
        break;
      }

      streak += 1;
      isCurrentWeek = false;
      weekStart = subWeeks(weekStart, 1);
    }

    return streak;
  }

  const map = buildEntryMap(habit.entries);
  let streak = 0;
  let cursor = today;
  let daysWalked = 0;

  while (daysWalked < 3650) {
    if (
      habit.createdAt &&
      toDateKey(cursor) < toDateKey(habit.createdAt)
    ) {
      break;
    }

    if (isHabitActiveOnDate(habit, cursor) && isHabitScheduledOn(habit, cursor)) {
      const done = (map.get(toDateKey(cursor)) ?? 0) > 0;
      if (!done) {
        if (toDateKey(cursor) === toDateKey(today)) {
          cursor = subDays(cursor, 1);
          daysWalked += 1;
          continue;
        }
        break;
      }
      streak += 1;
    }
    cursor = subDays(cursor, 1);
    daysWalked += 1;
  }

  return streak;
}

export function getStreakDots(
  habit: HabitLike,
  today: Date,
  weekStartsOn: WeekStartsOn = 1,
) {
  const map = buildEntryMap(habit.entries);

  if (habit.frequency === "SPECIFIC_DAYS") {
    const weekdays = habit.scheduleDays.map((day) => day.weekday);
    if (weekdays.length === 0) return [];
    const dots: boolean[] = [];
    let cursor = today;
    let daysWalked = 0;
    while (dots.length < weekdays.length && daysWalked < 365) {
      if (
        weekdays.includes(cursor.getDay()) &&
        isHabitActiveOnDate(habit, cursor)
      ) {
        dots.unshift((map.get(toDateKey(cursor)) ?? 0) > 0);
      }
      cursor = subDays(cursor, 1);
      daysWalked += 1;
    }
    return dots;
  }

  if (habit.frequency === "TIMES_PER_WEEK") {
    const weekStart = startOfWeek(today, { weekStartsOn });
    const target = getEffectiveWeeklyTarget(habit, weekStart, today);
    const completed = getCompletedCountInRange(habit, weekStart, today);
    return Array.from({ length: target }, (_, index) => index < completed);
  }

  const dots: boolean[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = subDays(today, i);
    dots.push(
      isHabitActiveOnDate(habit, date) &&
        (map.get(toDateKey(date)) ?? 0) > 0,
    );
  }
  return dots;
}

import {
  Book,
  Church,
  Droplets,
  Dumbbell,
  Languages,
  SportShoe,
  Target,
} from "lucide-react-native";
import { ComponentType } from "react";

type IconComponent = ComponentType<{ color?: string; size?: number }>;

const habitIconMap: Record<string, IconComponent> = {
  book: Book,
  water: Droplets,
  exercise: SportShoe,
  language: Languages,
  workout: Dumbbell,
  pray: Church,
};

export function getHabitIcon(icon: string | null): IconComponent {
  if (!icon) return Target;
  return habitIconMap[icon] ?? Target;
}
