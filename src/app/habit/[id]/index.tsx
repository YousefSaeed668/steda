import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  CirclePause,
  CirclePlay,
  Clock,
  Trash2,
} from "lucide-react-native";
import { Alert, ScrollView, Text, View } from "react-native";

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
  const destructive = useAppThemeColor("destructive");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);

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

  const persistedSessionValue =
    habitQuery.data?.entries.find((entry) => entry.dateKey === todayKey)
      ?.value ?? 0;
  const [sessionValue, setSessionValue] = useState(persistedSessionValue);

  useEffect(() => {
    setSessionValue(persistedSessionValue);
  }, [id, persistedSessionValue]);

  const completeMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!id) {
        throw new Error("Habit id is required");
      }

      const existingEntry = await db.query.habitEntry.findFirst({
        where: and(eq(habitEntry.habitId, id), eq(habitEntry.dateKey, todayKey)),
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
        dateKey: todayKey,
        value: amount,
        completedAt: new Date(),
      });
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["today"] }),
        queryClient.invalidateQueries({ queryKey: ["habits"] }),
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
        queryClient.invalidateQueries({ queryKey: ["habit", id] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("Habit id is required");
      }

      await db.delete(habit).where(eq(habit.id, id));
    },
    onSuccess: () => {
      void syncScheduledHabitNotifications().catch((error) => {
        console.error("Failed to refresh habit reminders:", error);
      });

      void Promise.all(
        ["today", "habits", "progress", "history", "habit"].map(
          (queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] }),
        ),
      );

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/habits");
      }
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

    },
    onMutate: async (shouldArchive) => {
      await queryClient.cancelQueries({ queryKey: ["habit", id] });

      const previousHabit = queryClient.getQueryData(["habit", id]);
      queryClient.setQueryData(["habit", id], (current: typeof habitQuery.data) =>
        current
          ? { ...current, archivedAt: shouldArchive ? new Date() : null }
          : current,
      );

      return { previousHabit };
    },
    onError: (_error, _shouldArchive, context) => {
      if (context?.previousHabit) {
        queryClient.setQueryData(["habit", id], context.previousHabit);
      }
    },
    onSuccess: () => {
      void syncScheduledHabitNotifications().catch((error) => {
        console.error("Failed to refresh habit reminders:", error);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["habit", id],
      });

      void queryClient.invalidateQueries({
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
  const archiveActionLabel = archiveMutation.isPending
    ? archiveMutation.variables
      ? "Pausing..."
      : "Resuming..."
    : isArchived
      ? "Resume habit"
      : "Pause habit";
  const isLifecycleUpdating =
    archiveMutation.isPending || deleteMutation.isPending;

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
    (entry) => entry.dateKey === todayKey,
  );

  const isCompletedToday = (todayEntry?.value ?? 0) > 0;

  const targetValue = currentHabit.targetValue ?? 1;

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
              description={currentHabit.description}
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

                <Text className="text-2xl font-medium text-foreground">Today's Session</Text>
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
                onChange={setSessionValue}
                unit={currentHabit.targetUnit ?? ""}
              />
            </Card>

            <Button
              label={
                completeMutation.isPending
                  ? "Saving..."
                  : isCompletedToday
                    ? "Completed"
                    : `Log & Complete ${sessionValue}${currentHabit.targetUnit ? ` ${currentHabit.targetUnit}` : ""}`
              }
              className="my-2 h-14"
              icon={CircleCheck}
              disabled={
                completeMutation.isPending ||
                isCompletedToday ||
                isArchived ||
                sessionValue <= 0
              }
              onPress={() => {
                completeMutation.mutate(sessionValue);
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
              isLifecycleUpdating ? "opacity-50" : ""
            }`}
            onPress={() => {
              if (!isLifecycleUpdating) {
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
                {archiveActionLabel}
              </Text>
            </View>

            <ChevronRight size={18} color={mutedForeground} />
          </Card>

          <Card
            className={`mt-3 flex-row items-center justify-between border-destructive/30 bg-destructive/10 py-4 px-2 ${
              isLifecycleUpdating ? "opacity-50" : ""
            }`}
            onPress={() => {
              if (isLifecycleUpdating) return;

              Alert.alert(
                "Delete habit?",
                `This will permanently remove ${currentHabit.name} and its history.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete habit",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(),
                  },
                ],
              );
            }}
          >
            <View className="flex-row items-center gap-2">
              <Trash2 size={20} color={destructive} />
              <Text className="text-lg font-medium text-destructive">
                {deleteMutation.isPending ? "Deleting..." : "Delete habit"}
              </Text>
            </View>

            <ChevronRight size={18} color={destructive} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
};

export default Index;
