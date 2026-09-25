import { HabitDayCard } from "@/components/habit/HabitDayCard";
import { Card } from "@/components/ui/card";
import { DayStrip } from "@/components/ui/day-strip";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { TabHeader } from "@/components/ui/tab-header";
import { useTodayScreen } from "@/hooks/useTodayScreen";
import { useAppThemeColor } from "@/theme/app-theme";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { CalendarDays, CircleAlert, Flame, Target } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const TodayScreen = () => {
  const router = useRouter();
  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const warning = useAppThemeColor("warning");

  const {
    today,
    selectedDate,
    setSelectedDate,
    weekStartsOn,
    habits,
    scheduledHabits,
    completedCount,
    completionPercent,
    totalStreak,
    isLoading,
    isError,
    isUpdating,
    onToggleHabit,
  } = useTodayScreen();

  return (
    <SafeAreaScreen>
      <TabHeader
        title="Today"
        rightAction={{
          label: "Open history",
          icon: CalendarDays,
          tone: "neutral",
          onPress: () => router.push("/history" as never),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        <Text className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {format(selectedDate, "EEEE, MMM d")}
        </Text>
        <Text className="mt-1 text-[28px] font-bold text-foreground">
          {getGreeting(selectedDate)}
        </Text>

        <View className="mt-4">
          <DayStrip
            selectedDate={selectedDate}
            today={today}
            weekStartsOn={weekStartsOn}
            habits={habits}
            onDateChange={setSelectedDate}
          />
        </View>

        <Card className="mt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-warning/15">
                <Flame size={20} color={warning} />
              </View>
              <Text className="text-base font-bold text-foreground">
                {totalStreak} day streak
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              {completionPercent === 100 ? "All done" : "Keep going"}
            </Text>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <Text className="font-semibold text-foreground">
              {completedCount} of {scheduledHabits.length} completed
            </Text>
            <Text className="text-sm text-muted-foreground">
              {completionPercent}%
            </Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
        </Card>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">
            Today's Habits
          </Text>
          <Text className="text-sm text-muted-foreground">
            {Math.max(scheduledHabits.length - completedCount, 0)} left
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color={primary} />
          </View>
        ) : isError ? (
          <Card variant="subtle" className="mt-3 items-center">
            <CircleAlert color={warning} size={24} />
            <Text className="mt-2 text-center text-muted-foreground">
              Unable to load today's habits.
            </Text>
          </Card>
        ) : scheduledHabits.length === 0 ? (
          <Card variant="subtle" className="mt-3 items-center">
            <Target color={mutedForeground} size={24} />
            <Text className="mt-2 text-center text-muted-foreground">
              No habits are scheduled for this day.
            </Text>
          </Card>
        ) : (
          <View className="mt-3 gap-3">
            {scheduledHabits.map((item) => (
              <HabitDayCard
                key={item.id}
                habit={item}
                date={selectedDate}
                onPress={() => router.push(`/habit/${item.id}`)}
                onToggle={(completed) => onToggleHabit(item.id, completed)}
                isUpdating={isUpdating}
              />
            ))}
          </View>
        )}

        <View className="mt-6 flex-row items-center rounded-2xl bg-muted px-4 py-4">
          <CalendarDays size={20} color={mutedForeground} />
          <Text className="ml-3 flex-1 text-sm text-muted-foreground">
            Select a day to review and complete its scheduled habits.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
};

export default TodayScreen;
