import { HabitDayCard } from "@/components/habit/HabitDayCard";
import { HistoryCalendar } from "@/components/history/HistoryCalendar";
import { HabitNoteModal } from "@/components/history/HabitNoteModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useHistoryScreen } from "@/hooks/useHistoryScreen";
import { useAppThemeColor } from "@/theme/app-theme";
import { format } from "date-fns";
import {
  Check,
  CircleAlert,
  SlidersHorizontal,
  Target,
} from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const History = () => {
  const primary = useAppThemeColor("primary");
  const warning = useAppThemeColor("warning");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const success = useAppThemeColor("success");
  const {
    today,
    selectedDate,
    visibleMonth,
    weekStartsOn,
    calendarDays,
    monthStats,
    selectedDay,
    scheduledHabits,
    isLoading,
    isError,
    isEditing,
    setIsEditing,
    isYearPickerVisible,
    setIsYearPickerVisible,
    yearOptions,
    selectDate,
    changeMonth,
    selectYear,
    toggleHabit,
    isUpdating,
    noteHabitId,
    noteDraft,
    setNoteDraft,
    openNoteEditor,
    closeNoteEditor,
    saveNote,
    isSavingNote,
  } = useHistoryScreen();

  const noteHabit = scheduledHabits.find((item) => item.id === noteHabitId);

  const selectedDayCompletion = selectedDay.scheduledCount
    ? Math.round(selectedDay.completionRatio * 100)
    : 0;

  return (
    <SafeAreaScreen>
      <ScreenHeader
        title="History"
        showBack
        rightAction={{
          label: isEditing ? "Done" : "Edit",
          tone: "primary",
          onPress: () => setIsEditing(!isEditing),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-5"
      >
        <HistoryCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          today={today}
          weekStartsOn={weekStartsOn}
          calendarDays={calendarDays}
          monthStats={monthStats}
          yearOptions={yearOptions}
          isYearPickerVisible={isYearPickerVisible}
          setIsYearPickerVisible={setIsYearPickerVisible}
          changeMonth={changeMonth}
          selectDate={selectDate}
          selectYear={selectYear}
        />

        <Card className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Historical Snapshot
            </Text>
            {selectedDay.scheduledCount > 0 &&
            selectedDay.completedCount === selectedDay.scheduledCount ? (
              <View className="rounded-full bg-success/10 px-2.5 py-1">
                <Text className="text-xs font-medium text-success">
                  Daily Goal Met
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-1 text-lg font-semibold text-foreground">
            {format(selectedDate, "EEEE, MMM d, yyyy")}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="font-medium text-foreground">
              {selectedDay.completedCount} of {selectedDay.scheduledCount}{" "}
              habits completed
            </Text>
            <Text className="text-sm font-medium text-success">
              {selectedDayCompletion}%
            </Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-success"
              style={{ width: `${selectedDayCompletion}%` }}
            />
          </View>
        </Card>

        <View className="mb-2 mt-5 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">
            Logged Habits
          </Text>
          {isEditing ? (
            <Text className="text-xs font-medium text-primary">
              Editing this day
            </Text>
          ) : null}
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator color={primary} />
          </View>
        ) : isError ? (
          <Card variant="subtle" className="items-center">
            <CircleAlert color={warning} size={24} />
            <Text className="mt-2 text-center text-muted-foreground">
              Unable to load this day’s history.
            </Text>
          </Card>
        ) : scheduledHabits.length === 0 ? (
          <Card variant="subtle" className="items-center">
            <Target color={mutedForeground} size={24} />
            <Text className="mt-2 text-center text-muted-foreground">
              No habits were scheduled for this day.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {scheduledHabits.map((item) => (
              <HabitDayCard
                key={item.id}
              habit={item}
              date={selectedDate}
              weekStartsOn={weekStartsOn}
                appearance="history"
                onNotePress={isEditing ? () => openNoteEditor(item.id) : undefined}
                onToggle={
                  isEditing
                    ? (completed) => toggleHabit(item.id, completed)
                    : undefined
                }
                isUpdating={isUpdating}
              />
            ))}
          </View>
        )}

        <View className="mt-5 items-center w-full">
          <Button
            label={isEditing ? "Done Editing" : "Adjust Day Log"}
            variant="secondary"
            icon={isEditing ? Check : SlidersHorizontal}
            onPress={() => setIsEditing(!isEditing)}
            disabled={isUpdating}
            fullWidth={false}
            className="h-11 px-4 w-full"
          />
        </View>
      </ScrollView>
      <HabitNoteModal
        visible={Boolean(noteHabit)}
        habitName={noteHabit?.name ?? "Habit"}
        note={noteDraft}
        pending={isSavingNote}
        onChangeNote={setNoteDraft}
        onClose={closeNoteEditor}
        onSave={saveNote}
      />
    </SafeAreaScreen>
  );
};

export default History;
