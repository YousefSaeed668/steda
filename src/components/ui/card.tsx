import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

type CardProps = {
  children: ReactNode;
  variant?: "default" | "subtle";
  onPress?: () => void;
  className?: string;
  accessibilityLabel?: string;
};

const variantClasses = {
  default: "bg-card border-border",
  subtle: "bg-muted border-border",
} as const;

export function Card({
  children,
  variant = "default",
  onPress,
  className = "",
  accessibilityLabel,
}: CardProps) {
  const base = `rounded-xl border p-4 ${variantClasses[variant]} ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={cn(base, className)}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
