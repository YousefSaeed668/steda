import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TimeField } from "@/components/ui/time";
import { CreateHabitInput } from "@/schemas/create-habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { BellRing, Clock } from "lucide-react-native";
import { Control, Controller } from "react-hook-form";
import { Text, View } from "react-native";

export const ReminderCard = ({
  control,
  reminderEnabled,
}: {
  control: Control<CreateHabitInput>;
  reminderEnabled: boolean;
}) => {
  const primary = useAppThemeColor("primary");

  return (
    <>
      <Card className="flex-col gap-4 rounded-b-none">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="bg-background p-3 rounded-xl">
              <BellRing color={primary} size={22} />
            </View>
            <View>
              <Text className="text-foreground font-semibold text-lg">
                Habit Reminder
              </Text>
              <Text className="text-muted-foreground text-sm">
                Gentle notifications to reflect
              </Text>
            </View>
          </View>
          <Controller
            control={control}
            name="reminderEnabled"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onChange={onChange} />
            )}
          />
        </View>
      </Card>
      {reminderEnabled && (
        <View className="flex-row items-center border-border border justify-between pt-4 bg-accent/90  rounded-b-xl  p-4 ">
          <View className="flex-row gap-2 items-center">
            <Clock size={18} color={primary} />
            <Text className="text-foreground font-medium text-[16px]">
              Reminder Time
            </Text>
          </View>
          <Controller
            control={control}
            name="reminderTime"
            render={({ field: { onChange, value } }) => (
              <TimeField value={value} onChange={onChange} />
            )}
          />
        </View>
      )}
    </>
  );
};
