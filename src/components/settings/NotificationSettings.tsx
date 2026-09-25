import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  CalendarDays,
  ChevronRight,
  CloudDownload,
  Moon,
  Volume2,
} from "lucide-react-native";
import { Text } from "react-native";
import {
  SettingsDivider,
  SettingsRow,
  SettingsSectionTitle,
} from "./SettingsPrimitives";

type NotificationSettingsProps = {
  primary: string;
  mutedForeground: string;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursLabel: string;
  soundLabel: string;
  soundEnabled: boolean;
  busy: boolean;
  weekLabel: string;
  onNotificationsChange: (value: boolean) => void;
  onQuietHoursPress: () => void;
  onSoundPress: () => void;
  onWeekPress: () => void;
};

export const NotificationSettings = ({
  primary,
  mutedForeground,
  notificationsEnabled,
  quietHoursEnabled,
  quietHoursLabel,
  soundLabel,
  busy,
  weekLabel,
  onNotificationsChange,
  onQuietHoursPress,
  onSoundPress,
  onWeekPress,
}: NotificationSettingsProps) => (
  <>
    <SettingsSectionTitle title="Notifications" />
    <Card className="mb-2">
      <SettingsRow
        icon={CloudDownload}
        iconColor={primary}
        title="Global Reminders"
        subtitle="Scheduled notifications for habits"
        rightContent={
          <Switch
            value={notificationsEnabled}
            disabled={busy}
            onChange={onNotificationsChange}
            accessibilityLabel="Global reminders"
          />
        }
      />
      <SettingsDivider />
      <SettingsRow
        icon={Moon}
        iconColor={mutedForeground}
        title="Quiet Hours"
        subtitle={quietHoursEnabled ? quietHoursLabel : "Disabled"}
        rightContent={<ChevronRight size={18} color={mutedForeground} />}
        onPress={onQuietHoursPress}
        disabled={busy}
      />
      <SettingsDivider />
      <SettingsRow
        icon={Volume2}
        iconColor={mutedForeground}
        title="Sound & Haptics"
        subtitle={soundLabel}
        rightContent={<ChevronRight size={18} color={mutedForeground} />}
        onPress={onSoundPress}
        disabled={busy}
      />
    </Card>
    <Text className="mb-5 px-1 text-xs leading-4 text-muted-foreground">
      When disabled, scheduled daily nudges for all habits will be paused. Your
      active streaks will remain intact.
    </Text>

    <SettingsSectionTitle title="Habit Preferences" />
    <Card className="mb-5 overflow-hidden p-0">
      <SettingsRow
        icon={CalendarDays}
        iconColor={mutedForeground}
        title="Start of Week"
        rightContent={
          <Text className="text-sm text-muted-foreground">{weekLabel} ›</Text>
        }
        onPress={onWeekPress}
        disabled={busy}
      />
    </Card>
  </>
);
