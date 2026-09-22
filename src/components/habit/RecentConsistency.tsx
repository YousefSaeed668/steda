import { HabitLike, isHabitScheduledOn, toDateKey } from "@/lib/habit";
import { format, isFuture, isToday, subDays } from "date-fns";
import { Check, Minus } from "lucide-react-native";
import { Text, View } from "react-native";
import { Card } from "../ui/card";

type ConsistencyStatus = "today" | "completed" | "missed" | "not-scheduled";

type RecentConsistencyProps = {
  habit: HabitLike;
  today?: Date;
};

type ConsistencyDay = {
  date: Date;
  dayLabel: string;
  status: ConsistencyStatus;
};

export const RecentConsistency = ({
  habit,
  today = new Date(),
}: RecentConsistencyProps) => {
  const entryMap = new Map(
    habit.entries.map((entry) => [entry.dateKey, entry.value]),
  );
  const days: ConsistencyDay[] = Array.from({ length: 14 }, (_, index) => {
    const date = subDays(today, 13 - index);
    const scheduled = isHabitScheduledOn(habit, date);
    const completed = (entryMap.get(toDateKey(date)) ?? 0) > 0;

    return {
      date,
      dayLabel: format(date, "eeeee"),
      status: !scheduled
        ? "not-scheduled"
        : isToday(date)
          ? completed
            ? "completed"
            : "today"
          : completed
            ? "completed"
            : isFuture(date)
              ? "today"
              : "missed",
    };
  });

  const scheduledDays = days.filter((day) => day.status !== "not-scheduled");
  const completedDays = scheduledDays.filter(
    (day) => day.status === "completed",
  ).length;
  const completionRate = scheduledDays.length
    ? Math.round((completedDays / scheduledDays.length) * 100)
    : 0;

  const renderDay = (item: ConsistencyDay) => {
    if (item.status === "today") {
      return (
        <View
          key={toDateKey(item.date)}
          className="items-center justify-between p-1.5 w-[12%] h-16 rounded-xl border border-primary/40 bg-primary/10"
        >
          <Text className="text-[10px] font-extrabold text-primary tracking-tighter">
            TODAY
          </Text>
          <View className="size-5 items-center justify-center rounded-full bg-primary/20">
            <View className="size-2 rounded-full bg-primary" />
          </View>
        </View>
      );
    }

    return (
      <Card
        key={toDateKey(item.date)}
        variant="subtle"
        className="items-center justify-between pt-0.5 pb-1 w-[12%] h-16 rounded-xl"
      >
        <Text className="font-medium text-muted-foreground">
          {item.dayLabel}
        </Text>
        {item.status === "completed" && (
          <View className="size-5 items-center justify-center rounded-full bg-success">
            <Check size={12} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
        {item.status === "missed" && (
          <View className="size-5 items-center justify-center rounded-full bg-muted-foreground/30">
            <View className="size-1.5 rounded-full bg-muted-foreground" />
          </View>
        )}
        {item.status === "not-scheduled" && (
          <View className="size-5 items-center justify-center rounded-full bg-muted">
            <Minus size={12} className="text-muted-foreground" />
          </View>
        )}
      </Card>
    );
  };

  const week1 = days.slice(0, 7);
  const week2 = days.slice(7, 14);

  return (
    <Card className="my-6">
      <View className="flex-row items-start justify-between mb-4">
        <View>
          <Text className="text-lg font-bold text-foreground">
            Recent Consistency
          </Text>
          <Text className="text-xs text-muted-foreground">
            Last 14 days activity
          </Text>
        </View>
        <View className="bg-success/20 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-semibold text-success">
            {completedDays} of {scheduledDays.length} days ({completionRate}%)
          </Text>
        </View>
      </View>
      <View className="gap-2 mb-4">
        <View className="flex-row justify-between">{week1.map(renderDay)}</View>
        <View className="flex-row justify-between">{week2.map(renderDay)}</View>
      </View>
      <View className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <View
          className="h-full bg-success rounded-full"
          style={{ width: `${completionRate}%` }}
        />
      </View>
    </Card>
  );
};
