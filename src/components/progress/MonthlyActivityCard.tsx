import { Card } from "@/components/ui/card";
import type { WeekStartsOn } from "@/components/ui/day-strip";
import { useAppThemeColor } from "@/theme/app-theme";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Text, View } from "react-native";

import type { ProgressDay } from "@/hooks/useProgressScreen";

type MonthlyActivityCardProps = {
  month: Date;
  today: Date;
  weekStartsOn: WeekStartsOn;
  days: ProgressDay[];
  todayStats: ProgressDay;
};

export function MonthlyActivityCard({
  month,
  today,
  weekStartsOn,
  days,
  todayStats,
}: MonthlyActivityCardProps) {
  const primary = useAppThemeColor("primary");
  const primaryForeground = useAppThemeColor("primaryForeground");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const firstDayOfMonth = startOfMonth(month);
  const leadingDays = differenceInCalendarDays(
    firstDayOfMonth,
    startOfWeek(firstDayOfMonth, { weekStartsOn }),
  );
  const numberOfDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(month),
  }).length;

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-foreground">
            Monthly Activity
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Daily check-in completion rate
          </Text>
        </View>
        <View className="rounded-md bg-muted px-2 py-1">
          <Text className="text-[11px] text-muted-foreground">
            {numberOfDays} Days
          </Text>
        </View>
      </View>

      <View className="mb-1 mt-4 flex-row">
        {Array.from({ length: 7 }, (_, index) =>
          format(
            addDays(startOfWeek(new Date(2024, 0, 7), { weekStartsOn }), index),
            "EEEEE",
          ),
        ).map((weekday, index) => (
          <View
            key={`${weekday}-${index}`}
            className="w-[14.285%] items-center py-1"
          >
            <Text className="text-[11px] font-medium text-muted-foreground">
              {weekday}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: leadingDays }, (_, index) => (
          <View key={`empty-${index}`} className="h-8 w-[14.285%] p-0.5" />
        ))}
        {days.map((day) => {
          const isToday = isSameDay(day.date, today);
          const isFuture = isAfter(day.date, today);
          const percent = Math.round(day.completionRatio * 100);
          const opacity =
            day.scheduledCount === 0
              ? 0.12
              : Math.max(day.completionRatio, 0.12);

          return (
            <View
              key={format(day.date, "yyyy-MM-dd")}
              className="h-10 w-[14.285%] p-0.5"
            >
              <View
                className={`h-full items-center justify-center overflow-hidden rounded-md ${isToday ? "border border-primary" : ""}`}
              >
                <View
                  className={`absolute inset-0 rounded-md ${isToday ? "bg-primary" : "bg-success"}`}
                  style={{ opacity: isFuture ? 0.08 : opacity }}
                />
                <Text
                  className="text-[10px] font-medium"
                  style={{
                    color:
                      !isFuture && percent >= 55
                        ? primaryForeground
                        : mutedForeground,
                  }}
                >
                  {format(day.date, "d")}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-xs text-muted-foreground">
          Daily target: {todayStats.scheduledCount} check-ins
        </Text>
        <Text className="text-xs font-semibold" style={{ color: primary }}>
          Today: {todayStats.completedCount}/{todayStats.scheduledCount}{" "}
          check-ins
        </Text>
      </View>
    </Card>
  );
}
