import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppThemeColor } from "@/theme/app-theme";
import { cn } from "@/lib/utils";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

const containerClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary border border-border",
} as const;

const textClasses = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
} as const;

export function Button({
  label,
  onPress,
  variant = "primary",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  className = "",
}: ButtonProps) {
  const primaryForeground = useAppThemeColor("primaryForeground");
  const secondaryForeground = useAppThemeColor("secondaryForeground");
  const contentColor =
    variant === "primary" ? primaryForeground : secondaryForeground;

  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      className={cn(
        "h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 active:opacity-80",
        containerClasses[variant],
        fullWidth ? "w-full" : "self-start",
        disabled && "opacity-40",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : Icon ? (
        <View>
          <Icon size={18} color={contentColor} strokeWidth={2.25} />
        </View>
      ) : null}

      <Text
        numberOfLines={1}
        className={cn("text-[16px] font-semibold", textClasses[variant])}
      >
        {label}
      </Text>
    </Pressable>
  );
}
