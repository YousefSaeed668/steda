import { toDateKey } from "@/lib/habit";
import { useAppThemeColor } from "@/theme/app-theme";
import { format } from "date-fns";
import { Check, Hourglass, Minus, X } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../ui/card";

type HistoryEntry = {
  id: string;
  dateKey: string;
  value: number;
  completedAt: Date | null;
  note: string | null;
};

type RecentHistoryProps = {
  entries: HistoryEntry[];
  isLoading: boolean;
};

export const RecentHistory = ({ entries, isLoading }: RecentHistoryProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const foreground = useAppThemeColor("foreground");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const todayKey = toDateKey(new Date());
  const history = entries
    .slice()
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .map((entry) => ({
      id: entry.id,
      date:
        entry.dateKey === todayKey
          ? "Today"
          : format(new Date(`${entry.dateKey}T00:00:00`), "EEEE, MMM d"),
      subtitle: entry.completedAt
        ? `${format(new Date(entry.completedAt), "h:mm a")} • ${entry.value} logged`
        : "Not started",
      note: entry.note?.trim() ?? "",
      status: entry.value > 0 ? "Done" : "Missed",
      type: entry.value > 0 ? "done" : "missed",
    }));

  const renderItem = ({ item }: { item: (typeof history)[number] }) => (
    <View className="flex-row items-center justify-between py-3 px-4">
      <View className="flex-row items-center gap-3">
        {item.type === "done" && (
          <View className="size-10 items-center justify-center rounded-full bg-success">
            <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        )}
        {item.type === "missed" && (
          <View className="size-10 items-center justify-center rounded-full bg-muted">
            <Minus size={18} color={mutedForeground} />
          </View>
        )}
        <View>
          <Text className="text-lg font-bold text-foreground">{item.date}</Text>
          <Text className="text-muted-foreground">{item.subtitle}</Text>
          {item.note ? (
            <Text numberOfLines={2} className="mt-1 text-xs text-muted-foreground">
              {item.note}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        className={`px-3 py-1 rounded-full ${item.type === "done" ? "bg-success/20" : "bg-muted"}`}
      >
        <Text
          className={`font-semibold ${item.type === "done" ? "text-success" : "text-muted-foreground"}`}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Card className="my-6">
        <View className="flex-row items-center justify-between p-4 pb-2">
          <Text className="text-lg font-bold text-foreground">
            Recent History
          </Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <Text className="text-sm font-semibold text-primary">
              View All Logs
            </Text>
          </Pressable>
        </View>
        {isLoading ? (
          <View className="px-4 py-6 flex-row items-center gap-2">
            <Hourglass size={18} color={mutedForeground} />
            <Text className="text-muted-foreground">Loading history...</Text>
          </View>
        ) : (
          <FlatList
            data={history.slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-border/60 mx-4" />
            )}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="px-4 py-6 text-muted-foreground">
                No sessions logged yet.
              </Text>
            }
          />
        )}
      </Card>
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">
              All Habit Logs
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="size-8 items-center justify-center rounded-full bg-muted"
            >
              <X size={18} color={foreground} />
            </Pressable>
          </View>
          {isLoading ? (
            <View className="px-4 py-6 flex-row items-center gap-2">
              <Hourglass size={18} color={mutedForeground} />
              <Text className="text-muted-foreground">Loading history...</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => (
                <View className="h-[1px] bg-border/60 mx-4" />
              )}
              contentContainerClassName="py-2"
              ListEmptyComponent={
                <Text className="px-4 py-6 text-muted-foreground">
                  No sessions logged yet.
                </Text>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};
