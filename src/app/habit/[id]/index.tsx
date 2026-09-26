import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  CirclePause,
  CirclePlay,
  Clock,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { HabitRow } from "@/components/habit/HabitRow";
import { HabitStats } from "@/components/habit/HabitStats";
import { RecentConsistency } from "@/components/habit/RecentConsistency";
import { RecentHistory } from "@/components/habit/RecentHistory";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Stepper } from "@/components/ui/stepper";
import { db } from "@/db/client";
import { habit, habitEntry } from "@/db/schema";
import {
  getCurrentStreak,
  getDetailLabel,
  getFrequencyLabel,
  getHabitIcon,
  getMonthlyCompletionRate,
  getStreakDots,
  getWeeklyCompletedCount,
  getWeeklyRequiredCount,
  toDateKey,
} from "@/lib/habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { syncScheduledHabitNotifications } from "@/lib/notifications";
import { getAppSettings } from "@/lib/settings";
import type { WeekStartsOn } from "@/lib/week";

const Index = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id } = useLocalSearchParams<{ id: string }>();

  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const today = startOfDay(new Date());

  const habitQuery = useQuery({
    queryKey: ["habit", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await db.query.habit.findFirst({
        where: eq(habit.id, id),
        with: {
          scheduleDays: true,
          entries: true,
          reminders: true,
        },
      });

      if (!result) {
        throw new Error("Habit not found");
      }

      return result;
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: getAppSettings,
  });

  const completeMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!id) {
        throw new Error("Habit id is required");
      }

      const dateKey = toDateKey(today);

      const existingEntry = await db.query.habitEntry.findFirst({
        where: and(eq(habitEntry.habitId, id), eq(habitEntry.dateKey, dateKey)),
      });

      if (existingEntry) {
        await db
          .update(habitEntry)
          .set({
            value: amount,
            completedAt: new Date(),
          })
          .where(eq(habitEntry.id, existingEntry.id));

        return;
      }

      await db.insert(habitEntry).values({
        habitId: id,
        dateKey,
        value: amount,
        completedAt: new Date(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["habit", id],
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (shouldArchive: boolean) => {
      if (!id) {
        throw new Error("Habit id is required");
      }

      await db
        .update(habit)
        .set({
          archivedAt: shouldArchive ? new Date() : null,
        })
        .where(eq(habit.id, id));

      await syncScheduledHabitNotifications();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["habit", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["habits"],
      });
    },
  });

  if (habitQuery.isLoading) {
    return (
      <SafeAreaScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading habit...</Text>
        </View>
      </SafeAreaScreen>
    );
  }

  if (habitQuery.isError || !habitQuery.data) {
    return (
      <SafeAreaScreen>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-foreground text-lg font-semibold">
            Unable to load this habit.
          </Text>
        </View>
      </SafeAreaScreen>
    );
  }

  const currentHabit = habitQuery.data;
  const weekStartsOn = (settingsQuery.data?.weekStartsOn ?? 1) as WeekStartsOn;

  const isArchived = Boolean(currentHabit.archivedAt);

  const reminder = currentHabit.reminders[0];

  const monthlyRate = getMonthlyCompletionRate(
    currentHabit,
    today,
    weekStartsOn,
  );

  const currentStreak = getCurrentStreak(currentHabit, today, weekStartsOn);

  const weeklyCompleted = getWeeklyCompletedCount(
    currentHabit,
    weekStartsOn,
    today,
  );

  const weeklyRequired = getWeeklyRequiredCount(
    currentHabit,
    weekStartsOn,
    today,
  );

  const frequencyLabel = getFrequencyLabel(currentHabit, weekStartsOn);

  const detailLabel = getDetailLabel(currentHabit, reminder);

  const todayEntry = currentHabit.entries.find(
    (entry) => entry.dateKey === toDateKey(today),
  );

  const isCompletedToday = (todayEntry?.value ?? 0) > 0;

  const targetValue = currentHabit.targetValue ?? 1;

  const sessionValue = todayEntry?.value ?? targetValue;

  return (
    <SafeAreaScreen>
      <ScreenHeader
        title="Habit Details"
        leftAction={{
          icon: ArrowLeft,
          onPress: () => router.back(),
        }}
        rightAction={{
          label: "Edit",
          onPress: () => router.push(`/habit/${id}/edit`),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-12 pt-4">
          <Card className="pb-4">
            <HabitRow
              id={currentHabit.id}
              name={currentHabit.name}
              frequencyLabel={frequencyLabel}
              detailLabel={detailLabel}
              Icon={getHabitIcon(currentHabit.icon)}
              color={currentHabit.color ?? primary}
              streak={currentStreak}
              dots={getStreakDots(currentHabit, today, weekStartsOn)}
              monthlyRate={monthlyRate}
              showStatusBadge
              isArchived={Boolean(currentHabit.archivedAt)}
            />
          </Card>

          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-2 items-center">
                <Clock color={primary} />

                <Text className="text-2xl font-medium">Today's Session</Text>
              </View>

              <View className="py-1 px-2 bg-muted rounded-xl">
                <Text className="text-muted-foreground uppercase font-medium">
                  {isCompletedToday ? "completed" : "in progress"}
                </Text>
              </View>
            </View>

            <Card variant="subtle" className="my-4">
              <Stepper
                targetValue={targetValue}
                value={sessionValue}
                onChange={() => {}}
                unit={currentHabit.targetUnit ?? ""}
              />
            </Card>

            <Button
              label={
                completeMutation.isPending
                  ? "Saving..."
                  : isCompletedToday
                    ? "Completed"
                    : `Log & Complete ${targetValue}${currentHabit.targetUnit ?? ""}`
              }
              className="my-2 h-14"
              icon={CircleCheck}
              disabled={completeMutation.isPending || isCompletedToday}
              onPress={() => {
                completeMutation.mutate(targetValue);
              }}
            />
          </Card>

          <RecentConsistency habit={currentHabit} today={today} />

          <HabitStats
            monthlyRate={monthlyRate}
            currentStreak={currentStreak}
            bestStreak={currentStreak}
            completedSessions={weeklyCompleted}
            requiredSessions={weeklyRequired}
          />

          <RecentHistory
            entries={currentHabit.entries}
            isLoading={habitQuery.isLoading}
          />

          <Card
            className={`flex-row items-center justify-between py-4 px-2 ${
              archiveMutation.isPending ? "opacity-50" : ""
            }`}
            onPress={() => {
              if (!archiveMutation.isPending) {
                archiveMutation.mutate(!isArchived);
              }
            }}
          >
            <View className="flex-row items-center gap-2">
              {isArchived ? (
                <CirclePlay size={20} color={mutedForeground} />
              ) : (
                <CirclePause size={20} color={mutedForeground} />
              )}

              <Text className="text-foreground font-medium text-lg">
                {archiveMutation.isPending
                  ? isArchived
                    ? "Resuming..."
                    : "Pausing..."
                  : isArchived
                    ? "Resume habit"
                    : "Pause habit"}
              </Text>
            </View>

            <ChevronRight size={18} color={mutedForeground} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
};

export default Index;
