import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useAppThemeColor } from "@/theme/app-theme";

export type HeaderActionConfig = {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  tone?: "primary" | "neutral";
};

export function HeaderAction({
  label,
  onPress,
  icon: Icon,
  disabled = false,
  tone = "primary",
}: HeaderActionConfig) {
  const primary = useAppThemeColor("primary");
  const mutedForeground = useAppThemeColor("mutedForeground");

  const isPrimary = tone === "primary";
  const iconColor = isPrimary ? primary : mutedForeground;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      className={`min-h-[44px] flex-row items-center justify-center gap-1 active:opacity-60 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {Icon ? (
        <View>
          <Icon size={18} color={iconColor} strokeWidth={2.25} />
        </View>
      ) : null}
      <Text
        className={`text-[15px] font-semibold ${
          isPrimary ? "text-primary" : "text-muted-foreground"
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
