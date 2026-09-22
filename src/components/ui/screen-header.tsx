import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

import { useAppThemeColor } from "@/theme/app-theme";

import { HeaderAction, type HeaderActionConfig } from "./header-action";

export type LeftActionConfig = Omit<HeaderActionConfig, "label" | "onPress"> & {
  label?: string;
  onPress?: () => void;
  confirmTitle?: string;
  confirmMessage?: string;
};

const DEFAULT_CONFIRM_TITLE = "Leave Page?";
const DEFAULT_CONFIRM_MESSAGE =
  "Are you sure you want to leave? Any unsaved changes may be lost.";

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  leftAction?: LeftActionConfig;
  rightAction?: HeaderActionConfig;
};

export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  leftAction,
  rightAction,
}: ScreenHeaderProps) {
  const foreground = useAppThemeColor("foreground");

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const handleLeftActionPress = () => {
    if (leftAction?.onPress) return leftAction.onPress();

    Alert.alert(
      leftAction?.confirmTitle ?? DEFAULT_CONFIRM_TITLE,
      leftAction?.confirmMessage ?? DEFAULT_CONFIRM_MESSAGE,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: handleBack, style: "destructive" },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="h-14 flex-row items-center border-b border-border bg-background px-5">
      <View className="w-20 items-start">
        {leftAction ? (
          <HeaderAction
            tone="neutral"
            icon={leftAction.icon}
            disabled={leftAction.disabled}
            label={leftAction.label ?? ""}
            onPress={handleLeftActionPress}
          />
        ) : showBack ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            className="-ml-2 h-11 w-11 items-center justify-center active:opacity-60"
          >
            <ChevronLeft size={24} color={foreground} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 items-center">
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="text-[17px] font-semibold text-foreground"
        >
          {title}
        </Text>
      </View>

      <View className="w-20 items-end">
        {rightAction ? <HeaderAction {...rightAction} /> : null}
      </View>
    </View>
  );
}
