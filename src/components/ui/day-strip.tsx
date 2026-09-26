import { useAppThemeColor } from "@/theme/app-theme";
import type { WeekStartsOn } from "@/lib/week";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { Pressable, Text, View } from "react-native";

import {
  getCompletionRatioForDate,
  toDateKey,
  type HabitLike,
} from "@/lib/habit";

export type { WeekStartsOn } from "@/lib/week";

export type DayStripDayProps = {
  date: Date;
  selected: boolean;
  today: Date;
  habits: HabitLike[];
  onPress: (date: Date) => void;
};

export function DayStripDay({
  date,
  selected,
  today,
  habits,
  onPress,
}: DayStripDayProps) {
  const success = useAppThemeColor("success");
  const isToday = isSameDay(date, today);
  const isPreviousDay = date < today && !isToday;
  const completionRatio = getCompletionRatioForDate(habits, date);
  const dotOpacity = Math.max(completionRatio, 0.15);

  return (
    <Pressable
      onPress={() => onPress(date)}
      accessibilityRole="button"
      accessibilityLabel={`Select ${format(date, "EEEE, MMMM d")}`}
      className={`min-h-[64px] flex-1 items-center justify-center rounded-xl ${selected ? "bg-primary" : ""}`}
    >
      <Text
        className={`mb-0.5 font-medium ${
          selected ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        {format(date, "EEEEE")}
      </Text>
      <Text
        className={`mt-1 text-base font-semibold ${
          selected ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {format(date, "d")}
      </Text>
      {(isPreviousDay || isToday) && (
        <View
          className="mt-1 size-2 rounded-full"
          style={{
            backgroundColor: selected ? "white" : success,
            opacity: selected ? 1 : dotOpacity,
          }}
        />
      )}
    </Pressable>
  );
}

export type DayStripProps = {
  selectedDate: Date;
  today: Date;
  weekStartsOn: WeekStartsOn;
  habits: HabitLike[];
  onDateChange: (date: Date) => void;
};

export function DayStrip({
  selectedDate,
  today,
  weekStartsOn,
  habits,
  onDateChange,
}: DayStripProps) {
  const firstDay = startOfWeek(selectedDate, { weekStartsOn });
  const dates = Array.from({ length: 7 }, (_, index) =>
    addDays(firstDay, index),
  );

  return (
    <View className="flex-row rounded-2xl bg-card p-2">
      {dates.map((date) => (
        <DayStripDay
          key={toDateKey(date)}
          date={date}
          selected={isSameDay(date, selectedDate)}
          today={today}
          habits={habits}
          onPress={onDateChange}
        />
      ))}
    </View>
  );
}
