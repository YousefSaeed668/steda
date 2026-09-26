import { db } from "@/db/client";
import {
  habit,
  habitFrequencyValues,
  habitReminder,
  habitScheduleDay,
} from "@/db/schema";
import { CreateHabitInput, createHabitSchema } from "@/schemas/create-habit";
import { syncScheduledHabitNotifications } from "@/lib/notifications";
import { zodResolver } from "@hookform/resolvers/zod";
import {useQueryClient } from "@tanstack/react-query";
import { addMinutes, format, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

export function useCreateHabitForm() {
  const router = useRouter();
const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),

    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "",
      category: "",
      frequency: habitFrequencyValues[0],
      timesPerWeek: 1,
      targetValue: 1,
      targetUnit: "",
      scheduleDays: [0],
      reminderEnabled: false,
      reminderTime: 540,
    },
  });

  const frequency = watch("frequency");
  const timesPerWeek = watch("timesPerWeek");
  const scheduleDays = watch("scheduleDays") || [];
  const reminderEnabled = watch("reminderEnabled");
  const reminderTime = watch("reminderTime");
  const targetValue = watch("targetValue");
  const targetUnit = watch("targetUnit");

  const getFrequencyText = () => {
    if (frequency === "DAILY") return "Every day";
    if (frequency === "TIMES_PER_WEEK") return `${timesPerWeek} times a week`;
    if (frequency === "SPECIFIC_DAYS") {
      if (scheduleDays.length === 7) return "Every day";
      if (scheduleDays.length === 0) return "No days selected";
      return `On ${scheduleDays.length} days a week`;
    }
    return "Every day";
  };

  const frequencyText = getFrequencyText();
  const reminderText =
    reminderEnabled && reminderTime != null
      ? ` at ${format(
          addMinutes(startOfDay(new Date()), reminderTime),
          "h:mm a",
        )}`
      : "";
  const goalText =
    targetValue && targetUnit ? ` • ${targetValue} ${targetUnit} goal` : "";
  const summaryTitle = `${frequencyText}${reminderText}${goalText}`;

  async function onSubmit(values: CreateHabitInput) {
    try {
      let createdHabitId: string | undefined;

      const [newHabit] = await db
        .insert(habit)
        .values({
          name: values.name,
          description: values.description ?? null,
          icon: values.icon ?? null,
          color: values.color ?? null,
          category: values.category ?? null,
          frequency: values.frequency,
          timesPerWeek:
            values.frequency === "TIMES_PER_WEEK"
              ? (values.timesPerWeek ?? null)
              : null,
          targetValue: values.targetValue ?? null,
          targetUnit: values.targetUnit ?? null,
        })
        .returning();

      if (!newHabit?.id) {
        throw new Error("Failed to insert habit row.");
      }

      createdHabitId = newHabit.id;

      if (values.frequency === "SPECIFIC_DAYS") {
        if (values.scheduleDays && values.scheduleDays.length > 0) {
          await db.insert(habitScheduleDay).values(
            values.scheduleDays.map((weekday) => ({
              habitId: newHabit.id,
              weekday: weekday,
            })),
          );
        }
      }

      if (values.reminderEnabled && values.reminderTime != null) {
        await db.insert(habitReminder).values({
          habitId: newHabit.id,
          enabled: true,
          timeMinutes: values.reminderTime,
        });
      }
      await syncScheduledHabitNotifications({
        requestPermission: values.reminderEnabled,
      });
      await queryClient.invalidateQueries({
        queryKey: ["habits"],
      });
      console.log("✅ Habit created successfully with ID:", createdHabitId);
      router.back();
    } catch (error) {
      console.error("❌ Failed to create habit:", error);
      Alert.alert("Error", "Could not save habit. Please try again.");
    }
  }

  return {
    control,
    errors,
    isSubmitting,
    handleSubmit,
    onSubmit,
    frequency,
    scheduleDays,
    reminderEnabled,
    summaryTitle,
  };
}
