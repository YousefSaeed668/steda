import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type SettingsRowProps = {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  rightContent?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export const SettingsRow = ({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  titleColor = "text-foreground",
  subtitleColor = "text-muted-foreground",
  rightContent,
  onPress,
  disabled = false,
}: SettingsRowProps) => {
  const content = (
    <View
      className={`min-h-[68px] flex-row items-center px-4 ${disabled ? "opacity-40" : ""}`}
    >
      <View className="mr-3 size-9 items-center justify-center rounded-xl bg-muted">
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`text-[15px] font-semibold ${titleColor}`}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={`mt-0.5 text-sm ${subtitleColor}`}>{subtitle}</Text>
        ) : null}
      </View>
      {rightContent}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
};

export const SettingsSectionTitle = ({ title }: { title: string }) => (
  <Text className="mb-3 px-1  font-bold uppercase tracking-wider text-muted-foreground">
    {title}
  </Text>
);

export const SettingsDivider = () => <View className="ml-16 h-px bg-border" />;
