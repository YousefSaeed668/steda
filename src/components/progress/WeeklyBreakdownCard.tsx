import { Card } from "@/components/ui/card";
import { useAppThemeColor } from "@/theme/app-theme";
import { format, isAfter, isSameDay } from "date-fns";
import { Text, View } from "react-native";

import type { ProgressDay } from "@/hooks/useProgressScreen";

type WeeklyBreakdownCardProps = {
  days: ProgressDay[];
  today: Date;
  todayStats: ProgressDay;
};

export function WeeklyBreakdownCard({
  days,
  today,
  todayStats,
}: WeeklyBreakdownCardProps) {
  const primary = useAppThemeColor("primary");
  const success = useAppThemeColor("success");
  const weekRangeLabel = days.length
    ? `${format(days[0].date, "EEE")} – ${format(days[days.length - 1].date, "EEE")}`
    : "Week";

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-foreground">
            Weekly Breakdown
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Daily check-in completion rate
          </Text>
        </View>
        <View className="rounded-md bg-muted px-2 py-1">
          <Text className="text-[11px] text-muted-foreground">
            {weekRangeLabel}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-end justify-between gap-1">
        {days.map((day) => {
          const isToday = isSameDay(day.date, today);
          const isFuture = isAfter(day.date, today);
          const percent = Math.round(day.completionRatio * 100);
          const barColor = isToday ? primary : success;
          const opacity = isFuture
            ? 0
            : day.scheduledCount === 0
            ? 0.15
            : Math.max(day.completionRatio, 0.15);
          const barHeight = day.scheduledCount && !isFuture
            ? Math.max(percent, 4)
            : 0;

          return (
            <View
              key={format(day.date, "yyyy-MM-dd")}
              className="flex-1 items-center"
            >
              <Text className="mb-1 text-[9px] text-muted-foreground">
                {day.scheduledCount && !isFuture ? `${percent}%` : "—"}
              </Text>
              <View className="h-[82px] w-full justify-end overflow-hidden rounded-t-md bg-muted/60">
                <View
                  className="w-full rounded-t-md"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: barColor,
                    opacity,
                  }}
                />
              </View>
              <Text
                className={`mt-1 text-[11px] ${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}
              >
                {format(day.date, "EEEEE")}
              </Text>
              <Text className="mt-0.5 text-[9px] text-muted-foreground">
                {day.scheduledCount && !isFuture
                  ? `${day.completedCount}/${day.scheduledCount}`
                  : "—"}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-xs text-muted-foreground">
          Daily target: {todayStats.scheduledCount} check-ins
        </Text>
        <Text className="text-xs font-semibold" style={{ color: primary }}>
          Today: {todayStats.completedCount}/{todayStats.scheduledCount} check-ins
        </Text>
      </View>
    </Card>
  );
}
