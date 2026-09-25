import { Switch } from "@/components/ui/switch";
import { TimeField } from "@/components/ui/time";
import { Moon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

type QuietHoursModalProps = {
  visible: boolean;
  pending: boolean;
  enabled: boolean;
  startMinutes: number;
  endMinutes: number;
  onClose: () => void;
  onEnabledChange: (value: boolean) => void;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
  onSave: () => void;
};

export const QuietHoursModal = ({ visible, pending, enabled, startMinutes, endMinutes, onClose, onEnabledChange, onStartChange, onEndChange, onSave }: QuietHoursModalProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/40">
      <View className="rounded-t-3xl bg-background px-5 pb-8 pt-5">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-foreground">Quiet Hours</Text>
          <Pressable onPress={onClose}><Text className="font-semibold text-primary">Cancel</Text></Pressable>
        </View>
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-semibold text-foreground">Enable Quiet Hours</Text>
            <Text className="mt-1 text-xs text-muted-foreground">Notifications will not be sent during this time.</Text>
          </View>
          <Switch value={enabled} onChange={onEnabledChange} accessibilityLabel="Enable quiet hours" />
        </View>
        <View className="mb-4 flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
          <View className="flex-row items-center gap-2"><Moon size={18} /><Text className="font-semibold text-foreground">Start Time</Text></View>
          <TimeField value={startMinutes} onChange={onStartChange} />
        </View>
        <View className="mb-6 flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
          <View className="flex-row items-center gap-2"><Moon size={18} /><Text className="font-semibold text-foreground">End Time</Text></View>
          <TimeField value={endMinutes} onChange={onEndChange} />
        </View>
        <Pressable onPress={onSave} disabled={pending} className="items-center rounded-xl bg-primary py-4">
          <Text className="font-bold text-primary-foreground">{pending ? "Saving..." : "Save Quiet Hours"}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);
