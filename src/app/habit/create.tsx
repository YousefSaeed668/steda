import { CadenceCard } from "@/components/habit/Cadencecard";
import { HabitDetailsCard } from "@/components/habit/Habitdetailscard";
import { ReminderCard } from "@/components/habit/Remindercard";
import { SummaryCard } from "@/components/habit/Summarycard";
import { TargetCard } from "@/components/habit/Targetcard";
import { Button } from "@/components/ui/button";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useCreateHabitForm } from "@/hooks/useCreateHabitForm";
import { useAppThemeColor } from "@/theme/app-theme";
import { ScrollView, Text, View } from "react-native";


const CreateHabitScreen = () => {
  const primary = useAppThemeColor("primary");
  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    frequency,
    scheduleDays,
    reminderEnabled,
    summaryTitle,
    weekStartsOn,
  } = useCreateHabitForm();

  return (
    <SafeAreaScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Create Habit"
          leftAction={{
            label: "Cancel",
            confirmTitle: "Discard Habit?",
            confirmMessage:
              "Are you sure you want to leave? Your new habit won't be saved.",
          }}
          rightAction={{
            label: "Save",
            onPress: handleSubmit(onSubmit),
            tone: "primary",
          }}
        />

        <View className="px-4 pb-6 pt-4">
          <Text className="uppercase tracking-wider mb-4 text-muted-foreground font-semibold">
            Habit Details
          </Text>
          <HabitDetailsCard control={control} errors={errors} />

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
          <ReminderCard control={control} reminderEnabled={reminderEnabled} />

          <Text className="uppercase tracking-wider my-4 text-muted-foreground font-semibold">
            daily target (optional)
          </Text>
          <TargetCard control={control} errors={errors} />

          <SummaryCard title={summaryTitle} primaryColor={primary} />
        </View>
      </ScrollView>
      <View className="absolute bottom-2 left-0 right-0 bg-background px-4 py-4 border-t border-border">
        <Button
          label="Create Habit"
          onPress={handleSubmit(onSubmit)}
          className="w-[80%] mx-auto"
        />
      </View>
    </SafeAreaScreen>
  );
};

export default CreateHabitScreen;
