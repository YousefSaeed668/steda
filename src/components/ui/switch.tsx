import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

import { useAppThemeColor } from "@/theme/app-theme";

type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 26;
const THUMB_MARGIN = 2;

export function Switch({
  value,
  onChange,
  disabled = false,
  accessibilityLabel = "Toggle",
}: SwitchProps) {
  const primary = useAppThemeColor("primary");
  const border = useAppThemeColor("border");
  const card = useAppThemeColor("card");


  const translateX = useRef(
    new Animated.Value(value ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN : THUMB_MARGIN),
  ).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN : THUMB_MARGIN,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  }, [value, translateX]);

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: value ? primary : border,
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Animated.View
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: card,
          transform: [{ translateX }],
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}