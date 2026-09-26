import type { PropsWithChildren } from "react";
import { Text, TextInput, type TextInputProps, type TextProps } from "react-native";

type DefaultableText = typeof Text & { defaultProps?: TextProps };
type DefaultableTextInput = typeof TextInput & { defaultProps?: TextInputProps };

const BaseText = Text as DefaultableText;
const BaseTextInput = TextInput as DefaultableTextInput;
const initialTextDefaults = BaseText.defaultProps;
const initialTextInputDefaults = BaseTextInput.defaultProps;

BaseText.defaultProps = {
  ...initialTextDefaults,
  style: [initialTextDefaults?.style, { fontFamily: "Inter_400Regular" }],
};

BaseTextInput.defaultProps = {
  ...initialTextInputDefaults,
  style: [
    initialTextInputDefaults?.style,
    { fontFamily: "Inter_400Regular" },
  ],
};

export function TypographyProvider({ children }: PropsWithChildren) {
  return children;
}
