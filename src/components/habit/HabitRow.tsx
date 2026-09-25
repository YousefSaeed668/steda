import { useAppThemeColor } from "@/theme/app-theme";
import { Link } from "expo-router";
import { ChevronRight, Rocket } from "lucide-react-native";
import { ComponentType } from "react";
import { Text, View } from "react-native";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
}>;

type HabitRowProps = {
  id: string;
  name: string;
  frequencyLabel: string;
  detailLabel: string;
  Icon: IconComponent;
  color: string;
  streak: number;
  dots: boolean[];
  monthlyRate: number;
  showStatusBadge?: boolean;
  isArchived?: boolean;
};

export const HabitRow = ({
  id,
  name,
  frequencyLabel,
  detailLabel,
  Icon,
  color,
  streak,
  dots,
  monthlyRate,
  showStatusBadge = false,
  isArchived = false,
}: HabitRowProps) => {
  const warning = useAppThemeColor("warning");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const isActive = !isArchived;

  return (
    <Link href={`/habit/${id}`}>
      <View className="flex-row justify-between items-center w-full">
        <View className="flex-row items-center gap-2">
          <View className="size-14 items-center justify-center rounded-xl bg-accent/90">
            <Icon color={color} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 justify-between">
              <Text className="font-bold text-xl">
                {name}
                <Text className="text-base font-normal text-muted-foreground">
                  {" "}
                  • {frequencyLabel}
                </Text>
              </Text>

              {showStatusBadge && (
                <View
                  className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
                    isActive ? "bg-success/20" : "bg-muted"
                  }`}
                >
                  <View
                    className={`size-1.5 rounded-full ${
                      isActive ? "bg-success" : "bg-muted-foreground"
                    }`}
                  />

                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {isActive ? "Active" : "Paused"}
                  </Text>
                </View>
              )}
            </View>

            {detailLabel && (
              <Text className="text-muted-foreground">{detailLabel}</Text>
            )}

            <View className="flex-row gap-4 items-center">
              <View className="flex-row gap-1 mt-2">
                {dots.map((done, index) => (
                  <View
                    key={index}
                    className={`size-3.5 rounded-full ${
                      done ? "bg-success" : "bg-secondary"
                    }`}
                  />
                ))}
              </View>

              <View className="flex-row items-center gap-1 mt-1">
                <Rocket size={18} color={warning} />

                <Text className="text-warning font-medium">
                  {streak}d streak
                </Text>
              </View>

              {monthlyRate >= 90 && (
                <View className="bg-success px-2 py-0.5 rounded-full mt-1">
                  <Text className="text-white text-xs font-semibold">
                    On track
                  </Text>
                </View>
              )}
            </View>
          </View>
          {showStatusBadge&&<ChevronRight color={mutedForeground} size={18} />}
        </View>
      </View>
    </Link>
  );
};
