import { Card } from "@/components/ui/card";
import type { WeekStartsOn } from "@/components/ui/day-strip";
import type {
  HistoryCalendarDay,
  HistoryDayStatus,
} from "@/hooks/useHistoryScreen";
import { useAppThemeColor } from "@/theme/app-theme";
import { addDays, format, isAfter, isSameDay, startOfWeek } from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type HistoryCalendarProps = {
  visibleMonth: Date;
  selectedDate: Date;
  today: Date;
  weekStartsOn: WeekStartsOn;
  calendarDays: HistoryCalendarDay[];
  monthStats: { averageCompletion: number; activeDayCount: number };
  yearOptions: number[];
  isYearPickerVisible: boolean;
  setIsYearPickerVisible: (visible: boolean) => void;
  changeMonth: (offset: number) => void;
  selectDate: (date: Date) => void;
  selectYear: (year: number) => void;
};

export function HistoryCalendar({
  visibleMonth,
  selectedDate,
  today,
  weekStartsOn,
  calendarDays,
  monthStats,
  yearOptions,
  isYearPickerVisible,
  setIsYearPickerVisible,
  changeMonth,
  selectDate,
  selectYear,
}: HistoryCalendarProps) {
  const primary = useAppThemeColor("primary");
  const primaryForeground = useAppThemeColor("primaryForeground");
  const success = useAppThemeColor("success");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(2024, 0, 7), { weekStartsOn });
    return Array.from({ length: 7 }, (_, index) =>
      format(addDays(weekStart, index), "EEEEE"),
    );
  }, [weekStartsOn]);

  const getDotColor = (status: HistoryDayStatus) => {
    return status === "missed" || status === "inactive"
      ? mutedForeground
      : success;
  };

  const getDotOpacity = (status: HistoryDayStatus) => {
    if (status === "high") return 0.72;
    if (status === "partial") return 0.45;
    if (status === "missed") return 0.22;
    return 1;
  };

  return (
    <>
      <Card className="mt-4 px-3 py-4">
        <View className="mb-3 flex-row items-center justify-between px-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => changeMonth(-1)}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronLeft size={21} color={mutedForeground} />
          </Pressable>

          <View className="flex-1 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose year"
              onPress={() => setIsYearPickerVisible(true)}
              className="flex-row items-center gap-1"
            >
              <Text className="text-base font-semibold text-foreground">
                {format(visibleMonth, "MMMM yyyy")}
              </Text>
              <ChevronDown size={14} color={mutedForeground} />
            </Pressable>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {monthStats.averageCompletion}% average completion
              {" • "}
              {monthStats.activeDayCount} active days
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => changeMonth(1)}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronRight size={21} color={mutedForeground} />
          </Pressable>
        </View>

        <View className="mb-1 flex-row">
          {weekDays.map((day, index) => (
            <View
              key={`${day}-${index}`}
              className="w-[14.285%] items-center py-1"
            >
              <Text className=" font-medium text-muted-foreground">{day}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {calendarDays.map((day) => {
            const selected = isSameDay(day.date, selectedDate);
            const isToday = isSameDay(day.date, today);
            const isFuture = isAfter(day.date, today);
            const showDot = day.scheduledCount > 0 && !isFuture;

            return (
              <Pressable
                key={format(day.date, "yyyy-MM-dd")}
                accessibilityRole="button"
                accessibilityLabel={`${format(day.date, "EEEE, MMMM d, yyyy")}, ${day.completedCount} of ${day.scheduledCount} habits complete`}
                onPress={() => selectDate(day.date)}
                className="h-16 w-[14.285%] items-center justify-center"
              >
                <View
                  className={`h-12 w-10 items-center justify-center rounded-xl ${selected ? "bg-primary" : ""} ${isToday && !selected ? "bg-muted" : ""}`}
                >
                  <Text
                    className={`text-sm ${selected ? "font-semibold text-primary-foreground" : day.inVisibleMonth ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {format(day.date, "d")}
                  </Text>
                  {showDot ? (
                    <View
                      className="mt-0.5 size-1.5 rounded-full"
                      style={{
                        backgroundColor: selected
                          ? primaryForeground
                          : getDotColor(day.status),
                        opacity: getDotOpacity(day.status),
                      }}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border pt-3">
          <LegendItem color={success} label="All done" />
          <LegendItem color={success} opacity={0.72} label="High" />
          <LegendItem color={success} opacity={0.45} label="Partial" />
          <LegendItem color={mutedForeground} opacity={0.45} label="Missed" />
        </View>
      </Card>

      <Modal
        visible={isYearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsYearPickerVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-8"
          onPress={() => setIsYearPickerVisible(false)}
        >
          <Pressable
            className="max-h-[70%] w-full rounded-2xl bg-card p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-3 text-center text-base font-semibold text-foreground">
              Choose year
            </Text>
            <ScrollView>
              {yearOptions.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => selectYear(year)}
                  className={`rounded-xl px-4 py-3 ${year === visibleMonth.getFullYear() ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-center ${year === visibleMonth.getFullYear() ? "font-semibold text-primary-foreground" : "text-foreground"}`}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function LegendItem({
  color,
  label,
  opacity = 1,
}: {
  color: string;
  label: string;
  opacity?: number;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className="size-2 rounded-full"
        style={{ backgroundColor: color, opacity }}
      />
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}
