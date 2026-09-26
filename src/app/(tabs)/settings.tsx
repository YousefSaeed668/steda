import { TabHeader } from "@/components/ui/tab-header";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View, Alert } from "react-native";
import { useSettingsScreen, WEEK_OPTIONS } from "@/hooks/useSettingsScreen";
import { SettingsOverview } from "@/components/settings/SettingsOverview";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { bundledSounds, formatMinutes, getSoundLabel } from "@/lib/settings";
import { DataAndAbout } from "@/components/settings/DataAndAbout";
import { QuietHoursModal } from "@/components/settings/QuietHoursModal";
import { SoundHapticsModal } from "@/components/settings/SoundHapticsModal";

const Settings = () => {
  const screen = useSettingsScreen();
  const { colors } = screen;

  if (screen.settingsQuery.isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <TabHeader title="Settings" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <TabHeader title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <SettingsOverview
          success={colors.success}
          theme={screen.theme}
          themeOptions={screen.themeModeValues.map((value) => ({
            label: value[0] + value.slice(1).toLowerCase(),
            value,
          }))}
          onThemeChange={screen.handleThemeChange}
        />
        <NotificationSettings
          primary={colors.primary}
          mutedForeground={colors.mutedForeground}
          notificationsEnabled={screen.notificationsEnabled}
          quietHoursEnabled={screen.quietHoursEnabled}
          quietHoursLabel={`${formatMinutes(screen.quietHoursStart)} – ${formatMinutes(screen.quietHoursEnd)}`}
          soundLabel={getSoundLabel(screen.customSoundUri)}
          soundEnabled={screen.soundEnabled}
          busy={screen.busy}
          weekLabel={screen.selectedWeekLabel}
          onNotificationsChange={screen.handleNotificationsChange}
          onQuietHoursPress={screen.openQuietHours}
          onSoundPress={() => screen.setSoundModalVisible(true)}
          onWeekPress={() => {
            Alert.alert(
              "Start of Week",
              "Choose the first day of your week.",
              WEEK_OPTIONS.map((option) => ({
                text: option.label,
                onPress: () => screen.settingsMutation.mutate({ type: "week", value: option.value }),
              })),
            );
          }}
        />
        <DataAndAbout
          mutedForeground={colors.mutedForeground}
          destructive={colors.destructive}
          busy={screen.busy}
          onExport={async () => {
            try {
              await screen.exportMutation.mutateAsync();
            } catch {
              Alert.alert("Error", "Could not export your data.");
            }
          }}
          onImport={screen.handleImport}
          onReset={screen.handleReset}
        />
      </ScrollView>
      <QuietHoursModal
        visible={screen.quietHoursVisible}
        pending={screen.settingsMutation.isPending}
        enabled={screen.quietEnabledDraft}
        startMinutes={screen.quietStartDraft}
        endMinutes={screen.quietEndDraft}
        onClose={() => screen.setQuietHoursVisible(false)}
        onEnabledChange={screen.setQuietEnabledDraft}
        onStartChange={screen.setQuietStartDraft}
        onEndChange={screen.setQuietEndDraft}
        onSave={screen.saveQuietHours}
      />
      <SoundHapticsModal
        visible={screen.soundModalVisible}
        soundEnabled={screen.soundEnabled}
        hapticsEnabled={screen.hapticsEnabled}
        customSoundUri={screen.customSoundUri}
        bundledSounds={bundledSounds}
        mutedForeground={colors.mutedForeground}
        onClose={() => screen.setSoundModalVisible(false)}
        onSoundChange={screen.handleSoundEnabledChange}
        onHapticsChange={(value) => screen.settingsMutation.mutate({ type: "haptics-enabled", value })}
        onBundledSoundPress={screen.chooseBundledSound}
        onDeviceSoundPress={screen.chooseDeviceSound}
        onPreviewPress={screen.previewSound}
      />
    </SafeAreaView>
  );
};

export default Settings;
