import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { habitFrequencyValues } from "@/db/schema";
import { CreateHabitInput } from "@/schemas/create-habit";
import { getOrderedWeekdays, type WeekStartsOn } from "@/lib/week";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";

export const CadenceCard = ({
  control,
  errors,
  frequency,
  scheduleDays,
  weekStartsOn,
}: {
  control: Control<CreateHabitInput>;
  errors: FieldErrors<CreateHabitInput>;
  frequency: CreateHabitInput["frequency"];
  scheduleDays: number[];
  weekStartsOn: WeekStartsOn;
}) => {
  const weekdayOptions = getOrderedWeekdays(weekStartsOn).map((day) => ({
    label: day.initial,
    value: day.weekday,
  }));

  return (
    <Card>
      <Controller
        control={control}
        name="frequency"
        render={({ field: { onChange, value } }) => (
          <SegmentedControl
            options={[
              { label: "Daily", value: habitFrequencyValues[0] },
              { label: "Specific Days", value: habitFrequencyValues[1] },
              { label: "Times Per Week", value: habitFrequencyValues[2] },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />

      {frequency === "SPECIFIC_DAYS" ? (
        <>
          <View className="my-4 flex-row justify-between">
            <Text className="font-semibold">Selected Days</Text>
            <Text className="text-primary font-semibold">
              {scheduleDays.length} days active
            </Text>
          </View>
          <View className="items-center">
            <Controller
              control={control}
              name="scheduleDays"
              render={({ field: { onChange, value } }) => (
                <ToggleGroup
                  value={value}
                  onChange={onChange}
                  multiple
                  itemClassName="h-12 w-12 rounded-full bg-input"
                  activeItemClassName="bg-primary"
                  labelClassName="font-medium text-foreground"
                  activeLabelClassName="text-white"
                  options={weekdayOptions}
                />
              )}
            />
            {errors.scheduleDays && (
              <Text className="text-destructive text-sm mt-2">
                {errors.scheduleDays.message}
              </Text>
            )}
          </View>
        </>
      ) : frequency === "TIMES_PER_WEEK" ? (
        <View className="mt-6 w-full max-w-[240px] self-center">
          <Controller
            control={control}
            name="timesPerWeek"
            render={({ field: { onChange, value } }) => (
              <Stepper
                value={value || 0}
                onChange={onChange}
                min={1}
                max={6}
              />
            )}
          />
          {errors.timesPerWeek && (
            <Text className="text-destructive text-sm mt-2 text-center">
              {errors.timesPerWeek.message}
            </Text>
          )}
        </View>
      ) : null}
    </Card>
  );
};
