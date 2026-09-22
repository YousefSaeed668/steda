import { View } from "react-native";

export const Tone = ({
  colorClass,
  active,
}: {
  colorClass: string;
  active?: boolean;
}) => {
  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${colorClass}`}
    >
      {active && <View className="h-4 w-4 rounded-full bg-white" />}
    </View>
  );
};