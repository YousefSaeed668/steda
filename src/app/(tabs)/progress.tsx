import { ConsistencyCard } from "@/components/progress/ConsistencyCard";
import { HabitConsistencyList } from "@/components/progress/HabitConsistencyList";
import { MonthlyActivityCard } from "@/components/progress/MonthlyActivityCard";
import { WeeklyBreakdownCard } from "@/components/progress/WeeklyBreakdownCard";
import { Card } from "@/components/ui/card";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TabHeader } from "@/components/ui/tab-header";
import {
  type ProgressPeriod,
  useProgressScreen,
} from "@/hooks/useProgressScreen";
import { useAppThemeColor } from "@/theme/app-theme";
import { format } from "date-fns";
import { CalendarDays, CircleAlert } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const periodOptions = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
] as const;

const ProgressScreen = () => {
  const primary = useAppThemeColor("primary");
  const warning = useAppThemeColor("warning");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const {
    period,
    setPeriod,
    today,
    periodStart,
    periodEnd,
    weekStartsOn,
    periodStats,
    completionPercent,
    trendPercentage,
    streak,
    dailyBreakdown,
    monthlyActivity,
    todayStats,
    rankedHabits,
    isLoading,
    isError,
  } = useProgressScreen();

  const periodRange = `${format(periodStart, "MMM d")} – ${format(
    periodEnd,
    "MMM d, yyyy",
  )}`;

  return (
    <SafeAreaScreen>
      <TabHeader title="Progress" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        <SegmentedControl<ProgressPeriod>
          options={periodOptions}
          value={period}
          onChange={setPeriod}
          className="mt-1"
        />

        <View className="mt-2 flex-row items-center justify-center gap-2">
          <CalendarDays size={15} color={mutedForeground} />
          <Text className="text-xs font-medium text-muted-foreground">
            {periodRange}
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color={primary} />
          </View>
        ) : isError ? (
          <Card variant="subtle" className="mt-4 items-center">
            <CircleAlert color={warning} size={24} />
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              Unable to load progress. Please try again.
            </Text>
          </Card>
        ) : (
          <>
            <View className="mt-4">
              <ConsistencyCard
                periodLabel={period}
                completionPercent={completionPercent}
                trendPercentage={trendPercentage}
                streak={streak}
                completedCount={periodStats.completedCount}
                scheduledCount={periodStats.scheduledCount}
                remainingCount={periodStats.remainingCount}
              />
            </View>

            {period === "week" ? (
              <View className="mt-4">
                <WeeklyBreakdownCard
                  days={dailyBreakdown}
                  today={today}
                  todayStats={todayStats}
                />
              </View>
            ) : (
              <View className="mt-4">
                <MonthlyActivityCard
                  month={periodStart}
                  today={today}
                  weekStartsOn={weekStartsOn}
                  days={monthlyActivity}
                  todayStats={todayStats}
                />
              </View>
            )}

            <HabitConsistencyList period={period} habits={rankedHabits} />
          </>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
};

export default ProgressScreen;
