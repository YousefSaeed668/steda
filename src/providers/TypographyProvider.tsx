import { useAppThemeColor } from "@/theme/app-theme";
import type { PropsWithChildren } from "react";
import { Text, TextInput, type TextInputProps, type TextProps } from "react-native";

type DefaultableText = typeof Text & { defaultProps?: TextProps };
type DefaultableTextInput = typeof TextInput & { defaultProps?: TextInputProps };

const BaseText = Text as DefaultableText;
const BaseTextInput = TextInput as DefaultableTextInput;
const initialTextDefaults = BaseText.defaultProps;
const initialTextInputDefaults = BaseTextInput.defaultProps;

export function TypographyProvider({ children }: PropsWithChildren) {
  const foreground = useAppThemeColor("foreground");
  const mutedForeground = useAppThemeColor("mutedForeground");

  BaseText.defaultProps = {
    ...initialTextDefaults,
    style: [
      initialTextDefaults?.style,
      { color: foreground, fontFamily: "Inter_400Regular" },
    ],
  };

  BaseTextInput.defaultProps = {
    ...initialTextInputDefaults,
    placeholderTextColor: mutedForeground,
    style: [
      initialTextInputDefaults?.style,
      { color: foreground, fontFamily: "Inter_400Regular" },
    ],
  };

  return children;
}
