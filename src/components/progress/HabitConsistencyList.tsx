import { Card } from "@/components/ui/card";
import type {
  ProgressPeriod,
  RankedProgressHabit,
} from "@/hooks/useProgressScreen";
import { getHabitIcon } from "@/lib/habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { Text, View } from "react-native";

type HabitConsistencyListProps = {
  period: ProgressPeriod;
  habits: RankedProgressHabit[];
};

export function HabitConsistencyList({
  period,
  habits,
}: HabitConsistencyListProps) {
  const primary = useAppThemeColor("primary");
  const success = useAppThemeColor("success");
  const warning = useAppThemeColor("warning");

  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-foreground">
          Habit Consistency
        </Text>
        <Text className="text-xs text-muted-foreground">
          Ranked by {period === "week" ? "weekly" : "monthly"} rate
        </Text>
      </View>

      {habits.length === 0 ? (
        <Card variant="subtle" className="items-center">
          <Text className="text-center text-sm text-muted-foreground">
            No scheduled check-ins in this {period} yet.
          </Text>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          {habits.map((item, index) => {
            const Icon = getHabitIcon(item.habit.icon);
            const completionPercent = Math.round(item.completionRatio * 100);
            const progressColor = completionPercent < 75 ? warning : success;

            return (
              <View
                key={item.habit.id}
                className={`flex-row items-center px-3 py-3 ${
                  index < habits.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/70">
                  <Icon
                    color={item.habit.color ?? primary}
                    size={19}
                  />
                </View>

                <View className="ml-3 flex-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-sm font-semibold text-foreground"
                    >
                      {item.habit.name}
                    </Text>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: progressColor }}
                    >
                      {completionPercent}%
                    </Text>
                  </View>

                  <View className="mt-1 flex-row items-center justify-between gap-2">
                    <Text className="text-xs text-muted-foreground">
                      {item.completedCount} of {item.scheduledCount} scheduled check-ins
                    </Text>
                    <Text numberOfLines={1} className="text-[11px] text-muted-foreground">
                      {item.habit.category || "Habit"}
                    </Text>
                  </View>

                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${completionPercent}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}
