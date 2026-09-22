import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { addMinutes, format, startOfDay } from "date-fns";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

import { useAppThemeColor } from "@/theme/app-theme";

import { Button } from "./button";

type TimeFieldProps = {
  value: number;
  onChange: (minutesAfterMidnight: number) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

function minutesToDate(minutes: number): Date {
  return addMinutes(startOfDay(new Date()), minutes);
}

function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function formatMinutes(minutes: number): string {
  return format(minutesToDate(minutes), "h:mm a");
}

export function TimeField({
  value,
  onChange,
  disabled = false,
  accessibilityLabel = "Reminder time",
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => minutesToDate(value));

  const muted = useAppThemeColor("muted");
  const foreground = useAppThemeColor("foreground");
  const mutedForeground = useAppThemeColor("mutedForeground");
  const card = useAppThemeColor("card");

  const handlePress = () => {
    if (disabled) return;
    setDraft(minutesToDate(value));
    setOpen(true);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && selected) {
        onChange(dateToMinutes(selected));
      }
      return;
    }
    if (selected) setDraft(selected);
  };

  const handleConfirmIOS = () => {
    onChange(dateToMinutes(draft));
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        className="flex-row items-center self-start rounded-xl px-4 py-3 active:opacity-70"
        style={{ backgroundColor: muted, opacity: disabled ? 0.4 : 1 }}
      >
        <Text
          className="mr-1 text-[17px] font-bold"
          style={{ color: foreground }}
        >
          {formatMinutes(value)}
        </Text>
        <ChevronDown size={18} color={mutedForeground} strokeWidth={2.5} />
      </Pressable>

      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={draft}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={open}
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            className="flex-1"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onPress={() => setOpen(false)}
          />
          <View
            className="rounded-t-2xl pb-8 pt-2"
            style={{ backgroundColor: card }}
          >
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text
                  className="text-[16px] font-medium"
                  style={{ color: mutedForeground }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Button
                label="Done"
                onPress={handleConfirmIOS}
                fullWidth={false}
                className="h-9 px-4"
              />
            </View>
            <DateTimePicker
              value={draft}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleChange}
              textColor={foreground}
            />
          </View>
        </Modal>
      )}
    </>
  );
}