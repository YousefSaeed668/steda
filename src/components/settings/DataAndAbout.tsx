import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Shield,
  Trash2,
  Upload,
} from "lucide-react-native";
import { Linking, Text, View } from "react-native";
import {
  SettingsDivider,
  SettingsRow,
  SettingsSectionTitle,
} from "./SettingsPrimitives";

type DataAndAboutProps = {
  mutedForeground: string;
  destructive: string;
  busy: boolean;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
};

export const DataAndAbout = ({
  mutedForeground,
  destructive,
  busy,
  onExport,
  onImport,
  onReset,
}: DataAndAboutProps) => (
  <>
    <SettingsSectionTitle title="Data & Storage" />
    <Card className="mb-5  ">
      <SettingsRow
        icon={Download}
        iconColor={mutedForeground}
        title="Export Data Archive"
        subtitle="JSON backup file"
        rightContent={<ChevronRight size={18} color={mutedForeground} />}
        onPress={onExport}
        disabled={busy}
      />
      <SettingsDivider />
      <SettingsRow
        icon={Upload}
        iconColor={mutedForeground}
        title="Import Backup"
        rightContent={<ChevronRight size={18} color={mutedForeground} />}
        onPress={onImport}
        disabled={busy}
      />
      <SettingsDivider />
      <SettingsRow
        icon={Trash2}
        iconColor={destructive}
        title="Reset All Data"
        subtitle="Erase complete history and restore defaults"
        titleColor="text-destructive"
        subtitleColor="text-destructive/70"
        rightContent={<ChevronRight size={18} color={destructive} />}
        onPress={onReset}
        disabled={busy}
      />
    </Card>

    <SettingsSectionTitle title="About" />
    <Card className="mb-6 overflow-hidden p-0">
      <SettingsRow
        icon={Info}
        iconColor={mutedForeground}
        title="App Version"
        rightContent={
          <Text className="text-sm text-muted-foreground">
            v1.4.2 (Build 204)
          </Text>
        }
      />
      <SettingsDivider />
      <SettingsRow
        icon={Shield}
        iconColor={mutedForeground}
        title="Privacy Policy"
        subtitle="100% on-device data"
        rightContent={<ExternalLink size={18} color={mutedForeground} />}
        onPress={() =>
          void Linking.openURL(process.env.EXPO_PRIVACY_POLICY_URL ?? "")
        }
      />
      <SettingsDivider />
      <SettingsRow
        icon={FileText}
        iconColor={mutedForeground}
        title="Terms of Service"
        rightContent={<ChevronRight size={18} color={mutedForeground} />}
      />
    </Card>

    <View className="items-center px-5">
      <Text className="text-center text-xs text-muted-foreground">
        Crafted for quiet daily consistency • No trackers or ads
      </Text>
      <Text className="mt-1 text-center text-xs text-muted-foreground">
        Open source core • Local encrypted storage
      </Text>
    </View>
  </>
);
