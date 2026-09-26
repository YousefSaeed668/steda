import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { CreateHabitInput } from "@/schemas/create-habit";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";

export const TargetCard = ({
  control,
  errors,
}: {
  control: Control<CreateHabitInput>;
  errors: FieldErrors<CreateHabitInput>;
}) => {
  return (
    <Card>
      <View className="flex-row justify-between">
        <View>
          <Text className="text-foreground font-semibold text-lg">
            Quantity Target
          </Text>
          <Text className="text-muted-foreground text-sm">
            Track dicrete amount per day
          </Text>
        </View>
        <Controller
          control={control}
          name="targetValue"
          render={({ field: { onChange, value } }) => (
            <Stepper
              value={value || 0}
              onChange={onChange}
              min={1}
              className="min-w-40"
            />
          )}
        />
      </View>
      {errors.targetValue && (
        <Text className="text-destructive text-sm mt-2">
          {errors.targetValue.message}
        </Text>
      )}
      <Controller
        control={control}
        name="targetUnit"
        render={({ field: { onChange, value } }) => (
          <ToggleGroup
            className="mt-6"
            itemClassName="py-2 px-4 rounded-xl bg-muted "
            labelClassName="font-semibold text-muted-foreground"
            options={[
              { label: "Minutes", value: "minutes" },
              { label: "Pages", value: "pages" },
              { label: "Reps", value: "reps" },
              { label: "L", value: "litres" },
              { label: "Set", value: "set" },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
    </Card>
  );
};
