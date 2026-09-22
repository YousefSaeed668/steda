import { Text, View } from "react-native";
import { HeaderAction, HeaderActionConfig } from "./header-action";


type TabHeaderProps = {
  title: string;
  rightAction?: HeaderActionConfig;
};


export function TabHeader({ title, rightAction }: TabHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-background px-5 pb-3 pt-4">
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="flex-1 text-[28px] font-bold text-foreground"
      >
        {title}
      </Text>

      {rightAction ? <HeaderAction {...rightAction} /> : null}
    </View>
  );
}
