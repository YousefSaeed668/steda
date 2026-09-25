import { useAppThemeColor } from "@/theme/app-theme";
import { CheckCircle2, PieChart, Rocket, Trophy } from "lucide-react-native";
import { Text, View } from "react-native";
import { Card } from "../ui/card";

type HabitStatsProps = {
  monthlyRate: number;
  currentStreak: number;
  bestStreak: number;
  completedSessions: number;
  requiredSessions: number;
};

export const HabitStats = ({
  monthlyRate,
  currentStreak,
  bestStreak,
  completedSessions,
  requiredSessions,
}: HabitStatsProps) => {
  const warning = useAppThemeColor("warning");
  const goalLabel = monthlyRate >= 80 ? "Above personal goal" : "Below personal goal";

  return (
    <View className="gap-3 my-6">
      <View className="flex-row gap-3">
        <Card className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="mb-3 font-semibold uppercase tracking-wider text-muted-foreground">
              MONTHLY RATE
            </Text>
            <PieChart size={18} className="text-muted-foreground" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">{monthlyRate}%</Text>
          <Text className={`font-medium ${monthlyRate >= 80 ? "text-success" : "text-muted-foreground"}`}>
            {goalLabel}
          </Text>
        </Card>
        <Card className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="mb-3 font-semibold uppercase tracking-wider text-muted-foreground">
              CURRENT STREAK
            </Text>
            <Rocket size={18} color={warning} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {currentStreak} days
          </Text>
          <Text className="text-muted-foreground">Active cadence</Text>
        </Card>
      </View>
      <View className="flex-row gap-3">
        <Card className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="mb-3 font-semibold uppercase tracking-wider text-muted-foreground">
              BEST STREAK
            </Text>
            <Trophy size={18} className="text-muted-foreground" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {bestStreak} days
          </Text>
          <Text className="text-muted-foreground">All time</Text>
        </Card>
        <Card className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="mb-3 font-semibold uppercase tracking-wider text-muted-foreground">
              TOTAL SESSIONS
            </Text>
            <CheckCircle2 size={18} className="text-muted-foreground" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {completedSessions} / {requiredSessions}
          </Text>
          <Text className="text-muted-foreground">Days completed</Text>
        </Card>
      </View>
    </View>
  );
};