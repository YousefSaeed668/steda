import { Button } from "@/components/ui/button";
import { useAppThemeColor } from "@/theme/app-theme";
import { X } from "lucide-react-native";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type HabitNoteModalProps = {
  habitName: string;
  note: string;
  pending: boolean;
  visible: boolean;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function HabitNoteModal({
  habitName,
  note,
  pending,
  visible,
  onChangeNote,
  onClose,
  onSave,
}: HabitNoteModalProps) {
  const foreground = useAppThemeColor("foreground");
  const mutedForeground = useAppThemeColor("mutedForeground");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-background px-5 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-bold text-foreground">Day Note</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {habitName}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel="Close note editor"
              className="size-9 items-center justify-center rounded-full bg-muted active:opacity-70"
            >
              <X size={18} color={foreground} />
            </Pressable>
          </View>

          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder="What happened today?"
            placeholderTextColor={mutedForeground}
            multiline
            maxLength={500}
            editable={!pending}
            textAlignVertical="top"
            accessibilityLabel={`Note for ${habitName}`}
            className="h-36 rounded-xl border border-input-border bg-input px-4 py-3 text-base text-foreground"
          />

          <Text className="mt-2 text-right text-xs text-muted-foreground">
            {note.length}/500
          </Text>

          <Button
            label={note.trim() ? "Save Note" : "Clear Note"}
            onPress={onSave}
            loading={pending}
            className="mt-5"
          />
        </View>
      </View>
    </Modal>
  );
}
