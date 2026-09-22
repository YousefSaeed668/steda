import { Card } from "@/components/ui/card";
import { CreateHabitInput } from "@/schemas/create-habit";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TextInput } from "react-native";
import { IconColorPicker } from "./Iconcolorpicker";

export const HabitDetailsCard = ({
  control,
  errors,
}: {
  control: Control<CreateHabitInput>;
  errors: FieldErrors<CreateHabitInput>;
}) => {
  return (
    <Card>
      <Text className="mb-2">Habit Name</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            className={`h-14 rounded-xl border bg-input px-4 font-inter text-[14px] text-foreground ${
              errors.name ? "border-destructive" : "border-input-border"
            }`}
            placeholder="e.g. Drink 8 glasses of water"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.name && (
        <Text className="text-destructive text-sm mt-1">
          {errors.name.message}
        </Text>
      )}
      <Text className="my-2">Description</Text>

      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            multiline
            numberOfLines={3}
            className={` h-24 px-4 rounded-xl border bg-input  font-inter text-[14px] text-foreground ${
              errors.description
                ? "border-destructive"
                : "border-input-border"
            }`}
            placeholder="Optional"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            textAlignVertical="top"
          />
        )}
      />
      {errors.description && (
        <Text className="text-destructive text-sm mt-1">
          {errors.description.message}
        </Text>
      )}
      <Text className="my-2">Icon & Tone</Text>
      <IconColorPicker control={control} />
    </Card>
  );
};