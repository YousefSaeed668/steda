import { Switch } from "@/components/ui/switch";
import type { BundledSound } from "@/lib/settings";
import { ChevronRight, Upload, Volume2 } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

type SoundHapticsModalProps = {
  visible: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  customSoundUri: string;
  bundledSounds: BundledSound[];
  mutedForeground: string;
  onClose: () => void;
  onSoundChange: (value: boolean) => void;
  onHapticsChange: (value: boolean) => void;
  onBundledSoundPress: (sound: BundledSound) => void;
  onDeviceSoundPress: () => void;
  onPreviewPress: () => void;
};

export const SoundHapticsModal = ({ visible, soundEnabled, hapticsEnabled, customSoundUri, bundledSounds, mutedForeground, onClose, onSoundChange, onHapticsChange, onBundledSoundPress, onDeviceSoundPress, onPreviewPress }: SoundHapticsModalProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/40">
      <View className="rounded-t-3xl bg-background px-5 pb-8 pt-5">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-foreground">Sound & Haptics</Text>
          <Pressable onPress={onClose}><Text className="font-semibold text-primary">Close</Text></Pressable>
        </View>
        <SoundToggle title="Sound" subtitle="Play reminder sounds" value={soundEnabled} onChange={onSoundChange} />
        <SoundToggle title="Haptics" subtitle="Vibrate when feedback is triggered" value={hapticsEnabled} onChange={onHapticsChange} />
        <Text className="mb-3 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose Sound</Text>
        {bundledSounds.map((sound) => {
          const selected = customSoundUri === `bundled:${sound.id}`;
          return (
            <Pressable key={sound.id} onPress={() => onBundledSoundPress(sound)} className="mb-2 flex-row items-center justify-between rounded-xl bg-muted px-4 py-4">
              <Text className="font-semibold text-foreground">{sound.label}</Text>
              <View className="flex-row items-center gap-3">
                {selected ? <Text className="font-bold text-primary">Selected</Text> : null}
                <ChevronRight size={18} color={mutedForeground} />
              </View>
            </Pressable>
          );
        })}
        <Pressable onPress={onDeviceSoundPress} className="mb-2 flex-row items-center justify-between rounded-xl bg-muted px-4 py-4">
          <View><Text className="font-semibold text-foreground">Choose from device</Text><Text className="mt-1 text-xs text-muted-foreground">Select an audio file from your phone</Text></View>
          <Upload size={18} color={mutedForeground} />
        </Pressable>
        <Pressable onPress={onPreviewPress} className="mt-4 items-center rounded-xl bg-primary py-4">
          <Text className="font-bold text-primary-foreground">Preview Selected Sound</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const SoundToggle = ({ title, subtitle, value, onChange }: { title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void }) => (
  <View className="min-h-[68px] flex-row items-center px-4">
    <View className="mr-3 size-9 items-center justify-center rounded-xl bg-muted"><Volume2 size={18} /></View>
    <View className="flex-1"><Text className="text-[15px] font-semibold text-foreground">{title}</Text><Text className="mt-0.5 text-xs text-muted-foreground">{subtitle}</Text></View>
    <Switch value={value} onChange={onChange} accessibilityLabel={title} />
  </View>
);
