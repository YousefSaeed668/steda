import { getCurrentStreak, getDetailLabel, getFrequencyLabel, getHabitIcon, toDateKey, type HabitLike } from "@/lib/habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { Check, Flame } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export type HabitDayCardData = HabitLike & {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  targetValue: number | null;
  targetUnit: string | null;
  reminders: Array<{ enabled: boolean; timeMinutes: number }>;
};

export type HabitDayCardProps = {
  habit: HabitDayCardData;
  date: Date;
  onPress?: () => void;
  onToggle?: (completed: boolean) => void;
  isUpdating?: boolean;
};

export function HabitDayCard({
  habit,
  date,
  onPress,
  onToggle,
  isUpdating = false,
}: HabitDayCardProps) {
  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const warning = useAppThemeColor("warning");
  const card = useAppThemeColor("card");
  const Icon = getHabitIcon(habit.icon);
  const entry = habit.entries.find((item) => item.dateKey === toDateKey(date));
  const completed = (entry?.value ?? 0) > 0;
  const reminder = habit.reminders.find((item) => item.enabled);
  const detail = getDetailLabel(habit, reminder);
  const streak = getCurrentStreak(habit, date);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Open ${habit.name}` : habit.name}
      className="flex-row items-center rounded-2xl border border-border bg-card p-3 active:opacity-70"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-accent/90">
        <Icon color={habit.color ?? primary} size={22} />
      </View>
      <View className="ml-3 flex-1">
        <Text className={`text-base font-bold ${completed ? "text-muted-foreground" : "text-foreground"}`}>
          {habit.name}
        </Text>
        <Text numberOfLines={1} className="mt-1 text-xs text-muted-foreground">
          {getFrequencyLabel(habit)}{detail ? ` • ${detail}` : ""}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Flame size={13} color={warning} />
          <Text className="text-xs font-medium text-warning">{streak}d streak</Text>
        </View>
        {habit.description ? (
          <Text numberOfLines={1} className="mt-1 text-xs text-muted-foreground">
            {habit.description}
          </Text>
        ) : null}
      </View>
      {onToggle ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggle(!completed);
          }}
          disabled={isUpdating}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed, disabled: isUpdating }}
          accessibilityLabel={`${completed ? "Uncomplete" : "Complete"} ${habit.name}`}
          className={`ml-3 h-9 w-9 items-center justify-center rounded-full ${completed ? "bg-success" : "bg-muted"}`}
        >
          {completed ? <Check size={20} color={card} strokeWidth={3} /> : null}
        </Pressable>
      ) : (
        <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-muted">
          {completed ? <Check size={20} color={mutedForeground} strokeWidth={3} /> : null}
        </View>
      )}
    </Pressable>
  );
}
