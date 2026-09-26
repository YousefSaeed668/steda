import {
  getCurrentStreak,
  getDetailLabel,
  getFrequencyLabel,
  getHabitIcon,
  toDateKey,
  type HabitLike,
} from "@/lib/habit";
import type { WeekStartsOn } from "@/lib/week";
import { useAppThemeColor } from "@/theme/app-theme";
import { Check, Pencil, Rocket, Minus } from "lucide-react-native";
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
  weekStartsOn: WeekStartsOn;
  onPress?: () => void;
  onNotePress?: () => void;
  onToggle?: (completed: boolean) => void;
  isUpdating?: boolean;
  appearance?: "default" | "history";
};

export function HabitDayCard({
  habit,
  date,
  weekStartsOn,
  onPress,
  onNotePress,
  onToggle,
  isUpdating = false,
  appearance = "default",
}: HabitDayCardProps) {
  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const warning = useAppThemeColor("warning");
  const card = useAppThemeColor("card");
  const Icon = getHabitIcon(habit.icon);
  const entry = habit.entries.find((item) => item.dateKey === toDateKey(date));
  const completed = (entry?.value ?? 0) > 0;
  const isHistory = appearance === "history";
  const reminder = habit.reminders.find((item) => item.enabled);
  const detail = getDetailLabel(habit, reminder);
  const streak = getCurrentStreak(habit, date, weekStartsOn);
  const note = entry?.note?.trim();

  const nameColor = isHistory
    ? completed
      ? "text-foreground"
      : "text-muted-foreground"
    : completed
      ? "text-muted-foreground"
      : "text-foreground";
  const iconTileColor = isHistory && !completed ? "bg-muted" : "bg-accent/90";
  const indicatorColor = completed ? "bg-success" : "bg-muted";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Open ${habit.name}` : habit.name}
      className="flex-row items-center rounded-2xl border border-border bg-card p-3 active:opacity-70"
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-xl ${iconTileColor}`}
      >
        <Icon
          color={isHistory && !completed ? mutedForeground : habit.color ?? primary}
          size={22}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className={`text-base font-bold ${nameColor}`}>{habit.name}</Text>
        <Text numberOfLines={1} className="mt-1 text-xs text-muted-foreground">
          {getFrequencyLabel(habit, weekStartsOn)}{detail ? ` • ${detail}` : ""}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Rocket size={13} color={warning} />
          <Text className="text-xs font-medium text-warning">
            {streak}d streak
          </Text>
        </View>
        {habit.description ? (
          <Text numberOfLines={1} className="mt-1 text-xs text-muted-foreground">
            {habit.description}
          </Text>
        ) : null}
        {note ? (
          <Text numberOfLines={1} className="mt-1 text-xs text-muted-foreground">
            {note}
          </Text>
        ) : null}
      </View>

      {onToggle || onNotePress ? (
        <View className="ml-3 gap-2">
          {onNotePress ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onNotePress();
              }}
              disabled={isUpdating}
              accessibilityRole="button"
              accessibilityLabel={`${note ? "Edit" : "Add"} note for ${habit.name}`}
              className={`h-9 w-9 items-center justify-center rounded-full ${note ? "bg-primary/10" : "bg-muted"}`}
            >
              <Pencil size={17} color={note ? primary : mutedForeground} />
            </Pressable>
          ) : null}
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
              className={`h-9 w-9 items-center justify-center rounded-full ${indicatorColor}`}
            >
              {completed ? (
                <Check size={20} color={card} strokeWidth={3} />
              ) : isHistory ? (
                <Minus size={19} color={mutedForeground} strokeWidth={2.5} />
              ) : null}
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View
          className={`ml-3 h-9 w-9 items-center justify-center rounded-full ${indicatorColor}`}
        >
          {completed ? (
            <Check
              size={20}
              color={isHistory ? card : mutedForeground}
              strokeWidth={3}
            />
          ) : isHistory ? (
            <Minus size={19} color={mutedForeground} strokeWidth={2.5} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
