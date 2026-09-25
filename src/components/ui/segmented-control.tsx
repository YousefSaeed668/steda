import { Pressable, Text, View } from "react-native";

export interface SegmentedControlOption<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <View className={`flex-row rounded-2xl bg-input p-2 ${className}`}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${
              isActive ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={` font-semibold text-[14px] ${
                isActive ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
