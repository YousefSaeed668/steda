import { CadenceCard } from "@/components/habit/Cadencecard";
import { HabitDetailsCard } from "@/components/habit/Habitdetailscard";
import { ReminderCard } from "@/components/habit/Remindercard";
import { SummaryCard } from "@/components/habit/Summarycard";
import { TargetCard } from "@/components/habit/Targetcard";
import { Button } from "@/components/ui/button";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { db } from "@/db/client";
import {
  habit,
  habitReminder,
  habitScheduleDay,
} from "@/db/schema";
import {
  createHabitSchema,
  CreateHabitInput,
} from "@/schemas/create-habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { syncScheduledHabitNotifications } from "@/lib/notifications";
import { getAppSettings } from "@/lib/settings";
import type { WeekStartsOn } from "@/lib/week";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { addMinutes, format, startOfDay } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { eq } from "drizzle-orm";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";

const fetchHabit = async (habitId: string) => {
  const result = await db.query.habit.findFirst({
    where: eq(habit.id, habitId),
    with: {
      scheduleDays: true,
      reminders: true,
    },
  });

  if (!result) {
    throw new Error("Habit not found");
  }

  return result;
};

const EditHabitForm = ({
  habitData,
}: {
  habitData: NonNullable<
    Awaited<ReturnType<typeof fetchHabit>>
  >;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const primary = useAppThemeColor("primary");
  const settingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: getAppSettings,
  });
  const weekStartsOn = (settingsQuery.data?.weekStartsOn ?? 1) as WeekStartsOn;

  const reminder = habitData.reminders.find(
    (item) => item.enabled,
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      name: habitData.name,
      description: habitData.description ?? "",
      icon: habitData.icon ?? "",
      color: habitData.color ?? "",
      category: habitData.category ?? "",
      frequency: habitData.frequency,
      timesPerWeek: habitData.timesPerWeek ?? 1,
      targetValue: habitData.targetValue ?? 1,
      targetUnit: habitData.targetUnit ?? "",
      scheduleDays: habitData.scheduleDays.map(
        (item) => item.weekday,
      ),
      reminderEnabled: Boolean(reminder),
      reminderTime: reminder?.timeMinutes ?? 540,
    },
  });

  const frequency = watch("frequency");
  const timesPerWeek = watch("timesPerWeek");
  const scheduleDays = watch("scheduleDays") ?? [];
  const reminderEnabled = watch("reminderEnabled");
  const reminderTime = watch("reminderTime");
  const targetValue = watch("targetValue");
  const targetUnit = watch("targetUnit");

  const frequencyText =
    frequency === "DAILY"
      ? "Every day"
      : frequency === "TIMES_PER_WEEK"
        ? `${timesPerWeek ?? 0} times a week`
        : scheduleDays.length === 7
          ? "Every day"
          : scheduleDays.length === 0
            ? "No days selected"
            : `On ${scheduleDays.length} days a week`;

  const reminderText =
    reminderEnabled && reminderTime != null
      ? ` at ${format(
          addMinutes(
            startOfDay(new Date()),
            reminderTime,
          ),
          "h:mm a",
        )}`
      : "";

  const goalText =
    targetValue && targetUnit
      ? ` • ${targetValue} ${targetUnit} goal`
      : "";

  const summaryTitle = `${frequencyText}${reminderText}${goalText}`;

  const updateMutation = useMutation({
    mutationFn: async (values: CreateHabitInput) => {
      await db
        .update(habit)
        .set({
          name: values.name,
          description: values.description ?? null,
          icon: values.icon ?? null,
          color: values.color ?? null,
          category: values.category ?? null,
          frequency: values.frequency,
          timesPerWeek:
            values.frequency === "TIMES_PER_WEEK"
              ? values.timesPerWeek ?? null
              : null,
          targetValue: values.targetValue ?? null,
          targetUnit: values.targetUnit ?? null,
        })
        .where(eq(habit.id, habitData.id));

      await db
        .delete(habitScheduleDay)
        .where(eq(habitScheduleDay.habitId, habitData.id));

      if (
        values.frequency === "SPECIFIC_DAYS" &&
        values.scheduleDays &&
        values.scheduleDays.length > 0
      ) {
        await db.insert(habitScheduleDay).values(
          values.scheduleDays.map((weekday) => ({
            habitId: habitData.id,
            weekday,
          })),
        );
      }

      await db
        .delete(habitReminder)
        .where(eq(habitReminder.habitId, habitData.id));

      if (
        values.reminderEnabled &&
        values.reminderTime != null
      ) {
        await db.insert(habitReminder).values({
          habitId: habitData.id,
          enabled: true,
          timeMinutes: values.reminderTime,
        });
      }

      await syncScheduledHabitNotifications({
        requestPermission: values.reminderEnabled,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["habit", habitData.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["habits"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["habit-edit", habitData.id],
      });

      router.back();
    },
  });

  const onSubmit = async (values: CreateHabitInput) => {
    try {
      await updateMutation.mutateAsync(values);
    } catch {
      Alert.alert(
        "Error",
        "Could not update habit. Please try again.",
      );
    }
  };

  const saving =
    isSubmitting || updateMutation.isPending;

  return (
    <SafeAreaScreen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Edit Habit"
          leftAction={{
            label: "Cancel",
            confirmTitle: "Discard Changes?",
            confirmMessage:
              "Are you sure you want to leave? Your changes won't be saved.",
          }}
          rightAction={{
            label: saving ? "Saving..." : "Save",
            onPress: handleSubmit(onSubmit),
            tone: "primary",
          }}
        />

        <View className="px-4 pb-6 pt-4">
          <Text className="uppercase tracking-wider mb-4 text-muted-foreground font-semibold">
            Habit Details
          </Text>

          <HabitDetailsCard
            control={control}
            errors={errors}
          />

          <Text className="uppercase my-4 tracking-wider text-muted-foreground font-semibold">
            cadence
          </Text>

          <CadenceCard
            control={control}
            errors={errors}
            frequency={frequency}
            scheduleDays={scheduleDays}
            weekStartsOn={weekStartsOn}
          />

          <Text className="uppercase tracking-wider mb-4 text-muted-foreground font-semibold">
            reminders
          </Text>

          <ReminderCard
            control={control}
            reminderEnabled={reminderEnabled}
          />

          <Text className="uppercase tracking-wider my-4 text-muted-foreground font-semibold">
            daily target (optional)
          </Text>

          <TargetCard
            control={control}
            errors={errors}
          />

          <SummaryCard
            title={summaryTitle}
            primaryColor={primary}
          />
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background px-4 py-4">
        <Button
          label={saving ? "Saving..." : "Save Changes"}
          onPress={handleSubmit(onSubmit)}
          disabled={saving}
          className="w-[80%] mx-auto"
        />
      </View>
    </SafeAreaScreen>
  );
};

const EditHabitScreen = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const habitId = Array.isArray(id) ? id[0] : id;
  const primary = useAppThemeColor("primary");

  const habitQuery = useQuery({
    queryKey: ["habit-edit", habitId],
    enabled: Boolean(habitId),
    queryFn: () => fetchHabit(habitId),
  });

  if (habitQuery.isLoading) {
    return (
      <SafeAreaScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primary} />

          <Text className="mt-4 text-muted-foreground">
            Loading habit...
          </Text>
        </View>
      </SafeAreaScreen>
    );
  }

  if (habitQuery.isError || !habitQuery.data) {
    return (
      <SafeAreaScreen>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-destructive">
            Unable to load this habit.
          </Text>
        </View>
      </SafeAreaScreen>
    );
  }

  return (
    <EditHabitForm habitData={habitQuery.data} />
  );
};

export default EditHabitScreen;
