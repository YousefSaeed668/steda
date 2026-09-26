import { HabitRow } from "@/components/habit/HabitRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TabHeader } from "@/components/ui/tab-header";
import { db } from "@/db/client";
import { habit } from "@/db/schema";
import {
  getCurrentStreak,
  getDetailLabel,
  getFrequencyLabel,
  getHabitIcon,
  getMonthlyCompletionRate,
  getStreakDots,
  getWeeklyCompletedCount,
  getWeeklyRequiredCount,
} from "@/lib/habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isNotNull, isNull } from "drizzle-orm";
import { Link } from "expo-router";
import { CircleDashedCheck, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

const Habits = () => {
  const [view, setView] = useState("active");

  const success = useAppThemeColor("success");
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["habits", view],
    queryFn: async () => {
      const [habits, settings] = await Promise.all([
        db.query.habit.findMany({
          where:
            view === "archived"
              ? isNotNull(habit.archivedAt)
              : isNull(habit.archivedAt),
          with: {
            scheduleDays: true,
            entries: true,
            reminders: true,
          },
          orderBy: (fields, { asc }) => [asc(fields.position)],
        }),

        db.query.appSettings.findFirst({
          where: (fields, { eq }) => eq(fields.id, 1),
        }),
      ]);

      return {
        habits,
        settings,
      };
    },
  });

  const habits = data?.habits ?? [];

  const weekStartsOn = (data?.settings?.weekStartsOn ?? 1) as
    0 | 1 | 2 | 3 | 4 | 5 | 6;

  const overview = useMemo(() => {
    const today = new Date();

    const rows = habits.map((row) => {
      const reminder = row.reminders.find((item) => item.enabled);

      return {
        id: row.id,
        name: row.name,
        color: row.color ?? "#6366f1",
        Icon: getHabitIcon(row.icon),
        frequencyLabel: getFrequencyLabel(row, weekStartsOn),
        detailLabel: getDetailLabel(row, reminder),
        dots: getStreakDots(row, today, weekStartsOn),
        streak: getCurrentStreak(row, today, weekStartsOn),
        monthlyRate: getMonthlyCompletionRate(row, today, weekStartsOn),
        weeklyRequired: getWeeklyRequiredCount(row, weekStartsOn, today),
        weeklyCompleted: getWeeklyCompletedCount(row, weekStartsOn, today),
      };
    });

    const totalWeeklyRequired = rows.reduce(
      (sum, row) => sum + row.weeklyRequired,
      0,
    );

    const totalWeeklyCompleted = rows.reduce(
      (sum, row) => sum + row.weeklyCompleted,
      0,
    );

    const weeklyConsistency =
      totalWeeklyRequired > 0
        ? Math.round((totalWeeklyCompleted / totalWeeklyRequired) * 100)
        : 0;

    const maintainedCount = rows.filter((row) => row.streak >= 14).length;

    const maintainedRate =
      rows.length > 0 ? Math.round((maintainedCount / rows.length) * 100) : 0;

    return {
      rows,
      weeklyConsistency,
      maintainedCount,
      maintainedRate,
    };
  }, [habits, weekStartsOn]);

  const refreshHabits = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["habits"],
    });
  };

  const listHeader = (
    <View className="px-4 pt-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-muted-foreground">
          Build small routines, sustain daily focus
        </Text>

        <Link href="/habit/create" asChild className="max-w-36">
          <Button icon={Plus} label="New habit" className="font-bold" />
        </Link>
      </View>

      <SegmentedControl
        options={[
          {
            label: "Active",
            value: "active",
          },
          {
            label: "Archived",
            value: "archived",
          },
        ]}
        value={view}
        onChange={setView}
      />

      <View className="flex-row justify-between items-center my-8">
        <Text className="uppercase tracking-wide text-muted-foreground">
          {view === "archived"
            ? `Archived habits (${overview.rows.length})`
            : `All active habits (${overview.rows.length})`}
        </Text>

        <Text className="tracking-wide text-muted-foreground">
          Weekly consistency: {overview.weeklyConsistency}%
        </Text>
      </View>
    </View>
  );

  const listFooter = (
    <View className="px-4 pb-6">
      <Card className="mt-6 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <CircleDashedCheck size={16} color={success} />

          <Text className="text-sm text-muted-foreground">
            {overview.maintainedCount} of {overview.rows.length} habits
            maintained past 14-day threshold
          </Text>
        </View>

        <Text>{overview.maintainedRate}%</Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaScreen>
      <TabHeader title="habits" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={success} />
        </View>
      ) : (
        <FlatList
          data={overview.rows}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View className={`px-4 ${index === 0 ? "pt-4" : ""}`}>
              <HabitRow
                id={item.id}
                name={item.name}
                frequencyLabel={item.frequencyLabel}
                detailLabel={item.detailLabel}
                Icon={item.Icon}
                color={item.color}
                streak={item.streak}
                dots={item.dots}
                monthlyRate={item.monthlyRate}
              />

              {index < overview.rows.length - 1 && (
                <View className="h-[2px] bg-input-border my-4" />
              )}
            </View>
          )}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refreshHabits}
              tintColor={success}
              colors={[success]}
            />
          }
          ListEmptyComponent={
            <View className="px-4 pb-4">
              <Card className="items-center justify-center py-8">
                <Text className="text-muted-foreground">
                  {view === "archived"
                    ? "No archived habits."
                    : "No active habits yet."}
                </Text>
              </Card>
            </View>
          }
          contentContainerStyle={{
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaScreen>
  );
};

export default Habits;
