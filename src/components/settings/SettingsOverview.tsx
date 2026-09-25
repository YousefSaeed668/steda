import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { ThemeMode } from "@/db/schema";
import { Shield } from "lucide-react-native";
import { Text, View } from "react-native";
import { SettingsSectionTitle } from "./SettingsPrimitives";

type SettingsOverviewProps = {
  success: string;
  theme: ThemeMode;
  themeOptions: readonly { label: string; value: ThemeMode }[];
  onThemeChange: (value: ThemeMode) => void;
};

export const SettingsOverview = ({
  success,
  theme,
  themeOptions,
  onThemeChange,
}: SettingsOverviewProps) => (
  <>
    <Card className="mb-5 p-4">
      <View className="flex-row items-center gap-3">
        <View className="size-10 items-center justify-center rounded-xl bg-success/10">
          <Shield size={21} color={success} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            On-Device Storage
          </Text>
          <Text className="text-xs text-muted-foreground">
            Private • offline-first
          </Text>
        </View>
        <View className="rounded-full bg-success/10 px-2.5 py-1">
          <Text className="text-sm font-semibold text-success">
            ● 100% On-Device
          </Text>
        </View>
      </View>
      <Text className="mt-3 text-xs leading-4 text-muted-foreground">
        All habit tracking data, schedules, and history are stored locally and
        privately on this device. No cloud sync or accounts required.
      </Text>
    </Card>

    <SettingsSectionTitle title="Appearance" />
    <Card className="mb-5 p-2">
      <SegmentedControl<ThemeMode>
        options={themeOptions}
        value={theme}
        onChange={onThemeChange}
      />
    </Card>
  </>
);
