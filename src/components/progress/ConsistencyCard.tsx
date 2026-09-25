import { Card } from "@/components/ui/card";
import type { ProgressPeriod } from "@/hooks/useProgressScreen";
import { useAppThemeColor } from "@/theme/app-theme";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react-native";
import { Text, View } from "react-native";

export type ConsistencyCardProps = {
  periodLabel: ProgressPeriod;
  completionPercent: number;
  trendPercentage: number;
  streak: number;
  completedCount: number;
  scheduledCount: number;
  remainingCount: number;
};

export function ConsistencyCard({
  periodLabel,
  completionPercent,
  trendPercentage,
  streak,
  completedCount,
  scheduledCount,
  remainingCount,
}: ConsistencyCardProps) {
  const success = useAppThemeColor("success");
  const warning = useAppThemeColor("warning");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const trendColor =
    trendPercentage > 0
      ? success
      : trendPercentage < 0
        ? warning
        : mutedForeground;
  const TrendIcon =
    trendPercentage > 0
      ? ArrowUpRight
      : trendPercentage < 0
        ? ArrowDownRight
        : Minus;
  const trendText =
    trendPercentage > 0
      ? `+${trendPercentage}%`
      : `${trendPercentage}%`;

  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Consistency Score
          </Text>
          <View className="mt-1 flex-row items-end gap-2">
            <Text className="text-[30px] font-bold leading-9 text-foreground">
              {completionPercent}%
            </Text>
            <View className="mb-1 flex-row items-center gap-1">
              <TrendIcon size={15} color={trendColor} />
              <Text style={{ color: trendColor }} className="text-xs font-medium">
                {trendText} vs {periodLabel === "week" ? "last week" : "last month"}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-lg bg-muted px-3 py-2">
          <Text className="text-xs font-semibold text-foreground">
            {streak} day streak
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="flex-1 text-xs text-muted-foreground">
          {completedCount} of {scheduledCount} scheduled check-ins completed
        </Text>
        <Text className="ml-2 text-xs font-medium text-foreground">
          {remainingCount} remaining
        </Text>
      </View>

      <View className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <View
          className="h-full rounded-full bg-success"
          style={{ width: `${Math.min(completionPercent, 100)}%` }}
        />
      </View>
    </Card>
  );
}
